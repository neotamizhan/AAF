export type ElectionStatus =
  | "draft"
  | "open"
  | "locked"
  | "results_published"
  | "closed";

export type SourceStatus = "imported" | "verified" | "manual_override";
export type ResultStatus = "leading" | "final";

export type Election = {
  id: string;
  code: string;
  name: string;
  electionYear: number;
  status: ElectionStatus;
  lockAt: string | null;
  resultsImportedAt: string | null;
};

export type District = {
  id: string;
  name: string;
};

export type Zone = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Constituency = {
  id: string;
  ecCode: string;
  name: string;
  districtId: string;
  zoneId: string;
  isVip: boolean;
  displayOrder: number;
};

export type Party = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type Alliance = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

export type Candidate = {
  id: string;
  normalizedName: string;
  displayName: string;
};

export type ElectionCandidate = {
  id: string;
  electionId: string;
  constituencyId: string;
  candidateId: string;
  partyId: string;
  allianceId: string;
  sourceStatus: SourceStatus;
  sourceUrl: string | null;
  notes: string | null;
};

export type PreviousResult = {
  id: string;
  constituencyId: string;
  electionYear: number;
  rank: number;
  candidateName: string;
  partyName: string | null;
  votes: number | null;
  voteShare: number | null;
  sourceUrl: string | null;
};

export type Prediction = {
  id: string;
  electionId: string;
  userId: string;
  constituencyId: string;
  predictedCandidateId: string;
  predictedPartyId: string;
  predictedAllianceId: string;
  updatedAt: string;
};

export type Submission = {
  electionId: string;
  userId: string;
  isFinal: boolean;
  finalSubmittedAt: string | null;
};

export type ActualResult = {
  id: string;
  electionId: string;
  constituencyId: string;
  winningCandidateId: string | null;
  winningCandidateName: string;
  winningPartyId: string | null;
  winningAllianceId: string | null;
  votesWon: number | null;
  runnerUpVotes: number | null;
  margin: number | null;
  sourceUrl: string | null;
  resultStatus: ResultStatus;
};

export type LeaderboardRow = {
  electionId: string;
  displayName: string;
  totalScore: number;
  vipHits: number;
  exactAllianceDistributionHits: number;
  rank: number;
  calculatedAt: string;
};

export type CandidateOption = {
  candidateId: string;
  candidateName: string;
  partyId: string;
  partyCode: string;
  partyName: string;
  allianceId: string;
  allianceCode: string;
  allianceName: string;
  sourceStatus: SourceStatus;
};

export type ConstituencyCatalogItem = {
  id: string;
  ecCode: string;
  name: string;
  districtName: string;
  zoneName: string;
  isVip: boolean;
  displayOrder: number;
  previousResults: PreviousResult[];
  candidates: CandidateOption[];
};

export type SeatSummaryRow = {
  allianceId: string;
  allianceCode: string;
  allianceName: string;
  seats: number;
  sortOrder: number;
};

export type PredictionProgress = {
  completed: number;
  total: number;
  missing: ConstituencyCatalogItem[];
  isFinal: boolean;
  finalSubmittedAt: string | null;
};
