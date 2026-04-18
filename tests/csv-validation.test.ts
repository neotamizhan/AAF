import { describe, expect, it } from "vitest";
import { normalizeCandidateName } from "@/lib/csv/normalize";
import {
  currentCandidateRowSchema,
  validateRows
} from "@/lib/csv/validation";

describe("CSV validation helpers", () => {
  it("normalizes candidate names without losing display spelling", () => {
    expect(normalizeCandidateName("  P. T. R.  Palanivel Thiaga Rajan  ")).toBe(
      "p. t. r. palanivel thiaga rajan"
    );
    expect(normalizeCandidateName("Kalaignar’s Candidate")).toBe(
      "kalaignar's candidate"
    );
  });

  it("reports row-level validation issues", () => {
    const result = validateRows(
      [
        {
          election_code: "tn-2026",
          constituency_name: "Katpadi",
          candidate_name: "Duraimurugan",
          party_code: "DMK",
          source_status: "verified"
        },
        {
          election_code: "",
          constituency_name: "",
          candidate_name: "Missing party",
          party_code: "",
          source_status: "unknown"
        }
      ],
      currentCandidateRowSchema
    );

    expect(result.validRows).toHaveLength(1);
    expect(result.issues.length).toBeGreaterThanOrEqual(3);
    expect(result.issues[0]?.rowNumber).toBe(3);
  });
});
