# CSV Templates

## Constituency Master

```csv
ec_code,constituency_name,district_name,zone_name,is_vip,display_order
```

## Previous Results

```csv
constituency_name,election_year,rank,candidate_name,party_name,votes,vote_share,source_url
```

## Current Candidates

```csv
election_code,constituency_name,candidate_name,party_code,source_url,source_status,notes
```

`source_status` must be one of:

- `imported`
- `verified`
- `manual_override`

## Actual Final Results

```csv
election_code,constituency_name,winning_candidate_name,winning_party_code,votes_won,runner_up_votes,margin,result_status,source_url
```

`result_status` must be one of:

- `leading`
- `final`

## Import Rules

- Constituency, party, and election references must already exist.
- Candidate names are normalized for matching, while display spelling is preserved.
- Missing party-to-alliance mappings block import.
- Edge Functions return row-level validation failures.
- Dry runs are the default for admin import functions.
