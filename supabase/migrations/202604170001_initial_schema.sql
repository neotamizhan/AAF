create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.elections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  election_year int not null,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'locked', 'results_published', 'closed')),
  lock_at timestamptz,
  results_imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.districts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int
);

create table public.constituencies (
  id uuid primary key default gen_random_uuid(),
  ec_code text unique,
  name text not null unique,
  district_id uuid not null references public.districts(id),
  zone_id uuid not null references public.zones(id),
  is_vip boolean not null default false,
  display_order int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true
);

create table public.alliances (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int
);

create table public.party_alliance_map (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  party_id uuid not null references public.parties(id),
  alliance_id uuid not null references public.alliances(id),
  unique (election_id, party_id)
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  display_name text not null,
  unique (normalized_name)
);

create table public.election_candidates (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  constituency_id uuid not null references public.constituencies(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id),
  party_id uuid not null references public.parties(id),
  source_status text not null default 'imported'
    check (source_status in ('imported', 'verified', 'manual_override')),
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, constituency_id, candidate_id, party_id)
);

create table public.previous_results (
  id uuid primary key default gen_random_uuid(),
  constituency_id uuid not null references public.constituencies(id) on delete cascade,
  election_year int not null,
  rank int not null check (rank between 1 and 3),
  candidate_name text not null,
  party_name text,
  votes int,
  vote_share numeric(5,2),
  source_url text,
  created_at timestamptz not null default now(),
  unique (constituency_id, election_year, rank)
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  constituency_id uuid not null references public.constituencies(id) on delete cascade,
  predicted_candidate_id uuid not null references public.candidates(id),
  predicted_party_id uuid not null references public.parties(id),
  predicted_alliance_id uuid not null references public.alliances(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, user_id, constituency_id)
);

create table public.prediction_submissions (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_final boolean not null default false,
  final_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, user_id)
);

create table public.actual_results (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  constituency_id uuid not null references public.constituencies(id) on delete cascade,
  winning_candidate_id uuid references public.candidates(id),
  winning_candidate_name text not null,
  winning_party_id uuid references public.parties(id),
  winning_alliance_id uuid references public.alliances(id),
  votes_won int,
  runner_up_votes int,
  margin int,
  source_url text,
  result_status text not null default 'final'
    check (result_status in ('leading', 'final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (election_id, constituency_id)
);

create table public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  total_score int not null default 0,
  exact_winning_alliance_hits int not null default 0,
  exact_winning_alliance_seat_hits int not null default 0,
  exact_alliance_distribution_hits int not null default 0,
  vip_hits int not null default 0,
  rank int,
  calculated_at timestamptz not null default now(),
  unique (election_id, user_id)
);

create index idx_constituencies_district on public.constituencies(district_id);
create index idx_constituencies_zone on public.constituencies(zone_id);
create index idx_election_candidates_scope on public.election_candidates(election_id, constituency_id);
create index idx_predictions_user_scope on public.predictions(election_id, user_id);
create index idx_actual_results_scope on public.actual_results(election_id, constituency_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_elections_updated_at
before update on public.elections
for each row execute function public.set_updated_at();

create trigger set_constituencies_updated_at
before update on public.constituencies
for each row execute function public.set_updated_at();

create trigger set_election_candidates_updated_at
before update on public.election_candidates
for each row execute function public.set_updated_at();

create trigger set_predictions_updated_at
before update on public.predictions
for each row execute function public.set_updated_at();

create trigger set_prediction_submissions_updated_at
before update on public.prediction_submissions
for each row execute function public.set_updated_at();

create trigger set_actual_results_updated_at
before update on public.actual_results
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.election_is_open(p_election_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.elections e
    where e.id = p_election_id
      and e.status = 'open'
      and (e.lock_at is null or now() < e.lock_at)
  );
$$;

create or replace function public.user_submission_is_final(
  p_election_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.prediction_submissions s
    where s.election_id = p_election_id
      and s.user_id = p_user_id
      and s.is_final = true
  );
$$;

create or replace function public.user_can_edit_predictions(
  p_election_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
as $$
  select
    p_user_id = auth.uid()
    and public.election_is_open(p_election_id)
    and not public.user_submission_is_final(p_election_id, p_user_id);
$$;

create or replace function public.normalize_candidate_name(p_name text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(p_name), '\s+', ' ', 'g'));
$$;

create or replace view public.v_constituency_catalog as
select
  e.id as election_id,
  e.code as election_code,
  c.id as constituency_id,
  c.ec_code,
  c.name as constituency_name,
  d.name as district_name,
  z.name as zone_name,
  c.is_vip,
  c.display_order,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', pr.id,
        'constituencyId', pr.constituency_id,
        'electionYear', pr.election_year,
        'rank', pr.rank,
        'candidateName', pr.candidate_name,
        'partyName', pr.party_name,
        'votes', pr.votes,
        'voteShare', pr.vote_share,
        'sourceUrl', pr.source_url
      )
      order by pr.rank
    )
    from public.previous_results pr
    where pr.constituency_id = c.id
  ), '[]'::jsonb) as previous_results,
  coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'candidateId', cand.id,
        'candidateName', cand.display_name,
        'partyId', p.id,
        'partyCode', p.code,
        'partyName', p.name,
        'allianceId', a.id,
        'allianceCode', a.code,
        'allianceName', a.name,
        'sourceStatus', ec.source_status
      )
      order by a.sort_order, p.code, cand.display_name
    )
    from public.election_candidates ec
    join public.candidates cand on cand.id = ec.candidate_id
    join public.parties p on p.id = ec.party_id
    join public.party_alliance_map pam
      on pam.election_id = ec.election_id
      and pam.party_id = ec.party_id
    join public.alliances a on a.id = pam.alliance_id
    where ec.election_id = e.id
      and ec.constituency_id = c.id
  ), '[]'::jsonb) as candidates
from public.elections e
join public.election_candidates ec_scope on ec_scope.election_id = e.id
join public.constituencies c on c.id = ec_scope.constituency_id
join public.districts d on d.id = c.district_id
join public.zones z on z.id = c.zone_id
group by e.id, e.code, c.id, c.ec_code, c.name, d.name, z.name, c.is_vip, c.display_order;

create or replace view public.v_user_prediction_progress as
select
  e.id as election_id,
  e.code as election_code,
  auth.uid() as user_id,
  count(distinct ec.constituency_id)::int as total_constituencies,
  count(distinct p.constituency_id)::int as completed_constituencies,
  coalesce(s.is_final, false) as is_final,
  s.final_submitted_at
from public.elections e
join public.election_candidates ec on ec.election_id = e.id
left join public.predictions p
  on p.election_id = e.id
  and p.constituency_id = ec.constituency_id
  and p.user_id = auth.uid()
left join public.prediction_submissions s
  on s.election_id = e.id
  and s.user_id = auth.uid()
group by e.id, e.code, s.is_final, s.final_submitted_at;

create or replace view public.v_user_predicted_seat_summary as
select
  e.id as election_id,
  e.code as election_code,
  a.id as alliance_id,
  a.code as alliance_code,
  a.name as alliance_name,
  a.sort_order,
  count(p.id)::int as seats
from public.elections e
join public.alliances a on true
left join public.predictions p
  on p.election_id = e.id
  and p.predicted_alliance_id = a.id
  and p.user_id = auth.uid()
group by e.id, e.code, a.id, a.code, a.name, a.sort_order;

create or replace view public.v_actual_seat_summary as
select
  e.id as election_id,
  e.code as election_code,
  a.id as alliance_id,
  a.code as alliance_code,
  a.name as alliance_name,
  a.sort_order,
  count(ar.id)::int as seats
from public.elections e
join public.alliances a on true
left join public.actual_results ar
  on ar.election_id = e.id
  and ar.winning_alliance_id = a.id
group by e.id, e.code, a.id, a.code, a.name, a.sort_order;

create or replace view public.v_leaderboard_public as
select
  l.election_id,
  coalesce(p.display_name, split_part(p.email, '@', 1), 'Contestant') as display_name,
  l.total_score,
  l.vip_hits,
  l.exact_alliance_distribution_hits,
  l.rank,
  l.calculated_at
from public.leaderboard l
join public.profiles p on p.id = l.user_id
join public.elections e on e.id = l.election_id
where e.status in ('results_published', 'closed') or public.is_admin();

alter table public.profiles enable row level security;
alter table public.elections enable row level security;
alter table public.districts enable row level security;
alter table public.zones enable row level security;
alter table public.constituencies enable row level security;
alter table public.parties enable row level security;
alter table public.alliances enable row level security;
alter table public.party_alliance_map enable row level security;
alter table public.candidates enable row level security;
alter table public.election_candidates enable row level security;
alter table public.previous_results enable row level security;
alter table public.predictions enable row level security;
alter table public.prediction_submissions enable row level security;
alter table public.actual_results enable row level security;
alter table public.leaderboard enable row level security;

create policy "users can view own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "admins can manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read elections"
on public.elections for select
using (true);

create policy "admins can manage elections"
on public.elections for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read districts"
on public.districts for select
using (true);

create policy "admins can manage districts"
on public.districts for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read zones"
on public.zones for select
using (true);

create policy "admins can manage zones"
on public.zones for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read constituencies"
on public.constituencies for select
using (true);

create policy "admins can manage constituencies"
on public.constituencies for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read parties"
on public.parties for select
using (true);

create policy "admins can manage parties"
on public.parties for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read alliances"
on public.alliances for select
using (true);

create policy "admins can manage alliances"
on public.alliances for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read party alliance maps"
on public.party_alliance_map for select
using (true);

create policy "admins can manage party alliance maps"
on public.party_alliance_map for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read candidates"
on public.candidates for select
using (true);

create policy "admins can manage candidates"
on public.candidates for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read election candidates"
on public.election_candidates for select
using (true);

create policy "admins can manage election candidates"
on public.election_candidates for all
using (public.is_admin())
with check (public.is_admin());

create policy "public can read previous results"
on public.previous_results for select
using (true);

create policy "admins can manage previous results"
on public.previous_results for all
using (public.is_admin())
with check (public.is_admin());

create policy "users can read own predictions"
on public.predictions for select
using (user_id = auth.uid() or public.is_admin());

create policy "users can insert own open predictions"
on public.predictions for insert
with check (public.user_can_edit_predictions(election_id, user_id));

create policy "users can update own open predictions"
on public.predictions for update
using (public.user_can_edit_predictions(election_id, user_id))
with check (public.user_can_edit_predictions(election_id, user_id));

create policy "admins can manage predictions"
on public.predictions for all
using (public.is_admin())
with check (public.is_admin());

create policy "users can read own submission state"
on public.prediction_submissions for select
using (user_id = auth.uid() or public.is_admin());

create policy "users can create own submission state"
on public.prediction_submissions for insert
with check (user_id = auth.uid());

create policy "users can finalize own submission while open"
on public.prediction_submissions for update
using (user_id = auth.uid() and public.election_is_open(election_id))
with check (user_id = auth.uid());

create policy "admins can manage submission state"
on public.prediction_submissions for all
using (public.is_admin())
with check (public.is_admin());

create policy "results visible after publish"
on public.actual_results for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.elections e
    where e.id = actual_results.election_id
      and e.status in ('results_published', 'closed')
  )
);

create policy "admins can manage actual results"
on public.actual_results for all
using (public.is_admin())
with check (public.is_admin());

create policy "leaderboard visible after publish"
on public.leaderboard for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.elections e
    where e.id = leaderboard.election_id
      and e.status in ('results_published', 'closed')
  )
);

create policy "admins can manage leaderboard"
on public.leaderboard for all
using (public.is_admin())
with check (public.is_admin());
