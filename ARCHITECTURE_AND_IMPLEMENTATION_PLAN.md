# undoverse.in — Architecture & Implementation Strategy

**Prepared for:** 72BPM, Trivandrum, Kerala  
**Date:** 2026-06-15  
**Status:** Proposed

---

## ADR-001: Platform Architecture for undoverse.in

### Context

undoverse.in is envisioned as the central aggregator, launchpad, and community hub for the "undo" ecosystem of web projects (currentundo, kuzhiundo, damundo, and future entries). The platform must simultaneously serve as:

1. A **multi-tenant hosting layer** — running sub-projects under one domain
2. A **creator economy platform** — profiles, tipping, analytics
3. A **community governance system** — upvoting, submissions, open-source hub

The core tension: we need to ship an MVP fast (Phase 1 in weeks, not months) while choosing an architecture that doesn't require a complete rewrite when Phase 2 and 3 arrive.

---

## Section 1: Core Architecture Decision

### Decision: Monorepo + Next.js App Router + Vercel Edge

Rather than splitting into separate services prematurely, undoverse.in should start as a well-structured **monorepo** with clear module boundaries. This lets you move fast on the MVP while making it easy to extract services later.

```
undoverse/
├── apps/
│   ├── web/               # Next.js — main undoverse.in site
│   └── docs/              # (optional) project documentation site
├── packages/
│   ├── ui/                # shared component library (Tailwind + shadcn/ui)
│   ├── db/                # Prisma schema + migrations
│   ├── auth/              # Auth.js config (GitHub OAuth)
│   └── config/            # shared ESLint, Tailwind, TypeScript configs
└── turbo.json             # Turborepo orchestration
```

**Why Turborepo + monorepo?**
- Sub-projects (currentundo, kuzhiundo etc.) can live as packages or separate apps in the same repo — easy to link, easy to share components
- One CI/CD pipeline, one place to contribute — critical for open-source community adoption
- Vercel deploys each `apps/*` independently — you get separate deployments but one repo

---

## Section 2: Technical Stack — Final Recommendations

| Layer | Choice | Reasoning |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui | App Router enables per-route caching, streaming, and server components — critical for a public-facing aggregator that needs SEO. shadcn/ui gives you accessible, customizable components without a design system from scratch. |
| **Auth** | Auth.js v5 (formerly NextAuth) | GitHub OAuth out of the box, extensible to UPI/wallet identities later. Handles sessions, JWTs, and database adapters. |
| **Database** | PostgreSQL via Neon (serverless) | Neon is serverless Postgres — no cold-start connection issues on Vercel Edge, branching for dev environments, generous free tier. Prisma ORM on top for type safety. |
| **API Layer** | Next.js Route Handlers (tRPC optional) | Start with Next.js Route Handlers. Add tRPC if internal API surface grows — it gives you end-to-end type safety without a separate server. |
| **Hosting** | Vercel (primary) | Wildcard subdomain support (`*.undoverse.in`) is first-class on Vercel Pro. Edge Network for global latency. Cloudflare as DNS layer on top for DDoS protection and analytics. |
| **Background Jobs** | Inngest | Serverless-native event queue for async tasks (analytics aggregation, upvote tallying, email notifications). No Redis/BullMQ infra to manage. |
| **Search** | Algolia (free tier) or Meilisearch (self-hosted) | Start with Algolia's free tier — 10K records is enough for MVP. Migrate to self-hosted Meilisearch on Railway/Fly.io when you outgrow it. |
| **Storage** | Cloudflare R2 | For project screenshots, builder avatars. S3-compatible API, zero egress fees. |
| **Analytics** | PostHog (open-source) | Self-hostable, gives you product analytics + session recordings. The "ecosystem analytics for creators" feature in Phase 2 can be built on PostHog's API. |
| **Package Manager** | pnpm + Turborepo | Fastest for monorepos. Required for Vercel monorepo deployments. |

---

## Section 3: Multi-Tenant Subdomain Routing

This is the most technically complex part of Phase 1. The goal: `kuzhiundo.undoverse.in` routes to the kuzhiundo app while sharing the same Next.js codebase.

### Approach: Next.js Middleware + Vercel Wildcard Domains

```typescript
// middleware.ts (runs on Edge — near-zero latency)
import { NextRequest, NextResponse } from 'next/server'

const SUBPROJECT_MAP: Record<string, string> = {
  'currentundo': '/projects/currentundo',
  'kuzhiundo':   '/projects/kuzhiundo',
  'damundo':     '/projects/damundo',
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const subdomain = host.split('.undoverse.in')[0]

  if (subdomain && SUBPROJECT_MAP[subdomain]) {
    // Rewrite internally — URL stays as kuzhiundo.undoverse.in for the user
    return NextResponse.rewrite(
      new URL(SUBPROJECT_MAP[subdomain] + req.nextUrl.pathname, req.url)
    )
  }
  return NextResponse.next()
}
```

**DNS setup:** Add a wildcard `CNAME *.undoverse.in → cname.vercel-dns.com` in Cloudflare. Vercel wildcard domains handle TLS termination automatically.

**Scaling this:** When a new "undo" project is approved through the submission portal, you add a row to the `subprojects` table. The middleware reads this from an Edge-compatible KV store (Vercel KV / Cloudflare KV) so routing updates without a redeploy.

---

## Section 4: Database Schema (Core Tables)

```sql
-- Core entities for Phase 1 + 2

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id   TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  upi_id      TEXT,           -- for micro-tipping
  wallet_addr TEXT,           -- for Web3 tipping
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,   -- 'kuzhiundo'
  name        TEXT NOT NULL,
  tagline     TEXT,
  description TEXT,
  repo_url    TEXT,
  status      TEXT DEFAULT 'active',  -- active | upcoming | archived
  subdomain   TEXT UNIQUE,            -- 'kuzhiundo' → kuzhiundo.undoverse.in
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE project_builders (
  project_id  UUID REFERENCES projects(id),
  user_id     UUID REFERENCES users(id),
  role        TEXT DEFAULT 'builder',  -- builder | maintainer | contributor
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE upvotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  user_id     UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_id UUID REFERENCES users(id),
  project_name TEXT NOT NULL,
  concept_url  TEXT,
  repo_url     TEXT,
  status       TEXT DEFAULT 'pending',  -- pending | approved | rejected
  created_at   TIMESTAMPTZ DEFAULT now()
);
```

---

## Section 5: Phased Implementation Plan

### Phase 1 — MVP (Target: 4 weeks)

**Goal:** A live, publicly accessible undoverse.in with the three existing projects listed, core visual identity, and subdomain routing working.

#### Week 1 — Foundation
- [ ] Initialize monorepo: `pnpm create turbo@latest`, add `apps/web`
- [ ] Configure Tailwind + shadcn/ui + base design tokens (brand colors, typography)
- [ ] Set up Neon PostgreSQL, run initial migration with `users` and `projects` tables
- [ ] Deploy skeleton to Vercel, configure `undoverse.in` domain + wildcard `*.undoverse.in`
- [ ] Set up GitHub repo, add `CONTRIBUTING.md` — open-source from day one

**Deliverable:** Live domain, basic "coming soon" page with brand identity

#### Week 2 — Core Landing Page
- [ ] Build the Unified Dashboard: project cards for currentundo, kuzhiundo, damundo
- [ ] Implement subdomain middleware routing (see Section 3)
- [ ] Create project detail pages `/projects/[slug]` with description, repo link, builder list
- [ ] Add global search (Algolia free tier) indexing project names and taglines
- [ ] Seed database with the three initial projects

**Deliverable:** Full landing page live, all three projects accessible via subdomains

#### Week 3 — Live Status & Polish
- [ ] Build changelog/status feed (simple — scrape GitHub releases via API, cache in DB)
- [ ] Add uptime badges (integrate with UptimeRobot free API)
- [ ] Mobile-responsive pass on all pages
- [ ] SEO: Open Graph images per project (auto-generated via `@vercel/og`), sitemap, robots.txt
- [ ] Set up PostHog analytics

**Deliverable:** Production-ready MVP, shareable on social

#### Week 4 — Buffer, QA & Launch
- [ ] Load testing, error boundary setup
- [ ] Write `README.md`, developer setup guide, architecture docs
- [ ] Soft launch to Kerala dev community (Kerala Developers Slack, local meetups)
- [ ] Gather feedback, triage issues

---

### Phase 2 — Creator & Automation Layer (Target: 6–8 weeks post-MVP)

**Goal:** GitHub OAuth login, builder profiles, project submission pipeline, automated subdomain routing.

#### Sprint 1 (2 weeks): Auth + Profiles
- [ ] Integrate Auth.js with GitHub OAuth
- [ ] Build builder profile pages `/builders/[username]`
- [ ] Profile editor: bio, UPI ID, wallet address, social links
- [ ] Connect builders to projects via `project_builders` table

#### Sprint 2 (2 weeks): Project Submission Portal
- [ ] Build `/submit` page — form for new "undo" project proposals
- [ ] Admin review queue (simple `/admin` route, protected by role check)
- [ ] On approval: auto-provision subdomain entry in Vercel KV, no redeploy needed
- [ ] Email notification on submission status (Resend.com — generous free tier)

#### Sprint 3 (2 weeks): Ecosystem Analytics for Builders
- [ ] Per-project analytics dashboard (pageviews, unique visitors from PostHog API)
- [ ] Upvote counts displayed on project cards, sortable by upvotes
- [ ] GitHub integration: pull open issues labeled "good first issue" from project repos
- [ ] Display contributor count, stars, last commit date on project cards

---

### Phase 3 — Economy & Scaling (Target: 3 months post-Phase 2)

**Goal:** Community governance, monetization, hackathons.

#### Micro-Tipping & Monetization
- [ ] UPI deep-link on builder profiles (works immediately, no integration needed — just a QR code or link)
- [ ] Buy Me a Coffee / Ko-fi embed on builder profiles
- [ ] Web3: WalletConnect + `wagmi` for ETH/MATIC tipping (optional, lower priority than UPI for Kerala audience)
- [ ] Tip history table for transparency

#### Community Layer
- [ ] Comment threads on projects (use Giscus — GitHub Discussions-backed, free, open-source aligned)
- [ ] Reddit-style upvote feed sorted by "hot" (Wilson score ranking)
- [ ] Hackathon/build sprint pages — time-boxed challenge listings
- [ ] Weekly "Undo Digest" email newsletter (Resend + custom template)

#### Scaling Infrastructure
- [ ] Move background jobs to Inngest (analytics rollups, digest emails)
- [ ] Add Redis (Upstash serverless) for rate limiting on upvotes and submissions
- [ ] Migrate search to self-hosted Meilisearch on Railway if Algolia free tier is exceeded
- [ ] Consider extracting the "project submission + routing" module as a standalone open-source package (`@undoverse/host`)

---

## Section 6: Open-Source Strategy

This is the strategic multiplier for the entire platform. Keeping undoverse.in open-source means:

1. **Kerala dev community builds the platform with you** — every contributor becomes an evangelist
2. **Projects submitted to undoverse.in can also contribute back** — two-way flywheel
3. **Credibility with the global developer-creator audience** you're targeting

**Recommended actions from day one:**
- Public GitHub repo under the `undoverse` organization
- `CONTRIBUTING.md` with clear "Good First Issues" from week 1
- MIT license for the core platform, individual "undo" projects can choose their own
- Ship a `packages/create-undo` CLI scaffolder: `npx create-undo my-project` — lets anyone spin up an "undo" project with the right structure to be eligible for submission

---

## Section 7: Cost Estimate (MVP to Phase 2)

| Service | Plan | Monthly Cost |
|---|---|---|
| Vercel | Pro (required for wildcard domains) | $20 |
| Neon PostgreSQL | Free tier (3GB) → Scale as needed | $0–$19 |
| Cloudflare | Free (DNS, R2 10GB) | $0 |
| Algolia | Free (10K records) | $0 |
| PostHog | Free (1M events/month) | $0 |
| Resend | Free (3K emails/month) | $0 |
| Upstash Redis | Free (10K commands/day) | $0 |
| **Total MVP** | | **~$20/month** |

> Vercel Pro is non-negotiable for wildcard subdomain support. Everything else can run on free tiers through Phase 1 and most of Phase 2.

---

## Section 8: Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Subdomain routing complexity delays MVP | Medium | High | Ship MVP without subdomain routing first (use `/projects/[slug]`) — add subdomains in Week 3 |
| Low project submission quality | Medium | Medium | Manual curation in Phase 1–2; introduce upvoting as quality signal in Phase 3 |
| Vercel lock-in | Low | Medium | All infra choices (Neon, R2, Inngest) are portable. Can migrate to Railway/Fly.io + self-hosted Next.js if needed |
| Open-source contributors introducing security issues | Low | High | Require PRs to pass CI, add CodeQL scanning from day one, keep admin routes behind role-check middleware |
| Kerala developer community adoption | Medium | High | Start with offline events (Trivandrum dev meetups), build in public on social — founder story from Kerala is a differentiator |

---

## Section 9: Immediate Next Steps (This Week)

1. **Register `undoverse.in`** on Namecheap/GoDaddy if not already done; point DNS to Cloudflare
2. **Create GitHub org `undoverse-in`**, initialize the monorepo with `pnpm create turbo`
3. **Design the brand** — choose a font pair and color palette; "undo" as a concept lends itself to a bold, playful identity (consider arrow/reset iconography)
4. **List the first three projects** — gather proper descriptions, repo URLs, and builder names for currentundo, kuzhiundo, damundo
5. **Upgrade Vercel to Pro** — needed for wildcard domains; start the 14-day trial now so it's ready when routing is built

---

*Document maintained by 72BPM | Trivandrum, Kerala*  
*Last updated: 2026-06-15*
