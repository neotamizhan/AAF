insert into public.elections (id, code, name, election_year, status, lock_at)
values (
  '11111111-1111-4111-8111-111111111111',
  'tn-2026',
  'Tamil Nadu Assembly Election 2026',
  2026,
  'open',
  '2026-05-01 18:00:00+05:30'
)
on conflict (code) do update
set name = excluded.name,
    election_year = excluded.election_year,
    status = excluded.status,
    lock_at = excluded.lock_at;

insert into public.zones (id, name, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'North', 1),
  ('10000000-0000-4000-8000-000000000002', 'West', 2),
  ('10000000-0000-4000-8000-000000000003', 'Delta', 3),
  ('10000000-0000-4000-8000-000000000004', 'South', 4),
  ('10000000-0000-4000-8000-000000000005', 'Chennai', 5)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.districts (id, name)
values
  ('11000000-0000-4000-8000-000000000001', 'Chennai'),
  ('11000000-0000-4000-8000-000000000002', 'Coimbatore'),
  ('11000000-0000-4000-8000-000000000003', 'Madurai'),
  ('11000000-0000-4000-8000-000000000004', 'Thanjavur'),
  ('11000000-0000-4000-8000-000000000005', 'Vellore'),
  ('11000000-0000-4000-8000-000000000006', 'Tirunelveli')
on conflict (name) do nothing;

insert into public.alliances (id, code, name, sort_order)
values
  ('20000000-0000-4000-8000-000000000001', 'DMK', 'DMK bloc', 1),
  ('20000000-0000-4000-8000-000000000002', 'ADMK', 'ADMK bloc', 2),
  ('20000000-0000-4000-8000-000000000003', 'NTK', 'NTK bloc', 3),
  ('20000000-0000-4000-8000-000000000004', 'SPMK', 'Sasikala + PMK bloc', 4),
  ('20000000-0000-4000-8000-000000000005', 'TVK', 'TVK bloc', 5),
  ('20000000-0000-4000-8000-000000000006', 'OTH', 'Others', 6)
on conflict (code) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.parties (id, code, name)
values
  ('30000000-0000-4000-8000-000000000001', 'DMK', 'Dravida Munnetra Kazhagam'),
  ('30000000-0000-4000-8000-000000000002', 'ADMK', 'All India Anna Dravida Munnetra Kazhagam'),
  ('30000000-0000-4000-8000-000000000003', 'NTK', 'Naam Tamilar Katchi'),
  ('30000000-0000-4000-8000-000000000004', 'SPMK', 'Sasikala + PMK'),
  ('30000000-0000-4000-8000-000000000005', 'TVK', 'Tamilaga Vettri Kazhagam'),
  ('30000000-0000-4000-8000-000000000006', 'IND', 'Independent')
on conflict (code) do update set name = excluded.name;

insert into public.party_alliance_map (election_id, party_id, alliance_id)
select e.id, p.id, a.id
from public.elections e
join (
  values
    ('DMK', 'DMK'),
    ('ADMK', 'ADMK'),
    ('NTK', 'NTK'),
    ('SPMK', 'SPMK'),
    ('TVK', 'TVK'),
    ('IND', 'OTH')
) as m(party_code, alliance_code) on true
join public.parties p on p.code = m.party_code
join public.alliances a on a.code = m.alliance_code
where e.code = 'tn-2026'
on conflict (election_id, party_id) do update set alliance_id = excluded.alliance_id;

insert into public.constituencies (
  id,
  ec_code,
  name,
  district_id,
  zone_id,
  is_vip,
  display_order
)
select v.id::uuid, v.ec_code, v.name, d.id, z.id, v.is_vip, v.display_order
from (
  values
    ('40000000-0000-4000-8000-000000000019', 'AC-19', 'Chepauk-Thiruvallikeni', 'Chennai', 'Chennai', true, 19),
    ('40000000-0000-4000-8000-000000000120', 'AC-120', 'Coimbatore South', 'Coimbatore', 'West', true, 120),
    ('40000000-0000-4000-8000-000000000193', 'AC-193', 'Madurai Central', 'Madurai', 'South', false, 193),
    ('40000000-0000-4000-8000-000000000174', 'AC-174', 'Thanjavur', 'Thanjavur', 'Delta', false, 174),
    ('40000000-0000-4000-8000-000000000040', 'AC-40', 'Katpadi', 'Vellore', 'North', true, 40),
    ('40000000-0000-4000-8000-000000000226', 'AC-226', 'Tirunelveli', 'Tirunelveli', 'South', false, 226)
) as v(id, ec_code, name, district_name, zone_name, is_vip, display_order)
join public.districts d on d.name = v.district_name
join public.zones z on z.name = v.zone_name
on conflict (name) do update
set ec_code = excluded.ec_code,
    district_id = excluded.district_id,
    zone_id = excluded.zone_id,
    is_vip = excluded.is_vip,
    display_order = excluded.display_order;

insert into public.candidates (display_name, normalized_name)
select v.display_name, public.normalize_candidate_name(v.display_name)
from (
  values
    ('Udhayanidhi Stalin'), ('J. Jayavardhan'), ('S. Rajeswari'), ('R. Manoharan'), ('K. Aravind'),
    ('N. Karthik'), ('Amman K. Arjunan'), ('M. Abdul Wahab'), ('P. Kavitha'), ('S. Pradeep'),
    ('P. T. R. Palanivel Thiaga Rajan'), ('S. S. Saravanan'), ('R. Senthil'), ('M. Indirani'), ('A. Nithya'),
    ('T. K. G. Neelamegam'), ('M. Rengasamy'), ('P. Humayun Kabir'), ('R. Vetrivel'), ('D. Kabilan'),
    ('Duraimurugan'), ('V. Ramu'), ('S. Rajesh'), ('K. Sathya'), ('M. Ashwin'),
    ('A. L. S. Lakshmanan'), ('Nainar Nagendran'), ('M. Sathish'), ('P. Velmurugan'), ('J. John Kennedy')
) as v(display_name)
on conflict (normalized_name) do update set display_name = excluded.display_name;

insert into public.election_candidates (
  election_id,
  constituency_id,
  candidate_id,
  party_id,
  source_status
)
select e.id, c.id, cand.id, p.id, 'verified'
from (
  values
    ('Chepauk-Thiruvallikeni', 'Udhayanidhi Stalin', 'DMK'),
    ('Chepauk-Thiruvallikeni', 'J. Jayavardhan', 'ADMK'),
    ('Chepauk-Thiruvallikeni', 'S. Rajeswari', 'NTK'),
    ('Chepauk-Thiruvallikeni', 'R. Manoharan', 'SPMK'),
    ('Chepauk-Thiruvallikeni', 'K. Aravind', 'TVK'),
    ('Coimbatore South', 'N. Karthik', 'DMK'),
    ('Coimbatore South', 'Amman K. Arjunan', 'ADMK'),
    ('Coimbatore South', 'M. Abdul Wahab', 'NTK'),
    ('Coimbatore South', 'P. Kavitha', 'SPMK'),
    ('Coimbatore South', 'S. Pradeep', 'TVK'),
    ('Madurai Central', 'P. T. R. Palanivel Thiaga Rajan', 'DMK'),
    ('Madurai Central', 'S. S. Saravanan', 'ADMK'),
    ('Madurai Central', 'R. Senthil', 'NTK'),
    ('Madurai Central', 'M. Indirani', 'SPMK'),
    ('Madurai Central', 'A. Nithya', 'TVK'),
    ('Thanjavur', 'T. K. G. Neelamegam', 'DMK'),
    ('Thanjavur', 'M. Rengasamy', 'ADMK'),
    ('Thanjavur', 'P. Humayun Kabir', 'NTK'),
    ('Thanjavur', 'R. Vetrivel', 'SPMK'),
    ('Thanjavur', 'D. Kabilan', 'TVK'),
    ('Katpadi', 'Duraimurugan', 'DMK'),
    ('Katpadi', 'V. Ramu', 'ADMK'),
    ('Katpadi', 'S. Rajesh', 'NTK'),
    ('Katpadi', 'K. Sathya', 'SPMK'),
    ('Katpadi', 'M. Ashwin', 'TVK'),
    ('Tirunelveli', 'A. L. S. Lakshmanan', 'DMK'),
    ('Tirunelveli', 'Nainar Nagendran', 'ADMK'),
    ('Tirunelveli', 'M. Sathish', 'NTK'),
    ('Tirunelveli', 'P. Velmurugan', 'SPMK'),
    ('Tirunelveli', 'J. John Kennedy', 'TVK')
) as v(constituency_name, candidate_name, party_code)
join public.elections e on e.code = 'tn-2026'
join public.constituencies c on c.name = v.constituency_name
join public.candidates cand on cand.normalized_name = public.normalize_candidate_name(v.candidate_name)
join public.parties p on p.code = v.party_code
on conflict (election_id, constituency_id, candidate_id, party_id) do update
set source_status = excluded.source_status;
