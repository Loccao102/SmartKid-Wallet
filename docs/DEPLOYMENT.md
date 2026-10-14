# SmartKid Wallet — production deployment and canonical source

## Canonical source

- Educational application: `Loccao102/SmartKid-Wallet` (canonical GitHub repository).
- Historical temporary mirror: `Loccao102/smartkidwallet` (lowercase).
- **Do not assume the lower-case mirror still deploys SmartKid Wallet.** It has
  since been repurposed for a distinct 3D birthday-memory website.

## Verified Vercel audit — 2026-10-14 (read-only)

On the accessible Vercel team `loccao102s-projects`, a read-only listing showed
six projects but **no project named `smartkidwallet`**. The previous project
name and `https://smartkidwallet.vercel.app` URL documented here are therefore
**historical references, not a verified current production deployment**.

The Vercel project `birthday-memory-sky` has a READY production deployment
with Git metadata pointing to `Loccao102/smartkidwallet`, commit
`1c6198e365e16edba15c89742f816ec637b0b690`. That project belongs to
the birthday website and must not be repurposed or disconnected during
SmartKid Wallet cleanup.

The SmartKid production URL, owning Vercel project ID, and current Git link
remain **unverified** and must be resolved before any reconnect operation.

## Recovery / Git-link checklist — approval required

1. Find the Vercel project owning the historical domain, including any other
   account/team scopes. Verify the project ID and existing production branch.
2. If the project is absent, decide whether to create a new SmartKid Vercel
   project instead of trying to link to the unrelated birthday project.
3. Inspect the latest educational-app deployment and its current source SHA.
4. Back up the project settings, runtime configuration and rollback path.
5. After explicit approval, connect **only the educational project** to
   `Loccao102/SmartKid-Wallet` and `main`. Verify the exact Git repository
   in Vercel Settings → Git before any build or deploy.
6. Approve a separate, gated release. Confirm deployment Git metadata reports
   `githubRepo = SmartKid-Wallet`; smoke-test SmartMart, Mission, Work Mode,
   Supabase authentication and student/teacher progression.
7. Review error logs and rollback readiness. Update issue #1 with verified
   project ID, deployment URL, source commit and CI evidence.

## Mirror policy

**Do not archive or delete `Loccao102/smartkidwallet`.** It currently hosts
the birthday-memory site. Retiring any old educational deployment or mirror
requires a separate inventory of its consumers and explicit approval.

## CI / release policy

```text
Loccao102/SmartKid-Wallet main
  → required CI / tests
  → reviewed production candidate
  → explicit deploy approval
  → smoke / monitoring / rollback readiness
```

CI passing alone is not evidence that the production service is connected,
reachable or safe to deploy. Never copy secrets from Vercel into GitHub comments
or CI artifacts.
