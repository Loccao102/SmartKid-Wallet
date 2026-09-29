# Production Deployment — SmartKid Wallet

## 1. Source of truth

Canonical repository:

```text
Loccao102/SmartKid-Wallet
```

Temporary Vercel deployment mirror:

```text
Loccao102/smartkidwallet
```

The mirror is temporary and must not receive feature development.

## 2. Current production

```text
Vercel project: smartkidwallet
Production URL: https://smartkidwallet.vercel.app
```

Runtime check after cleanup:
- latest production deployment: READY;
- no Vercel runtime errors in the latest checked window;
- feature-level Error Boundary is deployed.

## 3. Reconnect Vercel to canonical repository

The current MCP connector cannot mutate the Git repository attached to an existing Vercel project.

Use Vercel CLI from a local checkout of the canonical repository:

```bash
git clone https://github.com/Loccao102/SmartKid-Wallet.git
cd SmartKid-Wallet

npx vercel link
# Select team: loccao102s-projects
# Select existing project: smartkidwallet

npx vercel git disconnect
npx vercel git connect
```

`vercel git connect` uses the local Git remote, so it should connect the existing Vercel project to:

```text
Loccao102/SmartKid-Wallet
```

Verify in Vercel Project → Settings → Git before continuing.

## 4. Verification after reconnect

1. Push a harmless commit to canonical `main`.
2. Confirm Vercel deployment metadata shows:
   - githubOrg = Loccao102
   - githubRepo = SmartKid-Wallet
3. Confirm `https://smartkidwallet.vercel.app` still serves the project.
4. Run critical app smoke:
   - open SmartMart;
   - complete/open a stall;
   - open Mission;
   - open Work Mode.
5. Run Supabase Smoke workflow.
6. Check Vercel runtime errors.

Only after all six checks pass should the mirror be archived.

## 5. Mirror retirement

After successful reconnect:
- archive `Loccao102/smartkidwallet`;
- do not delete immediately; keep it for short rollback/history window;
- remove mirror-specific sync instructions;
- close the reconnect GitHub issue.

## 6. Release rule

Production v1 rule:

```text
canonical main
→ CI
→ Vercel production
```

No manual file copying between repositories.


## 7. Reconnect verification checkpoint

A harmless canonical-repository commit is used after Git reconnect to verify that the existing Vercel project now deploys from:

```text
Loccao102/SmartKid-Wallet
```

Verification passes only when new deployment metadata reports `githubRepo = SmartKid-Wallet`.
