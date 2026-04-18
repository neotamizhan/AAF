import { z } from "zod";
import { normalizeCandidateName } from "@/lib/csv/normalize";

const sourceStatus = z.enum(["imported", "verified", "manual_override"]);
const resultStatus = z.enum(["leading", "final"]);

export const currentCandidateRowSchema = z.object({
  election_code: z.string().min(1),
  constituency_name: z.string().min(1),
  candidate_name: z.string().min(1),
  party_code: z.string().min(1),
  source_url: z.string().url().optional().or(z.literal("")),
  source_status: sourceStatus.default("imported"),
  notes: z.string().optional().or(z.literal(""))
});

export const previousResultRowSchema = z.object({
  constituency_name: z.string().min(1),
  election_year: z.coerce.number().int().min(1950),
  rank: z.coerce.number().int().min(1).max(3),
  candidate_name: z.string().min(1),
  party_name: z.string().optional().or(z.literal("")),
  votes: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  vote_share: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  source_url: z.string().url().optional().or(z.literal(""))
});

export const actualResultRowSchema = z.object({
  election_code: z.string().min(1),
  constituency_name: z.string().min(1),
  winning_candidate_name: z.string().min(1),
  winning_party_code: z.string().min(1),
  votes_won: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  runner_up_votes: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  margin: z.coerce.number().int().optional().or(z.literal("")),
  result_status: resultStatus.default("final"),
  source_url: z.string().url().optional().or(z.literal(""))
});

export type ValidationIssue = {
  rowNumber: number;
  field: string;
  message: string;
};

export type ValidationResult<T> = {
  validRows: T[];
  issues: ValidationIssue[];
};

export function validateRows<T>(
  rows: Record<string, unknown>[],
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const validRows: T[] = [];
  const issues: ValidationIssue[] = [];

  rows.forEach((row, index) => {
    const parsed = schema.safeParse(row);

    if (parsed.success) {
      validRows.push(parsed.data);
      return;
    }

    parsed.error.issues.forEach((issue) => {
      issues.push({
        rowNumber: index + 2,
        field: issue.path.join(".") || "row",
        message: issue.message
      });
    });
  });

  return { validRows, issues };
}

export function validateCandidateNamePair(a: string, b: string) {
  return normalizeCandidateName(a) === normalizeCandidateName(b);
}
