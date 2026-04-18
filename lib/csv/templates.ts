export const csvTemplates = {
  constituencies: {
    label: "Constituency master",
    headers: [
      "ec_code",
      "constituency_name",
      "district_name",
      "zone_name",
      "is_vip",
      "display_order"
    ]
  },
  previousResults: {
    label: "Previous results",
    headers: [
      "constituency_name",
      "election_year",
      "rank",
      "candidate_name",
      "party_name",
      "votes",
      "vote_share",
      "source_url"
    ]
  },
  currentCandidates: {
    label: "Current candidates",
    headers: [
      "election_code",
      "constituency_name",
      "candidate_name",
      "party_code",
      "source_url",
      "source_status",
      "notes"
    ]
  },
  actualResults: {
    label: "Actual final results",
    headers: [
      "election_code",
      "constituency_name",
      "winning_candidate_name",
      "winning_party_code",
      "votes_won",
      "runner_up_votes",
      "margin",
      "result_status",
      "source_url"
    ]
  }
} as const;

export type CsvTemplateKey = keyof typeof csvTemplates;
