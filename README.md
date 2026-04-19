# Tamil Nadu Election Prediction Contest

Mobile-friendly web app for predicting Tamil Nadu Assembly constituency winners and scoring entries after official results are imported.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Row Level Security, Edge Functions
- CSV-first admin imports
- GitHub Actions for CI, Vercel deploys, and Supabase deploys

## Local Development

```bash
pnpm install
pnpm dev
```

The app runs with fixture data when Supabase environment variables are absent. Add these values to `.env.local` for live Supabase reads and writes:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Google sign-in uses Supabase Auth's Google provider. Configure the Google OAuth client in Google Cloud and paste the client ID/secret into Supabase.

For production, set `NEXT_PUBLIC_SITE_URL` in Vercel to the public app URL, for example:

```bash
NEXT_PUBLIC_SITE_URL=https://tn-election-predictor.vercel.app
```

In Supabase Auth URL Configuration, set the Site URL to the same production URL and allow this callback URL:

```text
https://tn-election-predictor.vercel.app/auth/callback
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Supabase

Schema, views, helper functions, RLS policies, and seed data live in:

- `supabase/migrations/202604170001_initial_schema.sql`
- `supabase/seed.sql`
- `supabase/functions/*`

Run locally with the Supabase CLI:

```bash
supabase start
supabase db reset
supabase functions serve
```

## Main Routes

- `/` contest overview
- `/login` Google sign-in
- `/contest/tn-2026` dashboard
- `/contest/tn-2026/constituencies` filters and entry list
- `/contest/tn-2026/constituency/[id]` prediction entry
- `/contest/tn-2026/summary` final submission
- `/results/tn-2026` leaderboard and result review
- `/admin` CSV validation and import workflow entry

## Deployment Secrets

Frontend:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Supabase:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID_STAGING`
- `SUPABASE_PROJECT_ID_PROD`

Runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
