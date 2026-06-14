# Test Plan — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | Test Plan |
| **Version** | 1.0 |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author** | Yadukrishnan K H — yadu@chargemod.com |
| **Related** | SRS.md, SYSTEM_DESIGN.md, DEPLOYMENT_RUNBOOK.md |

---

## 1. Testing Strategy Overview

We follow the **testing pyramid**: many fast unit tests, a focused band of integration tests around API routes and database operations, and a small set of high-value end-to-end (E2E) tests covering critical journeys. Performance, accessibility, and SEO are treated as first-class, automated where possible and gated in CI/UAT.

| Layer | Tooling | Runs where | Gate |
|---|---|---|---|
| Unit | Vitest + React Testing Library | PR / `develop` | Block merge on failure |
| Integration | Vitest + Prisma against ephemeral Postgres | PR / `develop` | Block merge on failure |
| E2E | Playwright | `develop` (preview) + `staging` (UAT) | Block promotion to `main` |
| Performance | Lighthouse CI + CWV (PostHog field) | `staging` + post-deploy | Warn → block on regression budget |
| Accessibility | axe-core (jest-axe + Playwright) + manual | PR + UAT | Block on AA violations |
| Type/Lint | tsc --strict, ESLint | PR | Block merge |

**Principles:** test behaviour not implementation; deterministic tests (seeded data, mocked external services); every P0 functional requirement (FR-001..FR-008) has at least one automated test mapped to it.

---

## 2. Test Environments

| Env | Branch | URL | Data | Externals |
|---|---|---|---|---|
| **Dev** | `feature/*`, `develop` | Vercel preview per PR + local `*.localhost` | Seeded local / branch Neon DB | GitHub OAuth (dev app), Algolia dev index, PostHog dev project (mocked in unit tests) |
| **UAT** | `staging` | `staging-undoverse.vercel.app` + `*.staging-…` preview | Dedicated UAT Neon branch, anonymised/seed data | UAT GitHub OAuth app, Algolia UAT index, PostHog UAT project |
| **Production** | `main` | `undoverse.in` + `*.undoverse.in` | Production Neon | Production apps/keys |

- External services are **mocked** in unit tests, **stubbed or sandboxed** in integration tests, and **real (sandbox tier)** in UAT E2E.
- Each environment has isolated secrets and its own Neon database branch.

---

## 3. Unit Test Plan

Target ≥ 80% statements on `packages/*` business logic and `apps/web` utilities. Pure functions and component logic first.

| Area | File(s) / unit | What to verify |
|---|---|---|
| Subdomain routing | `apps/web/middleware.ts` (extracted `resolveTenant()`) | hub vs tenant vs reserved vs www-redirect; malformed hosts; reserved-word set |
| Slug validation | `packages/db` `validateSlug()` | format (lowercase, hyphen rules), length, reserved words, profanity guard |
| Upvote toggle logic | `packages/db` `toggleUpvote()` (with mocked Prisma) | create on first, delete on second, count inc/dec, idempotency |
| Search fallback | `packages/search` `search()` | Algolia path mapping; Postgres fallback when Algolia throws; result shape normalisation |
| Auth callbacks | `packages/auth` callbacks | first-login provisioning, handle derivation, role default, session shape |
| Analytics wrapper | `packages/analytics` `capture()` | event name allow-list, property scrubbing (no PII), no-op when DNT |
| Zod schemas | submission/profile/changelog schemas | accept valid payloads; reject each invalid field with correct error code |
| UI components | `packages/ui` Card, Button, Form, EmptyState | renders props, keyboard handlers, disabled/loading states |
| Formatters | date/relative-time, count formatting | locale-safe, pluralisation (1 upvote vs 2 upvotes) |

---

## 4. Integration Test Plan

Run against an **ephemeral PostgreSQL** (Neon branch or Docker `postgres`) with Prisma migrations applied and seed data loaded. External HTTP services mocked (msw) except DB.

| Endpoint / operation | Cases |
|---|---|
| `GET /api/projects` | sort by upvotes/recent, tag filter, pagination cursor, only LIVE returned |
| `GET /api/projects/check-slug` | available, taken (409 semantics), reserved word |
| `POST /api/projects` | 201 happy path → PENDING; 401 unauth; 400 validation; 409 duplicate slug; rate-limit 429 |
| `POST /api/projects/{id}/upvote` | toggle on/off, count correctness, unique constraint, 401 unauth, CSRF reject |
| `GET /api/builders/{handle}` | existing builder + projects, 404 unknown, owner vs non-owner fields |
| `PATCH /api/builders/{handle}` | owner success, 403 non-owner, validation |
| `GET /api/search` | algolia source vs postgres fallback (simulate Algolia down) |
| `GET/POST /api/changelog` | feed pagination; create requires LIVE-project ownership; 403 otherwise |
| `PATCH /api/admin/projects/{id}` | admin promotes PENDING→LIVE triggers index + revalidate; 403 non-admin |
| `GET /api/health` | reports db up; returns 503 when DB unreachable |
| DB ops | transactional upvote count integrity under concurrent toggles; reserved-word uniqueness; cascade behaviour on builder/project relations |

---

## 5. E2E Test Plan (Playwright)

Critical journeys, run headless in CI on preview + UAT, plus a smoke subset post-prod-deploy. Use a dedicated test GitHub account / OAuth stub.

| ID | Journey | Steps & assertions | Maps to |
|---|---|---|---|
| E2E-01 | Visit hub | Load `/`; hero + 3 project cards visible; meta title set; no console errors | FR-001 |
| E2E-02 | Subdomain routing | Visit `currentundo.<host>`; tenant page renders; `nope.<host>` → branded 404; `www` → 308 redirect | FR-002 |
| E2E-03 | Project card click | From hub, click a card → lands on correct subdomain/project | FR-003 |
| E2E-04 | Search | Type "kuzi"; see kuzhiundo (typo tolerance); clear → featured; gibberish → empty state | FR-004 |
| E2E-05 | Upvote (auth) | Sign in; upvote a project; count +1; reload persists; un-upvote → −1; anon upvote → sign-in prompt | FR-005, FR-008 |
| E2E-06 | Builder profile | Visit `/@handle`; projects listed; owner sees Edit, edits bio, saves, persists | FR-006 |
| E2E-07 | Submission | Signed-in builder submits valid project → success state; appears PENDING on profile; duplicate slug blocked inline | FR-007 |
| E2E-08 | GitHub OAuth | Start sign-in, complete callback, session persists across reload, sign-out clears | FR-008 |
| E2E-09 | Changelog | Public feed loads + paginates; owner posts entry on LIVE project; appears in feed | FR-010 |
| E2E-10 | Dashboard (P1) | Builder views own analytics for date range; admin sees ecosystem aggregate; gated by auth/role | FR-009 |

E2E runs across Chromium, plus a reduced suite on WebKit and Firefox. Mobile viewport (iPhone 13) for E2E-01, E2E-04, E2E-05.

---

## 6. Performance Test Criteria

Targets are **field p75** (real users via PostHog/CWV) with lab gates via Lighthouse CI on representative pages (hub, project, profile, search).

| Metric | Target | Gate |
|---|---|---|
| LCP | ≤ 2.5s | CI warn > 2.5s, block > 3.0s |
| INP | ≤ 200ms | block > 300ms |
| CLS | ≤ 0.1 | block > 0.15 |
| TTFB (edge, IN/EU) | ≤ 600ms p95 | monitor |
| Search latency | ≤ 300ms p95 (Algolia) | monitor |
| API mutation | ≤ 500ms p95 | monitor |
| Lighthouse Perf score | ≥ 90 (hub, project) | block < 85 |

Performance budget enforced in CI; a regression beyond budget on the four key pages blocks promotion to `main`.

---

## 7. Accessibility Test Checklist (WCAG 2.1 AA)

Automated (axe-core in unit + Playwright) plus the manual checklist below per release:

- [ ] All pages pass axe-core with zero **serious/critical** violations.
- [ ] Colour contrast ≥ 4.5:1 (text), ≥ 3:1 (large text & UI components).
- [ ] Every interactive element is keyboard-reachable and operable (Tab/Shift+Tab/Enter/Space/Esc).
- [ ] Visible focus indicator on all focusable elements.
- [ ] Logical heading hierarchy (single h1 per page, no skipped levels).
- [ ] Landmarks present (`header`, `nav`, `main`, `footer`).
- [ ] All form fields have associated labels; errors are announced and linked (`aria-describedby`).
- [ ] Images have meaningful `alt`; decorative images `alt=""`/`aria-hidden`.
- [ ] Search and modal dialogs manage focus correctly (trap + restore).
- [ ] `prefers-reduced-motion` honoured (no essential motion-only cues).
- [ ] Skip-to-content link present.
- [ ] Tested with VoiceOver (Safari) and NVDA (Firefox) for the 4 key pages.
- [ ] Touch targets ≥ 44×44 px on mobile.

---

## 8. Test Data Requirements

- **Seed builders:** at least one ADMIN (Yadu) and 3 regular builders.
- **Seed projects:** `currentundo`, `kuzhiundo`, `damundo` in `LIVE`; 1 `PENDING` and 1 `REJECTED` for moderation tests; varied tags and upvote counts.
- **Upvotes:** pre-seeded counts plus per-test toggles; a builder–project pair guaranteed unvoted for toggle tests.
- **Changelog:** several entries across projects/types for feed pagination.
- **Auth:** a dedicated GitHub test account (or Auth.js mock provider in CI) and a non-owner account for authorisation tests.
- **Edge data:** reserved subdomains, max-length fields, unicode/emoji in name/bio, very large tag lists, malformed URLs — for validation tests.
- Data is created via Prisma seed scripts and torn down per test run (transaction rollback or DB reset on ephemeral branch). **No production data in tests.**

---

## 9. Acceptance Criteria for UAT Sign-off

UAT on `staging` is signed off by the CEO (or delegate) only when **all** of the following hold:

- [ ] All P0 functional requirements (FR-001..FR-008) pass their mapped E2E tests on UAT.
- [ ] P1 requirements (FR-009 MVP-lite, FR-010) pass or are explicitly deferred with a logged decision.
- [ ] Subdomain routing verified live for all three projects + 404 + www redirect on the staging wildcard.
- [ ] GitHub OAuth completes end-to-end on the UAT OAuth app.
- [ ] Zero serious/critical accessibility violations on the four key pages.
- [ ] Core Web Vitals within targets on UAT (lab) for hub + project + profile + search.
- [ ] No P0/P1 open bugs; all P0 bugs resolved and re-tested.
- [ ] SEO checks pass: meta tags, sitemap, robots, OG render correctly.
- [ ] Security smoke: CSRF rejected on mutation without token; rate limits observed; unauth mutations 401.
- [ ] Rollback procedure validated (a deploy can be reverted per DEPLOYMENT_RUNBOOK).
- [ ] Sign-off recorded with date, version (git SHA), and approver in the release record.

---

## 10. Roles & Reporting

- **QA / Engineers:** author and maintain tests; triage failures.
- **CEO / Product (Yadu):** UAT sign-off authority.
- **CI (Vercel + GitHub Actions):** runs unit/integration/E2E/lint/type/lighthouse/axe on every PR and on `staging`.
- **Reporting:** CI surfaces results on the PR; UAT results captured in the release record; defects tracked in the issue tracker with severity (P0–P3).

---

*End of Test Plan v1.0 — undoverse.in — 72BPM.*
