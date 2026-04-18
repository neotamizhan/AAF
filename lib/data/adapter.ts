import {
  fixtureActualResults,
  fixtureAlliances,
  fixtureCandidates,
  fixtureConstituencies,
  fixtureDistricts,
  fixtureElection,
  fixtureElectionCandidates,
  fixtureLeaderboard,
  fixtureParties,
  fixturePredictions,
  fixturePreviousResults,
  fixtureSubmission,
  fixtureZones
} from "@/lib/data/fixtures";
import { getServerSupabase } from "@/lib/supabase/server";
import type {
  ActualResult,
  Alliance,
  CandidateOption,
  ConstituencyCatalogItem,
  Election,
  LeaderboardRow,
  Prediction,
  PredictionProgress,
  SeatSummaryRow,
  Submission
} from "@/lib/types";

const demoUserId = "fixture-user";

function byId<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

export function buildFixtureCatalog(): ConstituencyCatalogItem[] {
  const districts = byId(fixtureDistricts);
  const zones = byId(fixtureZones);
  const candidates = byId(fixtureCandidates);
  const parties = byId(fixtureParties);
  const alliances = byId(fixtureAlliances);

  return fixtureConstituencies
    .map((constituency) => {
      const options: CandidateOption[] = fixtureElectionCandidates
        .filter((item) => item.constituencyId === constituency.id)
        .map((item) => {
          const candidate = candidates.get(item.candidateId);
          const party = parties.get(item.partyId);
          const alliance = alliances.get(item.allianceId);
          return {
            candidateId: item.candidateId,
            candidateName: candidate?.displayName ?? "Unknown candidate",
            partyId: item.partyId,
            partyCode: party?.code ?? "UNK",
            partyName: party?.name ?? "Unknown party",
            allianceId: item.allianceId,
            allianceCode: alliance?.code ?? "OTH",
            allianceName: alliance?.name ?? "Others",
            sourceStatus: item.sourceStatus
          };
        });

      return {
        id: constituency.id,
        ecCode: constituency.ecCode,
        name: constituency.name,
        districtName: districts.get(constituency.districtId)?.name ?? "Unknown",
        zoneName: zones.get(constituency.zoneId)?.name ?? "Unknown",
        isVip: constituency.isVip,
        displayOrder: constituency.displayOrder,
        previousResults: fixturePreviousResults
          .filter((item) => item.constituencyId === constituency.id)
          .sort((a, b) => a.rank - b.rank),
        candidates: options
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function shouldUseFixture() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getElectionByCode(code: string): Promise<Election | null> {
  if (shouldUseFixture()) {
    return code === fixtureElection.code ? fixtureElection : null;
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("elections")
    .select("id, code, name, election_year, status, lock_at, results_imported_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return code === fixtureElection.code ? fixtureElection : null;
  }

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    electionYear: data.election_year,
    status: data.status,
    lockAt: data.lock_at,
    resultsImportedAt: data.results_imported_at
  };
}

export async function getConstituencyCatalog(
  electionCode: string
): Promise<ConstituencyCatalogItem[]> {
  if (shouldUseFixture()) {
    return electionCode === fixtureElection.code ? buildFixtureCatalog() : [];
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("v_constituency_catalog")
    .select("*")
    .eq("election_code", electionCode)
    .order("display_order", { ascending: true });

  if (error || !data) {
    return buildFixtureCatalog();
  }

  return data.map((row) => ({
    id: row.constituency_id,
    ecCode: row.ec_code,
    name: row.constituency_name,
    districtName: row.district_name,
    zoneName: row.zone_name,
    isVip: row.is_vip,
    displayOrder: row.display_order,
    previousResults: row.previous_results ?? [],
    candidates: row.candidates ?? []
  }));
}

export async function getAlliances(): Promise<Alliance[]> {
  if (shouldUseFixture()) {
    return fixtureAlliances;
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("alliances")
    .select("id, code, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return fixtureAlliances;
  }

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    sortOrder: row.sort_order ?? 999
  }));
}

export async function getUserPredictions(
  electionId: string
): Promise<Prediction[]> {
  if (shouldUseFixture()) {
    return electionId === fixtureElection.id ? fixturePredictions : [];
  }

  const supabase = getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("predictions")
    .select(
      "id, election_id, user_id, constituency_id, predicted_candidate_id, predicted_party_id, predicted_alliance_id, updated_at"
    )
    .eq("election_id", electionId)
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    electionId: row.election_id,
    userId: row.user_id,
    constituencyId: row.constituency_id,
    predictedCandidateId: row.predicted_candidate_id,
    predictedPartyId: row.predicted_party_id,
    predictedAllianceId: row.predicted_alliance_id,
    updatedAt: row.updated_at
  }));
}

export async function getSubmission(electionId: string): Promise<Submission | null> {
  if (shouldUseFixture()) {
    return electionId === fixtureElection.id ? fixtureSubmission : null;
  }

  const supabase = getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("prediction_submissions")
    .select("election_id, user_id, is_final, final_submitted_at")
    .eq("election_id", electionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    electionId: data.election_id,
    userId: data.user_id,
    isFinal: data.is_final,
    finalSubmittedAt: data.final_submitted_at
  };
}

export async function getPredictionProgress(
  election: Election,
  catalog: ConstituencyCatalogItem[]
): Promise<PredictionProgress> {
  const [predictions, submission] = await Promise.all([
    getUserPredictions(election.id),
    getSubmission(election.id)
  ]);
  const predicted = new Set(predictions.map((item) => item.constituencyId));
  const missing = catalog.filter((item) => !predicted.has(item.id));

  return {
    completed: predictions.length,
    total: catalog.length,
    missing,
    isFinal: submission?.isFinal ?? false,
    finalSubmittedAt: submission?.finalSubmittedAt ?? null
  };
}

export function summarizePredictedSeats(
  alliances: Alliance[],
  predictions: Prediction[]
): SeatSummaryRow[] {
  return alliances
    .map((alliance) => ({
      allianceId: alliance.id,
      allianceCode: alliance.code,
      allianceName: alliance.name,
      seats: predictions.filter(
        (prediction) => prediction.predictedAllianceId === alliance.id
      ).length,
      sortOrder: alliance.sortOrder
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActualResults(
  electionId: string
): Promise<ActualResult[]> {
  if (shouldUseFixture()) {
    return electionId === fixtureElection.id ? fixtureActualResults : [];
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("actual_results")
    .select(
      "id, election_id, constituency_id, winning_candidate_id, winning_candidate_name, winning_party_id, winning_alliance_id, votes_won, runner_up_votes, margin, source_url, result_status"
    )
    .eq("election_id", electionId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    electionId: row.election_id,
    constituencyId: row.constituency_id,
    winningCandidateId: row.winning_candidate_id,
    winningCandidateName: row.winning_candidate_name,
    winningPartyId: row.winning_party_id,
    winningAllianceId: row.winning_alliance_id,
    votesWon: row.votes_won,
    runnerUpVotes: row.runner_up_votes,
    margin: row.margin,
    sourceUrl: row.source_url,
    resultStatus: row.result_status
  }));
}

export function summarizeActualSeats(
  alliances: Alliance[],
  results: ActualResult[]
): SeatSummaryRow[] {
  return alliances
    .map((alliance) => ({
      allianceId: alliance.id,
      allianceCode: alliance.code,
      allianceName: alliance.name,
      seats: results.filter((result) => result.winningAllianceId === alliance.id)
        .length,
      sortOrder: alliance.sortOrder
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getLeaderboard(
  electionId: string
): Promise<LeaderboardRow[]> {
  if (shouldUseFixture()) {
    return electionId === fixtureElection.id ? fixtureLeaderboard : [];
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("v_leaderboard_public")
    .select(
      "election_id, display_name, total_score, vip_hits, exact_alliance_distribution_hits, rank, calculated_at"
    )
    .eq("election_id", electionId)
    .order("rank", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    electionId: row.election_id,
    displayName: row.display_name,
    totalScore: row.total_score,
    vipHits: row.vip_hits,
    exactAllianceDistributionHits: row.exact_alliance_distribution_hits,
    rank: row.rank,
    calculatedAt: row.calculated_at
  }));
}

export function getDemoUserId() {
  return demoUserId;
}
