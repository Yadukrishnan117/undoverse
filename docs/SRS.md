# Software Requirements Specification — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | Software Requirements Specification (SRS) |
| **Version** | 1.0 |
| **Status** | Approved for MVP |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author / Approver** | Yadukrishnan K H (CEO) — yadu@chargemod.com |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the complete software requirements for **undoverse.in**, a multi-tenant developer-creator economy hub for the "undo" ecosystem. It is written for engineers, designers, QA, and stakeholders at 72BPM and serves as the contractual baseline against which the MVP (and subsequent phases) will be built, tested, and accepted.

The SRS defines *what* the system must do and the qualities it must exhibit. It deliberately avoids prescribing *how* beyond the agreed technology stack; implementation detail lives in `SYSTEM_DESIGN.md`.

### 1.2 Scope

undoverse.in is the central hub for the undo ecosystem of products. It hosts a discoverable catalogue of community projects (initially **currentundo**, **kuzhiundo**, and **damundo**), gives each project a dedicated subdomain, and provides the surface for builders to publish, profile, and grow their work.

**In scope (across all phases):**

- A public landing page that showcases the ecosystem and its projects.
- Wildcard subdomain routing so each project resolves at `<project>.undoverse.in`.
- Project discovery: cards, search, filtering, and upvoting.
- Builder accounts via GitHub OAuth, with public builder profiles.
- A submission portal for builders to add new projects.
- An analytics dashboard for builders and admins.
- A public changelog/activity feed for the ecosystem.

**Out of scope (for MVP, may appear in later phases):**

- Monetisation, payments, payouts, and revenue sharing (Phase 3).
- Native mobile applications.
- Real-time chat or messaging between builders.
- Self-serve white-label tenancy for third parties.

**Phasing:**

| Phase | Theme | Duration | Headline deliverables |
|---|---|---|---|
| Phase 1 | **MVP** | 4 weeks | Landing page, subdomain routing, project cards, search, GitHub OAuth, submission portal, builder profiles, upvotes |
| Phase 2 | **Creator Layer** | 6–8 weeks | Rich builder profiles, analytics dashboard, changelog feed, project versioning, follow system |
| Phase 3 | **Economy & Scale** | ~3 months | Monetisation primitives, reputation/credits, sponsorships, scale hardening |

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Meaning |
|---|---|
| **Undo ecosystem** | The family of community products built around the "undo" concept (currentundo, kuzhiundo, damundo, and future projects). |
| **Builder** | An authenticated user who creates and submits projects. (We say *builder*, never "developer" or "user" in product copy.) |
| **Project** | A product/app listed on undoverse, addressable at its own subdomain. |
| **Tenant** | A project occupying a subdomain; undoverse is multi-tenant by subdomain. |
| **Upvote** | A signal of appreciation from an authenticated builder toward a project. |
| **Hub** | The root undoverse.in surface (landing, search, discovery). |
| **MVP** | Minimum Viable Product (Phase 1). |
| **UAT** | User Acceptance Testing (staging environment, `staging` branch). |
| **FR / NFR** | Functional / Non-Functional Requirement. |
| **WCAG** | Web Content Accessibility Guidelines. |
| **CWV** | Core Web Vitals (LCP, INP, CLS). |
| **ISR / SSR / SSG** | Incremental Static Regeneration / Server-Side Rendering / Static Site Generation (Next.js rendering modes). |

### 1.4 References

- `SYSTEM_DESIGN.md` — architecture and API/DB design.
- `TEST_PLAN.md` — verification strategy.
- `DEPLOYMENT_RUNBOOK.md` — operational procedures.
- `ADR/` — architecture decision records.
- Next.js 14, Prisma, Auth.js v5, Neon, Vercel, Algolia, PostHog official documentation.
- WCAG 2.1 (W3C Recommendation).

---

## 2. Overall Description

### 2.1 Product Perspective

undoverse.in is a **new, self-contained web product** — not a component of a larger existing system. It is a server-rendered Next.js 14 application organised as a Turborepo monorepo, with shared packages (UI, config, database client) consumed by one or more Next.js apps. Persistence is a single Neon PostgreSQL database accessed through Prisma. Authentication is delegated to GitHub via Auth.js v5. Hosting and CI/CD are on Vercel, fronted by Cloudflare DNS for the wildcard subdomain.

The product sits in a small constellation of external services:

```
                    ┌─────────────────────────┐
   Visitors  ─────▶ │   undoverse.in (Vercel) │
   Builders         │   Next.js 14 / Turborepo│
                    └───────────┬─────────────┘
                                │
        ┌──────────┬───────────┼───────────┬────────────┐
        ▼          ▼           ▼            ▼            ▼
   GitHub OAuth  Neon PG    Algolia      PostHog      Vercel
   (Auth.js v5) (Prisma)   (search)    (analytics)  (build/host)
```

### 2.2 Product Functions (summary)

- Showcase the ecosystem and route each project to its own subdomain.
- Let visitors discover projects via cards, search, and upvote counts.
- Let builders sign in with GitHub, maintain a profile, and submit projects.
- Surface activity through a changelog feed and analytics dashboard.

### 2.3 User Classes and Characteristics

| Class | Description | Auth | Frequency | Key needs |
|---|---|---|---|---|
| **Visitor** | Anonymous browser of the hub. | None | Drive-by | Fast discovery, search, readable project pages. |
| **Builder** | Authenticated creator. | GitHub OAuth | Recurring | Submit/manage projects, edit profile, view analytics. |
| **Admin** | 72BPM staff / Yadu. | GitHub OAuth + role | Daily | Moderate submissions, feature projects, view ecosystem analytics. |
| **Bot / Crawler** | Search engines, social unfurlers. | None | Continuous | Clean SSR HTML, OG tags, sitemap, robots. |

### 2.4 Operating Environment

- **Client:** Evergreen browsers — last 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari and Android Chrome. Responsive from 320px to 4K.
- **Server / Runtime:** Vercel Edge (middleware) + Node.js 20 serverless functions; Next.js 14 App Router.
- **Database:** Neon PostgreSQL (serverless, connection-pooled).
- **DNS / CDN:** Cloudflare (DNS, wildcard `*.undoverse.in`), Vercel Edge Network for content delivery.

### 2.5 Design and Implementation Constraints

- Stack is fixed: **Next.js 14 (App Router) + Turborepo + Prisma + Neon PostgreSQL + Auth.js v5 + Vercel**.
- Search via **Algolia**; product analytics via **PostHog**.
- Deployment cycle is fixed: `feature/* → develop` (dev) → `staging` (UAT) → `main` (production).
- Wildcard subdomain support is mandatory (`*.undoverse.in`) and constrains the hosting/DNS choice (see ADR-003).
- Must operate within free/Pro tier quotas of the listed services for MVP cost targets.

### 2.6 Assumptions and Dependencies

- GitHub remains the sole identity provider for MVP.
- Each project has an accessible Git repository and/or live URL.
- Neon, Vercel, Algolia, PostHog, and GitHub APIs remain available with current contracts.
- Cloudflare wildcard DNS can be pointed at Vercel.

---

## 3. Functional Requirements

Priority scale: **P0** = MVP must-have, **P1** = MVP should-have, **P2** = later phase.

### FR-001 — Landing Page (Hub)
**Priority:** P0
**Description:** The root `undoverse.in` serves a statically generated (SSG/ISR) landing page that introduces the undo ecosystem, displays a hero, the featured project cards, the global search entry point, and a footer crediting 72BPM, Trivandrum.
**Acceptance:**
- Landing renders server-side with valid OG/Twitter meta tags and a `<title>`.
- The three initial projects are visible above the fold on desktop.
- LCP ≤ 2.5s on a mid-tier mobile (see NFR-001).
- All interactive elements are keyboard-reachable.

### FR-002 — Subdomain Routing (Multi-Tenant)
**Priority:** P0
**Description:** Edge middleware inspects the `Host` header and routes `<project>.undoverse.in` to that project's tenant view, while `undoverse.in` and `www` resolve to the hub. Unknown subdomains return a branded 404.
**Acceptance:**
- `currentundo.undoverse.in`, `kuzhiundo.undoverse.in`, `damundo.undoverse.in` each resolve to their respective project page.
- `www.undoverse.in` 308-redirects to `undoverse.in`.
- A non-existent subdomain (`nope.undoverse.in`) returns the custom 404 with copy guiding the visitor back to the hub.
- Routing decision happens in middleware (edge), not client-side.

### FR-003 — Project Cards
**Priority:** P0
**Description:** Projects are displayed as cards showing name, tagline, logo/cover, tags, upvote count, and builder attribution. Cards link to the project's subdomain and are the primary discovery unit on the hub.
**Acceptance:**
- Each card shows name, tagline, ≥1 tag, current upvote count, and builder handle.
- Clicking a card navigates to `<project>.undoverse.in`.
- Cards are rendered from the database, ordered by a configurable sort (default: upvotes desc, then recency).
- Card grid is responsive (1/2/3 columns by breakpoint).

### FR-004 — Search
**Priority:** P0
**Description:** A global search lets visitors find projects by name, tagline, tags, and builder. Backed by Algolia for typo-tolerant, instant results; degrades to a server-side `ILIKE` query if Algolia is unavailable.
**Acceptance:**
- Typing a query returns matching projects within 300ms p95 (Algolia path).
- Search is typo-tolerant ("kuzi" → "kuzhiundo").
- Empty query shows recent/featured projects; no-results shows the empty state copy.
- Search box is reachable via keyboard shortcut (`/`) and screen-reader labelled.

### FR-005 — Upvotes
**Priority:** P0
**Description:** Authenticated builders may upvote/un-upvote a project. Each builder may upvote a given project at most once. Counts are displayed on cards and project pages and update optimistically.
**Acceptance:**
- An authenticated builder can toggle an upvote; the count reflects the change immediately (optimistic) and reconciles with the server.
- A second upvote by the same builder removes the prior one (toggle), never double-counts.
- Anonymous visitors who attempt to upvote are prompted to sign in.
- Upvote writes are idempotent and protected against CSRF.

### FR-006 — Builder Profiles
**Priority:** P0
**Description:** Each builder has a public profile at `undoverse.in/@<handle>` showing avatar, display name, GitHub link, bio, and the projects they have submitted.
**Acceptance:**
- Profile renders SSR with correct meta tags and the builder's projects.
- The signed-in owner sees an "Edit profile" affordance; others do not.
- Editable fields: display name, bio, optional website/social links.
- A builder with no projects shows the empty-state copy.

### FR-007 — Submission Portal
**Priority:** P0
**Description:** Authenticated builders submit a new project via a multi-field form: name, requested subdomain, tagline, description, tags, repo URL, live URL, logo/cover upload. Submissions enter a `PENDING` state for admin review before going live.
**Acceptance:**
- Form validates client- and server-side (required fields, URL format, subdomain availability/format).
- Requested subdomain is checked for uniqueness and reserved-word collisions.
- On success, the builder sees the success state and the project appears in their profile as `PENDING`.
- Admin can transition `PENDING → APPROVED → LIVE` (or `REJECTED`).

### FR-008 — GitHub OAuth (Authentication)
**Priority:** P0
**Description:** Builders authenticate exclusively through GitHub OAuth using Auth.js v5. On first login a Builder record is created; sessions are managed via secure, http-only cookies.
**Acceptance:**
- "Continue with GitHub" initiates the OAuth flow and returns the builder to their prior context.
- First-time login provisions a Builder with handle, avatar, and name from GitHub.
- Sessions persist across reloads via http-only, `SameSite=Lax`, `Secure` cookies.
- Sign-out clears the session.

### FR-009 — Analytics Dashboard
**Priority:** P1 (MVP-lite) / P2 (full)
**Description:** Builders see a dashboard for their projects (views, upvotes over time, search appearances). Admins see ecosystem-wide metrics. Data is sourced from PostHog and the application DB.
**Acceptance:**
- A builder sees per-project views and upvote trends for a selectable date range.
- Admin view aggregates across all projects (top projects, new builders, total submissions).
- Numbers reconcile with PostHog within an acceptable delay (≤ near-real-time / hourly rollups).
- Dashboard is gated by authentication and role.

### FR-010 — Changelog / Activity Feed
**Priority:** P1
**Description:** A public feed surfaces ecosystem activity: new projects going live, notable version updates, and milestones. Builders can post a short changelog note per project release.
**Acceptance:**
- Feed lists chronological entries with project, type, summary, and timestamp.
- A builder can add a changelog entry to their own LIVE project.
- Feed is paginated/infinite-scrollable and SSR for the first page (SEO).
- Entries render in the public changelog and on the relevant project page.

---

## 4. Non-Functional Requirements

### NFR-001 — Performance
- **Core Web Vitals (field, p75):** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.
- Hub and project pages served via SSG/ISR; TTFB ≤ 600ms p95 from India and EU edges.
- Search results ≤ 300ms p95 (Algolia path).
- API mutations (upvote, submit) ≤ 500ms p95.

### NFR-002 — Security
- All traffic over HTTPS (HSTS enabled).
- Auth via Auth.js v5; session cookies http-only, `Secure`, `SameSite=Lax`.
- CSRF protection on all state-changing requests (double-submit / Auth.js CSRF token).
- Rate limiting on auth, submission, and upvote endpoints (see SYSTEM_DESIGN §Security).
- Input validation and output encoding to prevent XSS/SQLi; Prisma parameterised queries only.
- Secrets stored in Vercel environment variables, never committed.
- Principle of least privilege for DB roles and API tokens.

### NFR-003 — Accessibility (WCAG 2.1 AA)
- Conform to **WCAG 2.1 Level AA**.
- Colour contrast ≥ 4.5:1 (text), ≥ 3:1 (large text / UI components).
- Full keyboard operability; visible focus indicators.
- Semantic landmarks, headings hierarchy, and ARIA only where native semantics are insufficient.
- Form fields have programmatic labels and inline, associated error messages.
- Images have meaningful `alt`; decorative images are hidden from AT.
- Respect `prefers-reduced-motion`.

### NFR-004 — SEO
- SSR/SSG HTML for all public pages; no critical content behind client-only JS.
- Per-page `<title>`, meta description, canonical, OG, and Twitter card tags.
- Dynamic `sitemap.xml` and `robots.txt`; subdomains included.
- Structured data (JSON-LD `SoftwareApplication` / `Person`) for projects and builders.
- Clean, human-readable URLs; 301/308 for canonicalisation.

### NFR-005 — Reliability & Availability
- Target availability 99.9% monthly for the hub.
- Graceful degradation: if Algolia/PostHog is down, core browsing/upvoting still works.
- Database migrations are forward-only and reversible within a release window.

### NFR-006 — Maintainability
- Monorepo with shared `ui`, `config`, `db` packages; typed end-to-end (TypeScript strict).
- Lint, type-check, and test gates in CI before merge.
- ADRs maintained for significant decisions.

### NFR-007 — Privacy & Compliance
- Collect the minimum personal data (GitHub handle, avatar, name, email if granted).
- PostHog configured to respect Do-Not-Track and to mask sensitive inputs.
- Cookie/consent handling defaults to privacy-preserving.

### NFR-008 — Observability
- Structured logging on serverless functions; error tracking via Vercel + console pipelines.
- Product analytics via PostHog (see PRODUCT_TRACKING.md).
- Health endpoint for uptime monitoring.

---

## 5. External Interface Requirements

### 5.1 GitHub API / OAuth
- **Use:** Authentication (OAuth App) and enrichment (avatar, name, handle, public repo metadata for prefill).
- **Auth:** OAuth 2.0 authorization code flow via Auth.js v5.
- **Scopes:** `read:user`, `user:email` (minimum).
- **Failure handling:** OAuth errors return the builder to a friendly error state; API rate limits handled with caching and backoff.

### 5.2 Vercel API / Platform
- **Use:** Build, deploy, host; environment management; preview deployments per branch.
- **Interface:** Git integration (GitHub) drives deploys; Vercel CLI for ops.
- **Constraint:** Wildcard domain `*.undoverse.in` configured at the project level.

### 5.3 Neon PostgreSQL
- **Use:** Primary datastore via Prisma.
- **Interface:** Pooled connection string (`DATABASE_URL`) + direct connection (`DIRECT_URL`) for migrations.
- **Constraint:** Serverless driver / pgBouncer-style pooling; migrations run against the direct URL.

### 5.4 PostHog
- **Use:** Product analytics, funnels, and dashboards.
- **Interface:** PostHog JS (client) + server-side capture for sensitive events.
- **Privacy:** Autocapture limited; PII minimised; identity merged on login (see PRODUCT_TRACKING.md).

### 5.5 Algolia
- **Use:** Instant, typo-tolerant project search.
- **Interface:** Search-only API key on client; admin key server-side for indexing.
- **Indexing:** Projects synced to Algolia on create/update/state-change; reindex job available.
- **Fallback:** Server-side Postgres search if Algolia is unreachable.

---

## 6. Constraints and Assumptions

### 6.1 Constraints
- **Technology:** Fixed stack as in §2.5.
- **Process:** Three-environment promotion (`develop` → `staging` → `main`).
- **Infrastructure:** Wildcard subdomain is a hard requirement; hosting must support it (Vercel + Cloudflare).
- **Budget/Quota:** MVP operates within Pro/free tiers of listed services.
- **Identity:** GitHub-only auth for MVP.
- **Timeline:** MVP in 4 weeks; scope is fixed by FR-001–FR-008 (P0).

### 6.2 Assumptions
- External services maintain current APIs and SLAs.
- Initial projects (currentundo, kuzhiundo, damundo) provide the metadata needed to seed the catalogue.
- Cloudflare DNS for `undoverse.in` is under 72BPM control.
- Builders are technically literate (GitHub users), so onboarding can assume basic familiarity.

### 6.3 Risks (selected)
| Risk | Impact | Mitigation |
|---|---|---|
| Wildcard SSL/DNS misconfig | Subdomains fail | Validate in UAT; documented runbook for DNS/cert. |
| Algolia quota exhaustion | Search degraded | Postgres fallback; usage alerts. |
| GitHub OAuth outage | No new logins | Cache sessions; status banner; retry. |
| Submission spam | Catalogue pollution | Admin moderation queue; rate limiting. |

---

*End of SRS v1.0 — undoverse.in — 72BPM, Trivandrum, Kerala.*
