# Backend Implementation Prompt

Implement Supabase backend changes for the Tamil Nadu election contest.

Constraints:

- Every schema change goes in `supabase/migrations/`.
- Enforce lock/final-submission rules in SQL policies or Edge Functions.
- Do not expose service-role credentials to frontend code.
- CSV imports should validate references and support dry-run mode.
- Score calculation must be idempotent.
