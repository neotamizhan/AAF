import { describe, expect, it } from "vitest";
import { buildFixtureCatalog } from "@/lib/data/adapter";
import {
  fixtureActualResults,
  fixtureAlliances,
  fixtureElection,
  fixturePredictions
} from "@/lib/data/fixtures";
import type { Prediction, Submission } from "@/lib/types";
import { scoreContest } from "@/lib/scoring";

describe("scoreContest", () => {
  it("applies winning-alliance, seat-total, distribution, and VIP scoring", () => {
    const submissions: Submission[] = [
      {
        electionId: fixtureElection.id,
        userId: "fixture-user",
        isFinal: true,
        finalSubmittedAt: "2026-05-01T10:00:00.000Z"
      }
    ];

    const scores = scoreContest({
      alliances: fixtureAlliances,
      constituencies: buildFixtureCatalog(),
      predictions: fixturePredictions,
      actualResults: fixtureActualResults,
      submissions
    });

    expect(scores).toHaveLength(1);
    expect(scores[0]).toMatchObject({
      userId: "fixture-user",
      exactWinningAllianceHits: 1,
      exactWinningAllianceSeatHits: 0,
      vipHits: 2
    });
    expect(scores[0]?.totalScore).toBe(45);
  });

  it("uses final submission time after score and tie-breaker hits", () => {
    const firstUserPredictions = fixtureActualResults.map<Prediction>((result, index) => ({
      id: `p-a-${index}`,
      electionId: fixtureElection.id,
      userId: "early",
      constituencyId: result.constituencyId,
      predictedCandidateId: result.winningCandidateId ?? "",
      predictedPartyId: result.winningPartyId ?? "",
      predictedAllianceId: result.winningAllianceId ?? "",
      updatedAt: "2026-04-20T00:00:00.000Z"
    }));
    const secondUserPredictions = firstUserPredictions.map((prediction) => ({
      ...prediction,
      id: prediction.id.replace("p-a", "p-b"),
      userId: "late"
    }));

    const scores = scoreContest({
      alliances: fixtureAlliances,
      constituencies: buildFixtureCatalog(),
      predictions: [...firstUserPredictions, ...secondUserPredictions],
      actualResults: fixtureActualResults,
      submissions: [
        {
          electionId: fixtureElection.id,
          userId: "late",
          isFinal: true,
          finalSubmittedAt: "2026-05-01T11:00:00.000Z"
        },
        {
          electionId: fixtureElection.id,
          userId: "early",
          isFinal: true,
          finalSubmittedAt: "2026-05-01T09:00:00.000Z"
        }
      ]
    });

    expect(scores.map((score) => score.userId)).toEqual(["early", "late"]);
  });
});
