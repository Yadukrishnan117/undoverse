# System Design Document — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | System Design Document |
| **Version** | 1.0 |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author** | Yadukrishnan K H — yadu@chargemod.com |
| **Related** | SRS.md, ADR/ADR-001..003, TEST_PLAN.md, DEPLOYMENT_RUNBOOK.md |

---

## 1. Overview

undoverse.in is a multi-tenant, server-rendered web application that acts as the hub for the undo ecosystem. It is built as a **Turborepo monorepo** of Next.js 14 (App Router) apps and shared packages, persisting to a single **Neon PostgreSQL** database via **Prisma**, authenticating builders through **GitHub OAuth (Auth.js v5)**, searching via **Algolia**, instrumented with **PostHog**, and hosted on **Vercel** behind **Cloudflare** DNS (wildcard `*.undoverse.in`).

This document describes the architecture, components, data flows, API and database design, multi-tenant routing, caching, security, and scalability approach.

---

## 2. High-Level Architecture

```
                              ┌──────────────────────────────────────────┐
                              │              Cloudflare DNS                │
                              │   undoverse.in   +   *.undoverse.in (CNAME)│
                              └───────────────────────┬──────────────────┘
                                                      │
                                                      ▼
                              ┌──────────────────────────────────────────┐
                              │            Vercel Edge Network             │
                              │  ┌────────────────────────────────────┐   │
   Visitor / Builder ───────▶│  │  Edge Middleware (host-based routing)│   │
   (browser)                 │  └──────────────────┬─────────────────┘   │
                              │                     │                      │
                              │   ┌─────────────────┼──────────────────┐   │
                              │   ▼                 ▼                  ▼   │
                              │ Hub routes     Tenant routes      API routes
                              │ (SSG/ISR)      (SSR/ISR)          (Route Handlers)
                              │   apps/web (Next.js 14, App Router)        │
                              └───────┬───────────────┬───────────────┬───┘
                                      │               │               │
                       Prisma Client  │               │ PostHog (server capture)
                                      ▼               ▼               ▼
                          ┌──────────────────┐  ┌───────────┐  ┌───────────┐
                          │ Neon PostgreSQL  │  │  Algolia  │  │  PostHog  │
                          │ (pooled + direct)│  │  (search) │  │(analytics)│
                          └──────────────────┘  └───────────┘  └───────────┘
                                      ▲
                                      │ OAuth (Auth.js v5)
                          ┌──────────────────────┐
                          │   GitHub OAuth / API  │
                          └──────────────────────┘

Monorepo layout (Turborepo):
  apps/
    web/            → Next.js 14 hub + tenant + API
  packages/
    ui/             → shared React components (design system)
    db/             → Prisma schema + generated client + seed
    config/         → eslint, tsconfig, tailwind presets
    analytics/      → PostHog wrapper + event taxonomy
    search/         → Algolia client + indexing helpers
    auth/           → Auth.js v5 config + helpers
```

---

## 3. Component Breakdown

| Component | Responsibility |
|---|---|
| **Edge Middleware** | Reads `Host`, classifies request as hub / tenant / reserved, rewrites the URL to the correct route segment, sets tenant context header. |
| **apps/web — Hub routes** | Landing, search, builder profiles, submission portal, changelog, dashboards. Mostly SSG/ISR. |
| **apps/web — Tenant routes** | `/_tenant/[project]` rendered for `<project>.undoverse.in`. ISR per project. |
| **apps/web — API (Route Handlers)** | REST-ish endpoints under `/api/*` for upvotes, submissions, profiles, search proxy, changelog, webhooks. |
| **packages/auth** | Auth.js v5 configuration (GitHub provider, Prisma adapter, session/jwt strategy, callbacks). |
| **packages/db** | Prisma schema, migrations, generated client, seed for the three initial projects. |
| **packages/search** | Algolia indexing on write; search query helper with Postgres fallback. |
| **packages/analytics** | PostHog initialisation, typed `capture()` wrapper, identity merge. |
| **packages/ui** | Buttons, cards, forms, layout primitives — WCAG-compliant, themeable. |
| **packages/config** | Shared lint/tsconfig/tailwind. |

---

## 4. Data Flow for Key User Journeys

### 4.1 Visit a project (`currentundo.undoverse.in`)
```
Browser → Cloudflare → Vercel Edge
  Middleware: Host = currentundo.undoverse.in
    → not reserved → rewrite to /_tenant/currentundo, set x-tenant=currentundo
  Route /_tenant/[project]:
    → ISR cache hit? serve cached HTML
    → miss: Prisma fetch Project where slug=currentundo & status=LIVE
            render page (logo, tagline, description, upvotes, changelog)
            revalidate tag `project:currentundo`
  Client hydrates → PostHog page_viewed (project context)
```

### 4.2 Upvote a project (authenticated)
```
Builder clicks upvote
  → Optimistic UI increments locally
  → POST /api/projects/{id}/upvote  (CSRF token + session cookie)
     Server: verify session (Auth.js), verify CSRF
             upsert Upvote(builderId, projectId) — unique constraint
             if existed → delete (toggle off); else create (toggle on)
             recompute/return new count
             revalidateTag(`project:{slug}`) + emit PostHog upvote_toggled
  → Client reconciles count with server response
  (Anonymous: 401 → client opens "Continue with GitHub" prompt)
```

### 4.3 Submit a project
```
Builder opens /submit (auth required)
  → fills form; client validation (zod)
  → checks subdomain availability: GET /api/projects/check-slug?slug=foo
  → POST /api/projects  (payload + CSRF + session)
     Server: zod parse, verify session
             validate slug (format, uniqueness, reserved words)
             create Project status=PENDING, link builderId
             index to Algolia is deferred until LIVE
             emit PostHog submission_completed
  → Success state; project shows as PENDING on builder profile
  Admin later: PATCH /api/admin/projects/{id} status=LIVE
             → Algolia index add; revalidate hub + changelog
```

### 4.4 Builder login (GitHub OAuth)
```
Click "Continue with GitHub"
  → GET /api/auth/signin/github (Auth.js v5)
  → redirect to GitHub authorize (scopes read:user, user:email)
  → GitHub callback → /api/auth/callback/github
     Auth.js: exchange code, fetch profile
              Prisma adapter upserts Builder + Account + Session
              first login → provision Builder(handle, name, avatar)
     Set http-only Secure SameSite=Lax session cookie
  → redirect back to originating page
  → PostHog: alias anonymous_id → builder distinct_id (github)
```

---

## 5. API Design

Conventions: JSON over HTTPS; auth via Auth.js session cookie; mutations require CSRF token; errors use a consistent envelope.

**Error envelope**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Slug already taken", "field": "slug" } }
```

### 5.1 `GET /api/projects`
List LIVE projects (for hub / SSR fallback).
**Query:** `?sort=upvotes|recent&tag=<tag>&limit=&cursor=`
**200**
```json
{
  "items": [
    { "id": "prj_01", "slug": "currentundo", "name": "currentundo",
      "tagline": "Undo, but for currents", "tags": ["hardware","iot"],
      "upvotes": 128, "builder": { "handle": "yadu", "avatar": "https://…" } }
  ],
  "nextCursor": "eyJpZCI6…"
}
```

### 5.2 `GET /api/projects/check-slug?slug=foo`
**200** `{ "available": true }` / `{ "available": false, "reason": "RESERVED" }`

### 5.3 `POST /api/projects`  (auth)
**Request**
```json
{ "name": "damundo", "slug": "damundo", "tagline": "Undo for dams",
  "description": "…", "tags": ["water","infra"],
  "repoUrl": "https://github.com/…", "liveUrl": "https://…",
  "logoUrl": "https://…" }
```
**201** `{ "id": "prj_09", "slug": "damundo", "status": "PENDING" }`
**400** validation envelope · **401** unauthenticated · **409** slug conflict

### 5.4 `POST /api/projects/{id}/upvote`  (auth, CSRF)
Toggles the caller's upvote.
**200** `{ "upvoted": true, "count": 129 }`
**401** unauthenticated

### 5.5 `GET /api/builders/{handle}`
**200**
```json
{ "handle": "yadu", "name": "Yadukrishnan K H", "avatar": "https://…",
  "bio": "Building the undo ecosystem.", "links": { "github": "https://…" },
  "projects": [ { "slug": "currentundo", "status": "LIVE", "upvotes": 128 } ] }
```

### 5.6 `PATCH /api/builders/{handle}`  (auth, owner only)
**Request** `{ "name": "…", "bio": "…", "links": { "website": "…" } }`
**200** updated builder · **403** if not owner

### 5.7 `GET /api/search?q=kuzi`
Proxies Algolia (search-only key may also be used client-side); Postgres fallback.
**200** `{ "items": [ … ], "source": "algolia|postgres" }`

### 5.8 `GET /api/changelog?cursor=`
**200** `{ "items": [ { "id":"chg_1","project":"currentundo","type":"RELEASE","summary":"v1.2","createdAt":"…" } ], "nextCursor": "…" }`

### 5.9 `POST /api/changelog`  (auth, owner of LIVE project)
**Request** `{ "projectId":"prj_01","type":"RELEASE","summary":"v1.2 ships dark mode" }`
**201** created entry

### 5.10 `PATCH /api/admin/projects/{id}`  (admin)
**Request** `{ "status": "LIVE" }` → also triggers Algolia index + revalidation.
**200** updated · **403** non-admin

### 5.11 `GET /api/health`
**200** `{ "ok": true, "db": "up", "time": "2026-06-15T…Z" }`

### 5.12 Auth.js endpoints
`/api/auth/[...nextauth]` — `signin`, `callback`, `signout`, `session`, `csrf` handled by Auth.js v5.

---

## 6. Database Design

### 6.1 ER Diagram (ASCII)

```
┌───────────────┐        ┌──────────────────┐        ┌──────────────┐
│   Builder     │1      *│     Project      │1      *│   Upvote     │
├───────────────┤────────├──────────────────┤────────├──────────────┤
│ id (pk)       │        │ id (pk)          │        │ id (pk)      │
│ handle (uniq) │        │ slug (uniq)      │        │ builderId fk │
│ name          │        │ name             │        │ projectId fk │
│ email         │        │ tagline          │        │ createdAt    │
│ avatarUrl     │        │ description      │        │ UNIQUE(builderId,
│ bio           │        │ tags (text[])    │        │        projectId)
│ links (jsonb) │        │ repoUrl          │        └──────────────┘
│ role (enum)   │        │ liveUrl          │
│ createdAt     │        │ logoUrl          │        ┌──────────────┐
└──────┬────────┘        │ status (enum)    │1      *│  Changelog   │
       │                 │ upvoteCount (int)│────────├──────────────┤
       │1               *│ builderId fk     │        │ id (pk)      │
       │  (submits)      │ createdAt        │        │ projectId fk │
       └────────────────▶│ updatedAt        │        │ type (enum)  │
                         └──────────────────┘        │ summary      │
                                                      │ createdAt    │
   Auth.js v5 (Prisma adapter) tables:               └──────────────┘
   Account, Session, VerificationToken  ── related to Builder(id)
```

### 6.2 Table Descriptions

**Builder** — a person authenticated via GitHub.
- `id` PK (cuid), `handle` (unique, from GitHub login), `name`, `email`, `avatarUrl`, `bio`, `links` (jsonb), `role` enum `BUILDER|ADMIN` (default `BUILDER`), timestamps.

**Project** — a listed product addressable at a subdomain.
- `id` PK, `slug` (unique, = subdomain), `name`, `tagline`, `description`, `tags` (text[]), `repoUrl`, `liveUrl`, `logoUrl`, `status` enum `PENDING|APPROVED|LIVE|REJECTED`, `upvoteCount` (denormalised cache), `builderId` FK → Builder, timestamps.
- Indexes: `slug` unique; `(status, upvoteCount desc)` for hub sort; GIN on `tags`.

**Upvote** — a builder's vote for a project.
- `id` PK, `builderId` FK, `projectId` FK, `createdAt`. **Unique(builderId, projectId)** enforces one-vote-per-builder; toggling deletes the row.

**Changelog** — ecosystem activity entries.
- `id` PK, `projectId` FK, `type` enum `RELEASE|MILESTONE|LAUNCH`, `summary`, `createdAt`.
- Index: `(createdAt desc)` for the feed.

**Auth.js adapter tables** — `Account`, `Session`, `VerificationToken` per Auth.js v5 Prisma adapter, linked to `Builder`.

**Counter integrity:** `upvoteCount` is maintained transactionally with `Upvote` writes (increment/decrement in the same transaction); a periodic reconciliation job can recompute from `Upvote` if drift is detected.

---

## 7. Multi-Tenant Subdomain Routing

Routing is decided at the **edge** by `middleware.ts`:

```ts
// Pseudocode
const host = req.headers.get('host')!;                 // e.g. currentundo.undoverse.in
const root = 'undoverse.in';
const sub = host.endsWith(root) ? host.slice(0, -(root.length + 1)) : '';

if (!sub || sub === 'www') {
  if (sub === 'www') return redirect(`https://${root}${req.nextUrl.pathname}`, 308);
  return NextResponse.next();                            // HUB
}
if (RESERVED.has(sub)) return NextResponse.next();       // api, app, admin, assets…
// TENANT
const url = req.nextUrl.clone();
url.pathname = `/_tenant/${sub}${req.nextUrl.pathname}`;
const res = NextResponse.rewrite(url);
res.headers.set('x-tenant', sub);
return res;
```

- **Reserved subdomains:** `www`, `api`, `app`, `admin`, `assets`, `static`, `cdn`, `mail` — blocked from submission and never treated as tenants.
- **Validation:** tenant existence/`status=LIVE` is verified in the route via Prisma; unknown/inactive tenants render the branded 404.
- **DNS/TLS:** Cloudflare holds `*.undoverse.in` CNAME → Vercel; Vercel issues the wildcard certificate (see ADR-003).
- **Local dev:** `*.localhost` (or `lvh.me`) maps to the same middleware logic.

---

## 8. Caching Strategy

| Layer | What | Mechanism | Invalidation |
|---|---|---|---|
| **Edge CDN** | Static assets, SSG pages | Vercel Edge cache | On deploy / ISR revalidate |
| **ISR** | Hub landing, project pages, profiles, changelog page 1 | `revalidate` + cache tags | `revalidateTag('project:<slug>')`, `'hub'`, `'changelog'` on writes |
| **Data** | Hot reads (hub list) | Next.js `unstable_cache` / fetch cache | Tag-based on mutation |
| **Search** | Algolia | Algolia's own infra | On index update (create/update/state change) |
| **Client** | Upvote state | Optimistic UI + reconcile | Server response |

- Mutations (upvote, submit-approval, changelog post) call `revalidateTag` to surgically refresh affected pages instead of full rebuilds.
- `upvoteCount` denormalisation avoids count aggregation on every hub render.

---

## 9. Security Design

- **Authentication:** Auth.js v5 + GitHub provider; Prisma adapter; session via http-only, `Secure`, `SameSite=Lax` cookie. Minimal scopes (`read:user`, `user:email`).
- **Authorisation:** Role checks (`BUILDER`/`ADMIN`) in route handlers; ownership checks for profile/changelog edits; admin-only moderation routes.
- **CSRF:** Auth.js CSRF token on auth flows; double-submit token (or origin check) on all state-changing `/api` routes. Reject mutations with mismatched `Origin`/`Sec-Fetch-Site`.
- **Rate limiting:** Sliding-window limits (e.g. Upstash Redis or Vercel KV) on:
  - `/api/auth/*` (login attempts),
  - `POST /api/projects` (submissions: e.g. 5/hour/builder),
  - `POST /api/projects/{id}/upvote` (e.g. 60/min/builder),
  - `GET /api/search` (e.g. 120/min/IP).
- **Input validation:** `zod` schemas on every mutation; Prisma parameterised queries (no raw string SQL with user input).
- **Output safety:** React auto-escaping; sanitise any rich text; strict CSP header; `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS.
- **Secrets:** Vercel env vars per environment; never in repo; Algolia admin key and DB direct URL server-only.
- **Abuse:** Submission moderation queue (`PENDING` gate); reserved-word/slug guard; optional GitHub account-age heuristic.

---

## 10. Scalability Considerations

- **Stateless compute:** Vercel serverless/edge scales horizontally; no server affinity.
- **Database:** Neon serverless with pooled `DATABASE_URL` (pgBouncer-style) for app traffic and `DIRECT_URL` for migrations; read-heavy hub served from ISR cache, sparing the DB.
- **Hot paths cached:** Hub and tenant pages are ISR; search offloaded to Algolia; counts denormalised.
- **Connection limits:** Use Prisma + Neon pooling to avoid exhausting connections under serverless fan-out; keep transactions short.
- **Subdomain growth:** Wildcard routing means adding a project is a DB row + Algolia index, not infra change — scales to thousands of tenants.
- **Analytics offload:** PostHog ingests events independently; dashboards read rollups, not live OLTP.
- **Future (Phase 3):** introduce a read replica or materialised views for analytics; queue (e.g. Inngest) for indexing/notifications; CDN-cached OG image generation.

---

## 11. Technology Decisions (pointers)

- Monorepo: Turborepo — see **ADR-001**.
- Database: Neon + Prisma — see **ADR-002**.
- Hosting: Vercel + Cloudflare (wildcard) — see **ADR-003**.

---

*End of System Design Document v1.0 — undoverse.in — 72BPM.*
