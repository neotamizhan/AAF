import type {
  ActualResult,
  Alliance,
  ConstituencyCatalogItem,
  Prediction,
  Submission
} from "@/lib/types";

export type ScoreInput = {
  alliances: Alliance[];
  constituencies: ConstituencyCatalogItem[];
  predictions: Prediction[];
  actualResults: ActualResult[];
  submissions: Submission[];
};

export type UserScore = {
  electionId: string;
  userId: string;
  totalScore: number;
  exactWinningAllianceHits: number;
  exactWinningAllianceSeatHits: number;
  exactAllianceDistributionHits: number;
  vipHits: number;
  finalSubmittedAt: string | null;
};

function seatDiffPoints(diff: number, exactPoints: number, fivePoints: number, tenPoints: number) {
  if (diff === 0) return exactPoints;
  if (diff <= 5) return fivePoints;
  if (diff <= 10) return tenPoints;
  return 0;
}

function seatTotalsByAlliance(
  alliances: Alliance[],
  rows: Array<{ allianceId: string | null }>
) {
  const totals = new Map(alliances.map((alliance) => [alliance.id, 0]));

  rows.forEach((row) => {
    if (!row.allianceId) return;
    totals.set(row.allianceId, (totals.get(row.allianceId) ?? 0) + 1);
  });

  return totals;
}

function winningAllianceFromTotals(totals: Map<string, number>) {
  return [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
}

export function scoreContest(input: ScoreInput): UserScore[] {
  const actualTotals = seatTotalsByAlliance(
    input.alliances,
    input.actualResults.map((result) => ({
      allianceId: result.winningAllianceId
    }))
  );
  const actualWinningAlliance = winningAllianceFromTotals(actualTotals);
  const vipConstituencyIds = new Set(
    input.constituencies.filter((item) => item.isVip).map((item) => item.id)
  );
  const resultByConstituency = new Map(
    input.actualResults.map((result) => [result.constituencyId, result])
  );

  return input.submissions
    .filter((submission) => submission.isFinal)
    .map((submission) => {
      const userPredictions = input.predictions.filter(
        (prediction) =>
          prediction.electionId === submission.electionId &&
          prediction.userId === submission.userId
      );
      const predictedTotals = seatTotalsByAlliance(
        input.alliances,
        userPredictions.map((prediction) => ({
          allianceId: prediction.predictedAllianceId
        }))
      );
      const predictedWinningAlliance = winningAllianceFromTotals(predictedTotals);

      let totalScore = 0;
      let exactWinningAllianceHits = 0;
      let exactWinningAllianceSeatHits = 0;
      let exactAllianceDistributionHits = 0;

      if (
        actualWinningAlliance &&
        predictedWinningAlliance &&
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
        const points = seatDiffPoints(diff, 10, 5, 2);
        totalScore += points;
        exactWinningAllianceSeatHits = diff === 0 ? 1 : 0;
      }

      input.alliances.forEach((alliance) => {
        const diff = Math.abs(
          (predictedTotals.get(alliance.id) ?? 0) -
            (actualTotals.get(alliance.id) ?? 0)
        );
        totalScore += seatDiffPoints(diff, 5, 3, 1);
        if (diff === 0) {
          exactAllianceDistributionHits += 1;
        }
      });

      const vipHits = userPredictions.filter((prediction) => {
        if (!vipConstituencyIds.has(prediction.constituencyId)) return false;
        const actual = resultByConstituency.get(prediction.constituencyId);
        return actual?.winningCandidateId === prediction.predictedCandidateId;
      }).length;

      totalScore += vipHits * 2;

      return {
        electionId: submission.electionId,
        userId: submission.userId,
        totalScore,
        exactWinningAllianceHits,
        exactWinningAllianceSeatHits,
        exactAllianceDistributionHits,
        vipHits,
        finalSubmittedAt: submission.finalSubmittedAt
      };
    })
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.vipHits !== a.vipHits) return b.vipHits - a.vipHits;
      if (b.exactAllianceDistributionHits !== a.exactAllianceDistributionHits) {
        return b.exactAllianceDistributionHits - a.exactAllianceDistributionHits;
      }
      return (
        Date.parse(a.finalSubmittedAt ?? "9999-12-31T00:00:00.000Z") -
        Date.parse(b.finalSubmittedAt ?? "9999-12-31T00:00:00.000Z")
      );
    });
}
