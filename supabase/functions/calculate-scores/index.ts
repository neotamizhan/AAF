import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireAdmin, serviceClient } from "../_shared/supabase.ts";

type Alliance = {
  id: string;
  code: string;
  sort_order: number | null;
};

type Prediction = {
  election_id: string;
  user_id: string;
  constituency_id: string;
  predicted_candidate_id: string;
  predicted_alliance_id: string;
};

type ActualResult = {
  constituency_id: string;
  winning_candidate_id: string | null;
  winning_alliance_id: string | null;
};

type Submission = {
  election_id: string;
  user_id: string;
  final_submitted_at: string | null;
};

function seatDiffPoints(
  diff: number,
  exactPoints: number,
  fivePoints: number,
  tenPoints: number
) {
  if (diff === 0) return exactPoints;
  if (diff <= 5) return fivePoints;
  if (diff <= 10) return tenPoints;
  return 0;
}

function totalsByAlliance(
  alliances: Alliance[],
  allianceIds: Array<string | null>
) {
  const totals = new Map(alliances.map((alliance) => [alliance.id, 0]));
  allianceIds.forEach((allianceId) => {
    if (!allianceId) return;
    totals.set(allianceId, (totals.get(allianceId) ?? 0) + 1);
  });
  return totals;
}

function winningAlliance(totals: Map<string, number>) {
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    await requireAdmin(req);
    const { election_id, publish = false } = await req.json();

    if (!election_id) {
      return jsonResponse({ error: "election_id is required" }, 400);
    }

    const admin = serviceClient();
    const [
      alliancesResult,
      catalogResult,
      resultsResult,
      submissionsResult,
      predictionsResult
    ] = await Promise.all([
      admin
        .from("alliances")
        .select("id, code, sort_order")
        .order("sort_order", { ascending: true }),
      admin
        .from("v_constituency_catalog")
        .select("constituency_id, is_vip")
        .eq("election_id", election_id),
      admin
        .from("actual_results")
        .select("constituency_id, winning_candidate_id, winning_alliance_id")
        .eq("election_id", election_id),
      admin
        .from("prediction_submissions")
        .select("election_id, user_id, final_submitted_at")
        .eq("election_id", election_id)
        .eq("is_final", true),
      admin
        .from("predictions")
        .select(
          "election_id, user_id, constituency_id, predicted_candidate_id, predicted_alliance_id"
        )
        .eq("election_id", election_id)
    ]);

    if (alliancesResult.error) throw alliancesResult.error;
    if (catalogResult.error) throw catalogResult.error;
    if (resultsResult.error) throw resultsResult.error;
    if (submissionsResult.error) throw submissionsResult.error;
    if (predictionsResult.error) throw predictionsResult.error;

    const alliances = (alliancesResult.data ?? []) as Alliance[];
    const catalog = catalogResult.data ?? [];
    const actualResults = (resultsResult.data ?? []) as ActualResult[];
    const submissions = (submissionsResult.data ?? []) as Submission[];
    const predictions = (predictionsResult.data ?? []) as Prediction[];

    if (actualResults.length === 0) {
      return jsonResponse({ error: "No actual results imported" }, 409);
    }

    const vipConstituencies = new Set(
      catalog
        .filter((row) => row.is_vip)
        .map((row) => row.constituency_id as string)
    );
    const resultByConstituency = new Map(
      actualResults.map((result) => [result.constituency_id, result])
    );
    const actualTotals = totalsByAlliance(
      alliances,
      actualResults.map((result) => result.winning_alliance_id)
    );
    const actualWinningAlliance = winningAlliance(actualTotals);

    const scored = submissions.map((submission) => {
      const userPredictions = predictions.filter(
        (prediction) => prediction.user_id === submission.user_id
      );
      const predictedTotals = totalsByAlliance(
        alliances,
        userPredictions.map((prediction) => prediction.predicted_alliance_id)
      );
      const predictedWinningAlliance = winningAlliance(predictedTotals);

      let totalScore = 0;
      let exactWinningAllianceHits = 0;
      let exactWinningAllianceSeatHits = 0;
      let exactAllianceDistributionHits = 0;

      if (
        actualWinningAlliance &&
        predictedWinningAlliance === actualWinningAlliance
      ) {
        totalScore += 10;
        exactWinningAllianceHits = 1;
      }

      if (actualWinningAlliance) {
        const diff = Math.abs(
          (predictedTotals.get(actualWinningAlliance) ?? 0) -
            (actualTotals.get(actualWinningAlliance) ?? 0)
        );
        totalScore += seatDiffPoints(diff, 10, 5, 2);
        exactWinningAllianceSeatHits = diff === 0 ? 1 : 0;
      }

      alliances.forEach((alliance) => {
        const diff = Math.abs(
          (predictedTotals.get(alliance.id) ?? 0) -
            (actualTotals.get(alliance.id) ?? 0)
        );
        totalScore += seatDiffPoints(diff, 5, 3, 1);
        if (diff === 0) exactAllianceDistributionHits += 1;
      });

      const vipHits = userPredictions.filter((prediction) => {
        if (!vipConstituencies.has(prediction.constituency_id)) return false;
        const result = resultByConstituency.get(prediction.constituency_id);
        return result?.winning_candidate_id === prediction.predicted_candidate_id;
      }).length;

      totalScore += vipHits * 2;

      return {
        election_id,
        user_id: submission.user_id,
        total_score: totalScore,
        exact_winning_alliance_hits: exactWinningAllianceHits,
        exact_winning_alliance_seat_hits: exactWinningAllianceSeatHits,
        exact_alliance_distribution_hits: exactAllianceDistributionHits,
        vip_hits: vipHits,
        final_submitted_at: submission.final_submitted_at
      };
    });

    scored.sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      if (b.vip_hits !== a.vip_hits) return b.vip_hits - a.vip_hits;
      if (
        b.exact_alliance_distribution_hits !==
        a.exact_alliance_distribution_hits
      ) {
        return (
          b.exact_alliance_distribution_hits -
          a.exact_alliance_distribution_hits
        );
      }
      return (
        Date.parse(a.final_submitted_at ?? "9999-12-31T00:00:00.000Z") -
        Date.parse(b.final_submitted_at ?? "9999-12-31T00:00:00.000Z")
      );
    });

    const rows = scored.map((score, index) => ({
      election_id: score.election_id,
      user_id: score.user_id,
      total_score: score.total_score,
      exact_winning_alliance_hits: score.exact_winning_alliance_hits,
      exact_winning_alliance_seat_hits: score.exact_winning_alliance_seat_hits,
      exact_alliance_distribution_hits: score.exact_alliance_distribution_hits,
      vip_hits: score.vip_hits,
      rank: index + 1,
      calculated_at: new Date().toISOString()
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await admin
        .from("leaderboard")
        .upsert(rows, { onConflict: "election_id,user_id" });
      if (upsertError) throw upsertError;
    }

    if (publish) {
      const { error: publishError } = await admin
        .from("elections")
        .update({
          status: "results_published",
          results_imported_at: new Date().toISOString()
        })
        .eq("id", election_id);

      if (publishError) throw publishError;
    }

    return jsonResponse({ calculated: rows.length, published: publish });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: String(error) }, 500);
  }
});
