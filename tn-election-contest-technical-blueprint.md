# Tamil Nadu Assembly Election Prediction Contest App - Technical Blueprint

## 1) Goal

Build a **mobile-friendly web application** where users log in with Google, predict the winning candidate in all **234 Tamil Nadu Assembly constituencies**, and compete on a scoring system once official results are published.

This blueprint is written for:
- **LLM-assisted development**
- **Supabase** as the backend and database
- **GitHub Actions** as the deployment mechanism
- **Free-tier friendly hosting**
- A practical MVP that can be built quickly and then hardened

---

## 2) Product scope

### Primary user journey
1. User signs in with email
2. User browses and filters constituencies
3. User predicts the winner for each constituency
4. User sees a running seat summary by alliance/block
5. User finalizes submission before the cutoff
6. Admin imports official results after the election
7. App computes scores and announces the winner

### Required constituency attributes
For each Assembly constituency:

- Constituency name
- District
- Zone
- Previous election's top 3 candidates
- Current candidates for:
  - ADMK
  - DMK
  - NTK
  - Sasikala + PMK
  - TVK
- VIP constituency flag (`true/false`)

### Filtering
Constituency list must be filterable by:
- Name
- District
- Zone
- VIP flag

### Prediction rules
For each constituency, a user picks **one predicted winning candidate**.

After all 234 are predicted, the app should show the number of seats won by each alliance/block.

### Authentication
- Google authentication only

### Post-result flow
After official election results are available:
- Import results from official sources
- Compare actual results vs predictions
- Compute score
- Publish leaderboard
- Announce winner

---

## 3) Recommended architecture

## Frontend
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** or lightweight custom component set
- Responsive/mobile-first layout

## Backend
- **Supabase Postgres**
- **Supabase Auth** for Google sign-in
- **Supabase Edge Functions** for admin imports, final submission, and score calculation

## Hosting
- **Frontend:** Vercel Hobby
- **Backend/Auth/DB:** Supabase

## Deployment
- **GitHub Actions only**
- No click-to-deploy dependency
- Frontend deploy via **Vercel CLI**
- Database migrations and Edge Functions deploy via **Supabase CLI**

---

## 4) Key design decisions

### 4.1 Use "Assembly constituency", not "constitution"
In the app, data model, and UI copy, use:
- **Constituency**
- **Assembly Constituency**
- **AC** where useful

### 4.2 Keep party and alliance separate
Do **not** hardcode alliance names into constituency rows.

Tamil Nadu alliances may change close to the election. Store:
- Party
- Alliance/block mapping for this election cycle

That way, the app survives alliance changes without rewriting 234 records.

### 4.3 Treat the contest "blocks" as explicit scoring groups
For this contest, define scoring groups like:
- DMK bloc
- ADMK bloc
- NTK bloc
- Sasikala+PMK bloc
- TVK bloc
- Others (optional fallback)

Even if the real political alignment changes, the contest scoring stays internally consistent.

### 4.4 CSV-first data ingestion for reliability
Do not depend on fragile last-minute scraping as the only method.

Preferred flow:
1. Build CSV import templates
2. Admin uploads validated official data
3. Optional scraper assists admin, but import remains the final control point

---

## 5) High-level system diagram

```text
User Browser
   |
   v
Next.js Web App
   |
   +--> Supabase Auth (email login)
   |
   +--> Supabase Postgres (master data, predictions, results, leaderboard)
   |
   +--> Supabase Edge Functions
           - finalize submission
           - import current candidates
           - import actual results
           - calculate scores
           - refresh leaderboard

GitHub Repository
   |
   +--> GitHub Actions
           - lint/test/build
           - deploy frontend to Vercel
           - deploy migrations to Supabase
           - deploy Edge Functions to Supabase
```

---

## 6) Repository structure

Recommended monorepo-style structure:

```text
tn-election-contest/
├─ app/
│  ├─ (public)/
│  ├─ contest/
│  ├─ admin/
│  ├─ results/
│  └─ api/
├─ components/
├─ lib/
│  ├─ supabase/
│  ├─ auth/
│  ├─ scoring/
│  ├─ csv/
│  └─ validation/
├─ public/
├─ styles/
├─ tests/
├─ supabase/
│  ├─ migrations/
│  ├─ seed.sql
│  ├─ config.toml
│  └─ functions/
│     ├─ finalize-submission/
│     ├─ import-candidates/
│     ├─ import-previous-results/
│     ├─ import-actual-results/
│     └─ calculate-scores/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     ├─ deploy-frontend-preview.yml
│     ├─ deploy-frontend-prod.yml
│     ├─ deploy-supabase-staging.yml
│     └─ deploy-supabase-prod.yml
├─ docs/
│  ├─ blueprint.md
│  ├─ csv-templates.md
│  ├─ prompts/
│  │  ├─ frontend.md
│  │  ├─ backend.md
│  │  └─ test-generation.md
│  └─ adr/
├─ package.json
├─ tsconfig.json
├─ pnpm-lock.yaml
└─ README.md
```

---

## 7) LLM-assisted development model

Since the app will be developed by an LLM, set the project up so the model has strong guardrails.

## 7.1 Source-of-truth files
Keep these files current:
- `docs/blueprint.md` - architecture and product logic
- `docs/csv-templates.md` - import formats
- `docs/adr/` - major design decisions
- `docs/prompts/` - reusable implementation prompts
- `tests/` - acceptance tests that define expected behavior

## 7.2 Working style
Recommended pattern:
1. Human defines task and acceptance criteria
2. LLM generates code in small vertical slices
3. CI verifies:
   - type safety
   - lint
   - tests
   - build
4. Human reviews diffs
5. Merge only through pull request

## 7.3 Rules for LLM code generation
Use these constraints:
- No direct table writes from the browser for admin-only operations
- No service-role key in the frontend
- No SQL in UI components
- All writes should be:
  - through Supabase client with RLS
  - or via Edge Functions for privileged operations
- Every migration must be committed under `supabase/migrations`
- Every feature must include at least one test or a clear manual test checklist

## 7.4 Recommended coding order
1. Schema and migrations
2. Auth and profiles
3. Constituency list and filters
4. Prediction entry
5. Summary computation
6. Final submission lock
7. Admin imports
8. Result import and score engine
9. Leaderboard
10. UI polish and error handling

---

## 8) Domain model

## 8.1 Main entities
- `elections`
- `districts`
- `zones`
- `constituencies`
- `parties`
- `alliances`
- `party_alliance_map`
- `candidates`
- `election_candidates`
- `previous_results`
- `profiles`
- `predictions`
- `prediction_submissions`
- `actual_results`
- `leaderboard`

## 8.2 Entity relationships
- One election has many constituencies in scope
- One constituency belongs to one district and one zone
- One election has many parties and alliance mappings
- One constituency has many election candidates for a given election
- One user has one prediction per constituency per election
- One election has one actual result per constituency
- One user gets one leaderboard row per election

---

## 9) Database schema

## 9.1 Notes
- Use `auth.users` from Supabase Auth
- Create `public.profiles` to extend user metadata
- Use UUIDs for application tables
- Use unique constraints to prevent duplicate predictions/import rows
- Keep election-specific data separated from master data

## 9.2 Suggested SQL DDL

```sql
create extension if not exists pgcrypto;

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
```

---

## 10) Helpful views and helper functions

## 10.1 Summary views
Create views for:
- `v_constituency_catalog`
- `v_user_prediction_progress`
- `v_user_predicted_seat_summary`
- `v_actual_seat_summary`
- `v_leaderboard_public`

## 10.2 Helper functions
Recommended SQL helper functions:
- `is_admin()`
- `election_is_open(p_election_id uuid)`
- `user_submission_is_final(p_election_id uuid, p_user_id uuid)`
- `user_can_edit_predictions(p_election_id uuid, p_user_id uuid)`

Example helper:

```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;
```

Example edit gate:

```sql
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
    and exists (
      select 1
      from public.elections e
      where e.id = p_election_id
        and e.status = 'open'
        and (e.lock_at is null or now() < e.lock_at)
    )
    and not exists (
      select 1
      from public.prediction_submissions s
      where s.election_id = p_election_id
        and s.user_id = p_user_id
        and s.is_final = true
    );
$$;
```

---

## 11) Row Level Security (RLS) design

## 11.1 General principles
- Public read is okay for non-sensitive election master data
- Users can only read/write their own predictions
- Admin-only tables and actions must be restricted
- Lock must be enforced in the database, not just the UI

## 11.2 Tables that can be public read
These are generally safe to expose read-only:
- `districts`
- `zones`
- `constituencies`
- `parties`
- `alliances`
- `party_alliance_map`
- `election_candidates`
- `previous_results`
- `actual_results` (after results are published)
- `v_leaderboard_public` (or sanitized leaderboard table/view)

## 11.3 Tables that must be restricted
- `profiles`
- `predictions`
- `prediction_submissions`
- raw `leaderboard` if it contains sensitive metadata
- import/audit tables

## 11.4 Example policies

### Enable RLS
```sql
alter table public.profiles enable row level security;
alter table public.predictions enable row level security;
alter table public.prediction_submissions enable row level security;
alter table public.actual_results enable row level security;
alter table public.leaderboard enable row level security;
```

### Profiles
```sql
create policy "users can view own profile"
on public.profiles
for select
using (id = auth.uid());

create policy "users can update own profile"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());
```

### Predictions
```sql
create policy "users can read own predictions"
on public.predictions
for select
using (user_id = auth.uid());

create policy "users can insert own open predictions"
on public.predictions
for insert
with check (public.user_can_edit_predictions(election_id, user_id));

create policy "users can update own open predictions"
on public.predictions
for update
using (public.user_can_edit_predictions(election_id, user_id))
with check (public.user_can_edit_predictions(election_id, user_id));

create policy "admins can manage predictions"
on public.predictions
for all
using (public.is_admin())
with check (public.is_admin());
```

### Prediction submissions
```sql
create policy "users can read own submission state"
on public.prediction_submissions
for select
using (user_id = auth.uid());

create policy "users can create own submission state"
on public.prediction_submissions
for insert
with check (user_id = auth.uid());

create policy "users can finalize own submission while open"
on public.prediction_submissions
for update
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.elections e
    where e.id = election_id
      and e.status = 'open'
      and (e.lock_at is null or now() < e.lock_at)
  )
)
with check (user_id = auth.uid());
```

### Actual results
Prefer one of these approaches:
- Keep `actual_results` readable only after election status becomes `results_published`
- Or publish through a view after the admin flips the election status

### Leaderboard
Expose a public sanitized view such as:
```sql
create view public.v_leaderboard_public as
select
  l.election_id,
  p.display_name,
  l.total_score,
  l.vip_hits,
  l.rank,
  l.calculated_at
from public.leaderboard l
join public.profiles p on p.id = l.user_id;
```

---

## 12) Contest scoring design

## 12.1 Rules from product requirement
- If winning alliance is correctly guessed: **10 points**
- If seat count for winning alliance:
  - exact: **10**
  - within ±5: **5**
  - within ±10: **2**
- If seat count for each alliance:
  - exact: **5**
  - within ±5: **3**
  - within ±10: **1**
- Each correct VIP constituency winner: **2 points**

## 12.2 Recommended interpretation
Use the following deterministic method:

### Rule A: overall winning alliance
Identify:
- `actual_winning_alliance`
- `user_predicted_winning_alliance`

If equal:
- +10

### Rule B: seat count for actual winning alliance
Compare:
- actual seat count for the actual winning alliance
- user's predicted seat count for that same alliance

Award:
- exact => +10
- abs diff <= 5 => +5
- abs diff <= 10 => +2
- else 0

### Rule C: seat count for each alliance
For every alliance in the contest:
- exact => +5
- abs diff <= 5 => +3
- abs diff <= 10 => +1
- else 0

### Rule D: VIP constituencies
For each VIP constituency:
- if user's predicted winning candidate equals actual winning candidate => +2

## 12.3 Tie-breakers
Add explicit tie-breakers:
1. Higher total score
2. More correct VIP hits
3. More exact alliance seat matches
4. Earlier final submission time

## 12.4 Recommendation: compute scores server-side
Do not compute final scores in the browser.

Use:
- a **Supabase Edge Function**
- or a SQL stored procedure wrapped by an Edge Function

Preferred:
- Edge Function orchestrates
- SQL views/functions provide the aggregations

---

## 13) Score calculation outline

```text
Input:
- election_id

Steps:
1. Load all alliances for the election
2. Build actual seat totals by alliance from actual_results
3. For each user with final submission:
   a. Build user seat totals by alliance from predictions
   b. Find actual winning alliance
   c. Find user's predicted winning alliance
   d. Apply Rule A
   e. Apply Rule B
   f. Apply Rule C for each alliance
   g. Count correct VIP constituency hits
   h. Sum points
4. Upsert into leaderboard
5. Rank leaderboard with tie-breakers
6. Mark calculation timestamp
```

## 13.1 Pseudocode

```ts
for each user in finalizedUsers:
  score = 0

  if predictedWinningAlliance === actualWinningAlliance:
    score += 10

  diffWinningAllianceSeats = abs(
    predictedSeatCount[actualWinningAlliance] - actualSeatCount[actualWinningAlliance]
  )
  if diffWinningAllianceSeats === 0:
    score += 10
  else if diffWinningAllianceSeats <= 5:
    score += 5
  else if diffWinningAllianceSeats <= 10:
    score += 2

  for each alliance in contestAlliances:
    diff = abs(predictedSeatCount[alliance] - actualSeatCount[alliance])
    if diff === 0:
      score += 5
    else if diff <= 5:
      score += 3
    else if diff <= 10:
      score += 1

  vipHits = count of vip constituencies where predicted_candidate == actual_candidate
  score += vipHits * 2

  save leaderboard row
```

---

## 14) Data import strategy

## 14.1 Import types
You need four import paths:
1. Constituency master
2. Previous election top 3
3. Current election candidates
4. Actual final results

## 14.2 Recommended CSV templates

### Constituency master
```csv
ec_code,constituency_name,district_name,zone_name,is_vip,display_order
```

### Previous results
```csv
constituency_name,election_year,rank,candidate_name,party_name,votes,vote_share,source_url
```

### Current candidates
```csv
election_code,constituency_name,candidate_name,party_code,source_url,source_status,notes
```

### Actual final results
```csv
election_code,constituency_name,winning_candidate_name,winning_party_code,votes_won,runner_up_votes,margin,result_status,source_url
```

## 14.3 Validation checks
Before import:
- constituency must exist
- party must exist
- election must exist
- duplicate constituency rows should fail
- candidate names should be normalized before matching
- missing party/alliance mapping should block import
- import should return row-by-row success/failure report

## 14.4 Candidate name normalization
Normalize:
- trim
- collapse whitespace
- standardize punctuation
- preserve original display name
- use a secondary `normalized_name` field for matching

---

## 15) Admin functions

## 15.1 Admin UI modules
- Election management
- Constituency import
- Previous result import
- Current candidate import
- Party-alliance mapping
- VIP flag editor
- Result import
- Score recalculation
- Leaderboard publish toggle
- CSV export of all predictions

## 15.2 Admin-only operations
These should use **Edge Functions** or secured server actions:
- importing CSVs
- modifying election status
- publishing/locking election
- calculating scores
- overwriting candidate mappings
- exporting all predictions

---

## 16) Edge Functions plan

Recommended functions under `supabase/functions/`:

### `finalize-submission`
Purpose:
- verify user has predictions for all 234 constituencies
- confirm election is still open
- set `is_final = true`
- stamp `final_submitted_at`

### `import-candidates`
Purpose:
- parse CSV payload
- validate election/party/constituency references
- upsert `candidates`
- insert/update `election_candidates`

### `import-previous-results`
Purpose:
- parse CSV payload
- validate constituency and rank
- upsert `previous_results`

### `import-actual-results`
Purpose:
- parse final results
- validate party/alliance mapping
- write to `actual_results`

### `calculate-scores`
Purpose:
- compute user scores
- update `leaderboard`
- rank users

---

## 17) UI and page specification

## 17.1 Public pages
### `/`
- contest intro
- rules summary
- CTA to sign in
- optional countdown to lock time

### `/login`
- email sign-in form
- short copy about contest and privacy

## 17.2 Contest pages
### `/contest/[electionCode]`
Dashboard page:
- progress bar
- total constituencies completed
- seat summary by alliance
- list of missing constituencies
- button to resume entry

### `/contest/[electionCode]/constituencies`
List page:
- search by constituency name
- district filter
- zone filter
- VIP toggle
- status chips:
  - not started
  - saved
  - completed
- mobile-friendly card layout

### `/contest/[electionCode]/constituency/[id]`
Detail page:
- constituency name
- district and zone
- VIP badge
- previous election top 3
- current candidates list
- candidate radio/select card
- save action
- next / previous navigation

### `/contest/[electionCode]/summary`
- predicted seat totals by alliance
- VIP picks summary
- count completed / missing
- final submit button
- final warning message

## 17.3 Post-result pages
### `/results/[electionCode]`
- actual seat totals
- user's score
- leaderboard

### `/results/[electionCode]/constituency/[id]`
- user's predicted candidate
- actual winner
- actual votes
- margin
- score impact for this constituency

## 17.4 Admin pages
### `/admin`
- election cards
- import actions
- election status changes

### `/admin/import/*`
- upload CSV
- preview parsed rows
- row-level validation report
- confirm import

---

## 18) Mobile UX recommendations

- Use cards instead of wide tables
- Keep top filters in a collapsible mobile drawer
- Sticky progress bar on prediction pages
- One-tap save and next
- Autosave after each selection
- Big tap targets for candidate selection
- Avoid modal-heavy flows on mobile
- Use bottom action bar for:
  - save
  - previous
  - next

---

## 19) Authentication flow

## 19.1 Sign-in
- Google OAuth through Supabase Auth

## 19.2 Profile creation
On first login:
- create `profiles` row
- populate:
  - `id`
  - `email`
  - `display_name`
  - `role = user`

## 19.3 Admin assignment
Do not let the UI assign admin role.
Admin role should be assigned manually by:
- SQL migration
- secure admin script
- direct database update by trusted operator

---

## 20) API and frontend data-access patterns

## 20.1 Client-side reads
Good candidates for direct Supabase client reads:
- constituency catalog
- user's own predictions
- user's own progress
- published results
- public leaderboard view

## 20.2 Server-side or Edge Function writes
Use Edge Functions for:
- final submission
- admin imports
- score calculation
- bulk writes
- operations requiring service role

## 20.3 Avoid
- service role key in browser
- unrestricted insert/update from client for admin data
- client-side trust for lock timing
- score calculation in browser

---

## 21) Suggested frontend implementation details

## 21.1 Framework choices
- Next.js App Router
- Route groups for public/admin/contest
- Server Components for read-heavy pages where helpful
- Client Components for interactive filters and prediction selection

## 21.2 State management
Keep it simple:
- URL params for filters
- React state for form selection
- Supabase as source of truth
- avoid global state unless clearly needed

## 21.3 Validation
Use:
- `zod` for request and CSV validation
- typed DTOs for import payloads
- central mapping utilities for candidate/party normalization

---

## 22) GitHub Actions deployment strategy

## 22.1 Branch strategy
Recommended:
- `main` -> production
- `develop` -> staging
- feature branches -> PR previews

If you want it simpler:
- `main` only for production
- PR previews optional

## 22.2 CI workflow
On every PR and push:
- install dependencies
- lint
- typecheck
- run tests
- build Next.js app

## 22.3 Frontend deployment
Use GitHub Actions to deploy frontend to Vercel.

### Preview deploy
Trigger:
- `pull_request`

### Production deploy
Trigger:
- `push` to `main`

## 22.4 Supabase deployment
Use GitHub Actions to:
- link to the correct Supabase project
- run migrations
- deploy Edge Functions

Recommended:
- `develop` -> staging Supabase project
- `main` -> production Supabase project

## 22.5 Required GitHub secrets

### Frontend/Vercel
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Supabase
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID_STAGING`
- `SUPABASE_PROJECT_ID_PROD`

### App runtime
Set these in Vercel project envs and/or GitHub as needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Optional
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 23) Example GitHub Actions workflows

## 23.1 `ci.yml`
```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - develop

jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

## 23.2 `deploy-frontend-preview.yml`
```yaml
name: Deploy Frontend Preview

on:
  pull_request:

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Install Vercel CLI
        run: npm i -g vercel

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build Preview
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Preview
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }} > deployment-url.txt
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 23.3 `deploy-frontend-prod.yml`
```yaml
name: Deploy Frontend Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Install Vercel CLI
        run: npm i -g vercel

      - name: Pull Vercel production environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Build production bundle
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 23.4 `deploy-supabase-staging.yml`
```yaml
name: Deploy Supabase Staging

on:
  push:
    branches:
      - develop
  workflow_dispatch:

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link project
        run: supabase link --project-ref $SUPABASE_PROJECT_ID_STAGING --password $SUPABASE_DB_PASSWORD
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID_STAGING: ${{ secrets.SUPABASE_PROJECT_ID_STAGING }}

      - name: Push migrations
        run: supabase db push

      - name: Deploy Edge Functions
        run: supabase functions deploy
```

## 23.5 `deploy-supabase-prod.yml`
```yaml
name: Deploy Supabase Production

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy-prod:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest

      - name: Link project
        run: supabase link --project-ref $SUPABASE_PROJECT_ID_PROD --password $SUPABASE_DB_PASSWORD
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID_PROD: ${{ secrets.SUPABASE_PROJECT_ID_PROD }}

      - name: Dry-run migrations
        run: supabase db push --dry-run

      - name: Push migrations
        run: supabase db push

      - name: Deploy Edge Functions
        run: supabase functions deploy
```

---

## 24) Deployment safety controls

## 24.1 GitHub protections
- protect `main`
- require PR review
- require CI passing before merge
- use environment protection rules for production
- keep production secrets only in production environment

## 24.2 Supabase controls
- separate staging and production projects
- never apply ad-hoc dashboard schema changes in production without capturing migrations
- use service-role only in backend/Edge Functions
- log imports and score recalculations

## 24.3 Operational safety
- final submission must be irreversible
- election lock must be server-enforced
- imports should support dry-run validation
- score recalculation should be idempotent

---

## 25) Testing strategy

## 25.1 Unit tests
- scoring logic
- alliance aggregation
- normalization helpers
- CSV validation

## 25.2 Integration tests
- sign-in callback profile creation
- prediction save/update
- final submission lock
- result import
- leaderboard generation

## 25.3 Manual acceptance checklist
Before production:
- mobile list page works well on phone width
- all 234 constituencies load correctly
- filters work together
- users cannot edit after final submission
- users cannot edit after lock time
- result import handles at least one full sample dataset
- leaderboard ranking is deterministic
- tie-breaker order is correct

---

## 26) Suggested implementation phases

## Phase 1 - foundation
- repo setup
- CI
- Supabase project
- initial migrations
- profiles and auth
- master data tables

## Phase 2 - core contest flow
- constituency listing and filters
- constituency detail page
- prediction save/update
- summary page
- progress tracking

## Phase 3 - finalization
- final submit flow
- lock logic
- user restrictions
- UX polish

## Phase 4 - admin operations
- CSV templates
- admin pages
- candidate import
- previous results import
- election management

## Phase 5 - results and scoring
- actual result import
- score engine
- leaderboard
- winner announcement page

## Phase 6 - hardening
- edge cases
- better logging
- preview deploys
- staging/prod separation
- performance cleanup

---

## 27) Open decisions to confirm

These should be decided before implementation starts:

1. **Exact alliance list**
   - Should the app show only the requested five blocs?
   - Or include "Others" as fallback?

2. **Can users submit partial entries?**
   - Recommended: allow drafts, but final submission only at 234/234

3. **Should leaderboard be visible before results?**
   - Recommended: no, or only show participation counts

4. **Can admin manually override mismatched candidate names?**
   - Recommended: yes

5. **Will votes/margins be shown per constituency after results?**
   - Recommended: yes

6. **Will there be one election only, or future reuse?**
   - Recommended: make it reusable from day one

---

## 28) Recommended implementation prompt for an LLM

Use something like this as the execution prompt for the coding model:

```text
Build a production-oriented MVP for a Tamil Nadu Assembly election prediction contest app.

Technical constraints:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase for Auth, Postgres, and Edge Functions
- GitHub Actions for CI/CD
- Vercel deployment via GitHub Actions
- Supabase migrations/functions deployment via GitHub Actions
- Mobile-first responsive UI

Product constraints:
- Google login
- 234 constituencies
- filters by name, district, zone, VIP
- one predicted winner per constituency per user
- draft save allowed
- final submission only when all 234 are filled
- alliance seat summary
- admin CSV imports for previous results, current candidates, and actual results
- leaderboard after results with specified scoring rules

Engineering constraints:
- create migrations in supabase/migrations
- implement RLS
- no service-role key in frontend
- add tests for scoring and prediction lock
- keep code modular and typed
- provide PR-sized changes
```

---

## 29) Final recommendation

The best implementation path is:

- **Next.js + Supabase + Vercel**
- **GitHub Actions for all deployments**
- **CSV-first admin import workflow**
- **server-enforced lock and scoring**
- **strong RLS and clean migration discipline**
- **LLM-assisted incremental development with CI guardrails**

This will give you:
- fast MVP delivery
- low cost
- strong reuse for future elections or other prediction contests
- a clean handoff path if a human developer takes over later

---

## 30) Reference notes for implementation team

Use official documentation for:
- Supabase Auth (email)
- Supabase RLS
- Supabase migrations and Edge Functions
- GitHub Actions workflow syntax and secrets
- Vercel CLI deployments

Maintain these as living references inside the repo docs, not just in chat.
