import { describe, expect, it } from "vitest";
import {
  buildFixtureCatalog,
  groupPredictedSelectionsByAlliance
} from "@/lib/data/adapter";
import { fixturePredictions } from "@/lib/data/fixtures";

describe("groupPredictedSelectionsByAlliance", () => {
  it("groups saved picks under the selected alliance with constituency and candidate names", () => {
    const grouped = groupPredictedSelectionsByAlliance(
      buildFixtureCatalog(),
      fixturePredictions
    );

    expect(grouped["alliance-dmk"]).toEqual([
      {
        constituencyId: "ac-chepauk",
        constituencyName: "Chepauk-Thiruvallikeni",
        candidateName: "Udhayanidhi Stalin"
      },
      {
        constituencyId: "ac-madurai-central",
        constituencyName: "Madurai Central",
        candidateName: "P. T. R. Palanivel Thiaga Rajan"
      },
      {
        constituencyId: "ac-thanjavur",
        constituencyName: "Thanjavur",
        candidateName: "T. K. G. Neelamegam"
      }
    ]);
    expect(grouped["alliance-admk"]).toEqual([
      {
        constituencyId: "ac-coimbatore-south",
        constituencyName: "Coimbatore South",
        candidateName: "Amman K. Arjunan"
      }
    ]);
  });

  it("falls back to Unknown candidate when a saved candidate is missing from catalog", () => {
    const grouped = groupPredictedSelectionsByAlliance(buildFixtureCatalog(), [
      {
        ...fixturePredictions[0],
        predictedCandidateId: "missing-candidate-id"
      }
    ]);

    expect(grouped["alliance-dmk"]).toEqual([
      {
        constituencyId: "ac-chepauk",
        constituencyName: "Chepauk-Thiruvallikeni",
        candidateName: "Unknown candidate"
      }
    ]);
  });
});
