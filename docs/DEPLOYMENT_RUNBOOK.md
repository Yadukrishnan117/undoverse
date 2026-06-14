# Deployment Runbook — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | Deployment Runbook |
| **Version** | 1.0 |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author / On-call lead** | Yadukrishnan K H — yadu@chargemod.com |
| **Related** | SYSTEM_DESIGN.md, TEST_PLAN.md, ADR/ADR-003 |

This runbook is the operational source of truth for deploying undoverse.in across the three environments. Deployment is Git-driven on Vercel.

**Promotion flow:**
```
feature/* ──PR──▶ develop ──▶ staging ──UAT sign-off──▶ main
   (dev)          (dev)        (UAT)                    (production)
```

| Branch | Environment | Hosting | Domain |
|---|---|---|---|
| `feature/*` | Per-PR preview | Vercel Preview | `*-undoverse.vercel.app` |
| `develop` | Dev (integration) | Vercel Preview | `dev-undoverse.vercel.app` |
| `staging` | UAT | Vercel Preview | `staging-undoverse.vercel.app` + `*.staging` |
| `main` | Production | Vercel Production | `undoverse.in`, `*.undoverse.in` |

Each environment has its own Neon database branch, GitHub OAuth app, Algolia index, and PostHog project, with isolated secrets.

---

## A. Dev Environment

### A.1 Branch Strategy
- Branch from `develop`: `feature/<ticket>-<short-desc>` (e.g. `feature/UND-12-upvote-toggle`).
- Open a PR into `develop`. CI runs lint, type-check, unit, integration, E2E (preview), Lighthouse, axe.
- Squash-merge into `develop` after green CI + 1 review. `develop` auto-deploys to the dev preview.
- Keep PRs small; rebase on `develop` before merge.

### A.2 Local Setup
```bash
# Prerequisites: Node 20+, pnpm, a Neon dev branch URL, GitHub OAuth (dev) creds
git clone git@github.com:72bpm/undoverse.git
cd undoverse
pnpm install
cp .env.example .env.local          # fill values (see A.3)
pnpm db:generate                     # prisma generate
pnpm db:migrate:dev                  # apply migrations to your dev DB branch
pnpm db:seed                         # seed currentundo, kuzhiundo, damundo + builders
pnpm dev                             # Turborepo dev; app at http://localhost:3000
```
**Subdomain testing locally:** use `*.localhost` (Chrome) or `lvh.me` — e.g. `http://currentundo.localhost:3000`. Confirm middleware resolves tenant correctly.

### A.3 Environment Variables (dev)
Stored in `.env.local` (never committed). Mirror these per environment in Vercel.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection (app runtime) |
| `DIRECT_URL` | Neon **direct** connection (migrations) |
| `AUTH_SECRET` | Auth.js v5 secret (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth app (dev) |
| `AUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `localhost:3000` (dev) / `undoverse.in` (prod) |
| `ALGOLIA_APP_ID` / `ALGOLIA_ADMIN_KEY` | Algolia indexing (server) |
| `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia search-only (client) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog |
| `RATE_LIMIT_REDIS_URL` | Upstash/Vercel KV for rate limiting (optional in dev) |

---

## B. UAT Environment

### B.1 Branch & Deploy
- Open a PR from `develop` → `staging` when a release candidate is ready.
- Merge triggers a Vercel deploy to the UAT preview.
- **Run DB migrations** against the UAT Neon branch as part of the deploy (`prisma migrate deploy` via build/predeploy step).

### B.2 Vercel Preview URL Pattern
- Stable UAT alias: `staging-undoverse.vercel.app`.
- Per-commit previews: `undoverse-git-staging-72bpm.vercel.app`.
- Wildcard UAT subdomains validated via the staging wildcard alias (configured in Vercel project domains for the staging environment).

### B.3 UAT Smoke Tests
Run the Playwright UAT smoke suite against the staging alias:
```bash
PLAYWRIGHT_BASE_URL=https://staging-undoverse.vercel.app pnpm test:e2e:smoke
```
Smoke covers: hub loads, subdomain routing (currentundo/kuzhiundo/damundo + 404 + www), search, GitHub OAuth round-trip, upvote toggle, submission happy path, changelog feed.

### B.4 UAT Sign-off Checklist
- [ ] All P0 E2E (E2E-01..E2E-08) pass on UAT.
- [ ] Subdomain routing verified live for all 3 projects + branded 404 + www→root redirect.
- [ ] GitHub OAuth completes on the UAT OAuth app; session persists; sign-out works.
- [ ] No serious/critical accessibility violations on hub, project, profile, search.
- [ ] Core Web Vitals within targets (lab) on the four key pages.
- [ ] SEO checks: titles, meta, OG, sitemap.xml, robots.txt correct.
- [ ] No open P0/P1 bugs.
- [ ] DB migration applied cleanly; seed/expected data present.
- [ ] Sign-off recorded (date, git SHA, approver = Yadu or delegate).

---

## C. Production Environment

### C.1 Branch & Promotion
- After UAT sign-off, open a PR `staging` → `main`.
- Merge to `main` triggers the **production** Vercel deployment.
- `main` is protected: requires green CI + sign-off; no direct pushes.

### C.2 Pre-Deploy Checklist (run before merging to `main`)
1. [ ] UAT sign-off recorded for this exact git SHA.
2. [ ] `CHANGELOG.md` updated with the release version and notes.
3. [ ] Version/tag prepared (e.g. `v0.1.0-alpha`).
4. [ ] Database migrations reviewed; confirmed **forward-only and reversible** within the window.
5. [ ] Migration tested on UAT Neon branch with production-like data shape.
6. [ ] All required **production** env vars present in Vercel (DB pooled+direct, AUTH_*, GitHub prod OAuth, Algolia, PostHog, rate-limit).
7. [ ] Production GitHub OAuth app callback URLs include `https://undoverse.in/api/auth/callback/github`.
8. [ ] Cloudflare DNS: `undoverse.in` and `*.undoverse.in` point to Vercel; wildcard cert issued/valid.
9. [ ] Algolia production index populated/reindexed and search-only key scoped.
10. [ ] PostHog production project key set; reverse-proxy/host correct.
11. [ ] Rate-limit store (Upstash/KV) provisioned for production.
12. [ ] Security headers (CSP, HSTS, nosniff, referrer-policy) confirmed in config.
13. [ ] `/api/health` returns ok on the latest preview.
14. [ ] Rollback target identified (current production deployment SHA noted).
15. [ ] On-call available; deploy not on a Friday evening / before time off.
16. [ ] Backup/restore path for Neon confirmed (point-in-time available).

### C.3 Deploy Procedure
1. Merge `staging` → `main` (squash or merge per policy).
2. Vercel builds and runs the production deployment; `prisma migrate deploy` runs as a predeploy/build step against the production direct URL.
3. Watch the Vercel build + function logs for errors.
4. Promote to production domains (automatic on `main` for the production project).
5. Tag the release in Git: `git tag v0.1.0-alpha && git push --tags`.

### C.4 Post-Deploy Verification
- [ ] `https://undoverse.in/api/health` → `{ ok: true, db: "up" }`.
- [ ] Hub loads; 3 project cards visible; no console errors.
- [ ] `currentundo.undoverse.in`, `kuzhiundo.undoverse.in`, `damundo.undoverse.in` resolve over HTTPS (valid wildcard cert).
- [ ] `nope.undoverse.in` → branded 404; `www.undoverse.in` → 308 to root.
- [ ] GitHub OAuth sign-in/sign-out works in production.
- [ ] Upvote toggle persists; submission form validates and submits.
- [ ] Search returns results (Algolia); fallback path sane.
- [ ] PostHog receiving events (page_viewed visible in dashboard).
- [ ] Core Web Vitals sampling looks healthy after ~15–30 min of traffic.
- [ ] No spike in 5xx in Vercel logs.

### C.5 Rollback Procedure
**Fast path (code):**
1. In Vercel → Deployments, select the previous known-good production deployment.
2. **Promote to Production** (instant rollback to that build).
3. Verify `/api/health` and the post-deploy checks above.

**If a migration is involved:**
1. If the new migration is backward-compatible (expand/contract pattern), rolling back code alone is safe — do the fast path.
2. If not, restore the database from Neon point-in-time **before** rolling back code, or apply the prepared down-migration. Coordinate so code and schema versions match.
3. Re-run post-deploy verification.
4. Record the incident (what failed, action taken) for the postmortem.

**Prevention:** prefer expand/contract migrations (add new, deploy, backfill, switch, remove old in a later release) so code and schema are never tightly coupled in one deploy.

### C.6 On-Call & Escalation
| Level | Who | When |
|---|---|---|
| L1 — Primary on-call | Engineer who deployed | First responder; triage within 15 min of alert |
| L2 — Eng lead | 72BPM engineering lead | If L1 can't resolve in 30 min or impact is widespread |
| L3 — CEO | Yadukrishnan K H (yadu@chargemod.com) | Major outage, data risk, or external comms needed |

**Alert sources:** Vercel deployment/function failures, uptime monitor on `/api/health`, error-rate threshold.
**During an incident:** acknowledge → assess severity → stabilise (rollback if fastest) → communicate → fix forward → write a short blameless postmortem.

---

## D. Quick Reference

```bash
# Common ops
pnpm dev                       # local dev
pnpm db:migrate:dev            # create/apply dev migration
pnpm db:migrate:deploy         # apply migrations (UAT/prod, CI)
pnpm db:seed                   # seed initial projects
pnpm test                      # unit + integration
pnpm test:e2e                  # full Playwright suite
pnpm test:e2e:smoke            # UAT/prod smoke subset
pnpm build                     # production build
```

| Need | Where |
|---|---|
| Deploys / logs / env vars | Vercel dashboard (project: undoverse) |
| DNS / wildcard | Cloudflare (zone: undoverse.in) |
| DB branches / restore | Neon console |
| OAuth apps | GitHub → Settings → Developer settings |
| Search index | Algolia dashboard |
| Analytics | PostHog dashboard |

---

*End of Deployment Runbook v1.0 — undoverse.in — 72BPM.*
