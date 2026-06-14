# ADR-003: Hosting Strategy — Vercel Pro + Cloudflare

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Deciders** | Yadukrishnan K H (CEO), 72BPM engineering |
| **Context** | undoverse.in — multi-tenant developer-creator hub |

---

## Context

undoverse.in is a Next.js 14 (App Router) application that must:

- Serve a fast, globally distributed, mostly-static hub (SSG/ISR) plus SSR tenant pages and serverless API routes.
- **Support wildcard subdomains** — every project lives at `<project>.undoverse.in`, so we need `*.undoverse.in` with a valid wildcard TLS certificate and edge middleware that routes by `Host`.
- Provide a smooth Git-driven CI/CD with per-branch preview environments matching our `develop → staging → main` flow.
- Run edge middleware (host-based routing) close to users.
- Stay cost-efficient at MVP while scaling to many tenants.

## Decision

We will host on **Vercel (Pro)** with **Cloudflare** managing DNS for the `undoverse.in` zone.

- **Vercel Pro** runs the Next.js app: edge middleware, SSR/ISR, serverless API routes, preview deployments per branch, and the production deployment from `main`.
- **Cloudflare** holds the `undoverse.in` DNS zone, including the root record and the **wildcard `*.undoverse.in` CNAME** pointed at Vercel. Vercel issues and renews the wildcard certificate for `*.undoverse.in`.
- The wildcard domain is configured at the Vercel project level so any subdomain reaches the same app, where middleware resolves the tenant.

## Alternatives Considered

### 1. Railway
- **Pros:** simple, good DX, container-based, cheap to start.
- **Cons:** not Next.js-native (no first-class ISR/edge-middleware/preview-per-branch story like Vercel); wildcard subdomain + edge routing would need more manual setup. **Rejected** — weaker fit for Next.js edge features.

### 2. Fly.io
- **Pros:** global app deployment, fine-grained control, good for long-running/containerised workloads.
- **Cons:** we'd self-manage the Next.js build/runtime, ISR, and edge middleware; more ops for a small team; preview environments not as turnkey. **Rejected** — too much undifferentiated infra work for MVP.

### 3. AWS (Amplify / CloudFront + Lambda / ECS)
- **Pros:** maximum flexibility and scale; full control of wildcard ACM certs and routing.
- **Cons:** highest operational complexity; we'd hand-build the Next.js edge/ISR pipeline, preview deploys, and CDN; slows a 4-week MVP. **Rejected for MVP** — reconsider only at much larger scale or specific compliance needs.

### 4. Self-hosted (VPS / Kubernetes)
- **Pros:** full ownership; no platform lock-in; potentially cheapest at large scale.
- **Cons:** we own TLS (incl. wildcard), autoscaling, edge caching, CI/CD, uptime, and on-call — far beyond a small team's MVP budget. **Rejected** — operational burden outweighs benefits now.

## Consequences

**Positive**
- Native Next.js 14 support: edge middleware for `Host`-based tenant routing, ISR for the hub/tenant pages, serverless API routes — no custom infra.
- Git-driven CI/CD with **preview deployments per branch** maps exactly onto `feature/* → develop → staging → main`.
- **Wildcard `*.undoverse.in`** is configured once; adding a project becomes a DB row + Algolia index, not an infra change — this is the key requirement that drives the choice.
- Cloudflare gives robust, fast DNS, plus optional WAF/DDoS protection in front of the zone.
- Global edge delivery improves Core Web Vitals for users in India and beyond.

**Negative / trade-offs**
- Platform coupling to Vercel's build/runtime model (lock-in risk) — mitigated because the app is standard Next.js and portable in principle.
- Cost scales with usage/seats on Pro; needs monitoring against MVP budget (alerts on function/bandwidth usage).
- Two providers to coordinate for DNS/TLS — Cloudflare DNS + Vercel cert issuance. The wildcard cert flow (CNAME at Cloudflare, verification at Vercel) must be set up carefully and is documented in DEPLOYMENT_RUNBOOK §C.2.
- Cloudflare proxy (orange-cloud) interactions with Vercel must be configured correctly for the wildcard to validate; use DNS-only/CNAME as Vercel requires for the wildcard.

**Follow-ups**
- Configure `*.undoverse.in` and `undoverse.in` in Vercel project domains; verify wildcard cert issuance.
- Document DNS/cert steps and a recovery procedure in the runbook.
- Add usage/billing alerts in Vercel; uptime monitor on `/api/health`.
