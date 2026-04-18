# ADR 0001: Next.js and Supabase MVP

## Status

Accepted

## Context

The contest needs Google login, protected user predictions, CSV admin imports, final submission locking, and server-side scoring.

## Decision

Use Next.js App Router for the frontend and Supabase for Auth, Postgres, RLS, and Edge Functions.

## Consequences

- Browser code never receives the service-role key.
- Final submission and scoring are enforced server-side.
- Fixture data keeps local frontend development usable before Supabase is configured.
- CSV imports remain admin-controlled through Edge Functions.
