# App Blueprint

The source blueprint for this build is kept at the repository root:

`tn-election-contest-technical-blueprint.md`

Implementation choices in this codebase follow that document:

- reusable election model instead of one-off hardcoding
- separate party and alliance mapping
- CSV-first admin imports
- server-enforced final submission
- scoring and leaderboard calculation outside the browser
- Supabase Row Level Security for all protected writes
- GitHub Actions for CI and deploys
