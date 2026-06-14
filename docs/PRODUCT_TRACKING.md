# Product Analytics Plan — undoverse.in

| | |
|---|---|
| **Project** | undoverse.in |
| **Document** | Product Analytics / Tracking Plan |
| **Version** | 1.0 |
| **Date** | 2026-06-15 |
| **Owner** | 72BPM, Trivandrum, Kerala |
| **Author** | Yadukrishnan K H — yadu@chargemod.com |
| **Tool** | PostHog |
| **Related** | SRS.md (NFR-007 privacy, FR-009 dashboard), SYSTEM_DESIGN.md |

This plan defines what we measure on undoverse.in, how events are named and structured in PostHog, how we handle identity from anonymous to authenticated, and the KPIs and north-star metric for Phase 1.

---

## 1. Goals & Principles

- **Measure what moves the product:** discovery → builder sign-up → shipping projects → engagement (upvotes).
- **Privacy first (NFR-007):** collect the minimum; mask sensitive inputs; respect Do-Not-Track; no PII in event properties beyond the GitHub handle/distinct_id needed to identify a builder.
- **One taxonomy, enforced in code:** all events go through the typed `capture()` wrapper in `packages/analytics`; only allow-listed event names ship.
- **Consistent properties:** shared context (project slug, tenant, surface) attached automatically where relevant.

---

## 2. Key Metrics to Track

| Metric | Definition | Why |
|---|---|---|
| **DAU / WAU / MAU** | Distinct active visitors+builders per day/week/month | Top-line reach and retention |
| **Project submissions** | Count of `submission_completed` | Supply side of the ecosystem |
| **Submission conversion** | `submission_completed` / `submission_started` | Form/onboarding health |
| **Upvotes** | Count of `upvote_toggled` (upvoted=true) | Engagement / appreciation signal |
| **Builder signups** | First-time `github_oauth_completed` (new builder provisioned) | Account growth |
| **OAuth conversion** | `github_oauth_completed` / `github_oauth_started` | Auth friction |
| **Subdomain / tenant visits** | `page_viewed` where surface = tenant, grouped by project | Per-project demand |
| **Search usage** | `search_performed` count + zero-result rate | Discovery quality |
| **Project card CTR** | `project_card_clicked` / `page_viewed` (hub) | Discovery effectiveness |
| **Profile views** | `builder_profile_viewed` | Creator-layer interest (Phase 2 signal) |

---

## 3. PostHog Event Taxonomy

Naming: `snake_case`, `noun_verb` past tense for completed actions. Every event carries base context properties plus event-specific properties.

**Base properties (auto-attached by the wrapper where applicable):**
`surface` (`hub` | `tenant` | `profile` | `dashboard`), `tenant_slug` (when on a project subdomain), `is_authenticated` (bool), `path`, `referrer`. No raw PII beyond the authenticated `distinct_id`.

| Event | When | Key properties |
|---|---|---|
| `page_viewed` | Any page render (client) | `surface`, `tenant_slug?`, `path`, `referrer` |
| `project_card_clicked` | Visitor clicks a project card on the hub | `project_slug`, `position`, `sort_mode` |
| `upvote_toggled` | Builder toggles an upvote | `project_slug`, `upvoted` (bool), `new_count` |
| `search_performed` | Search query executed (debounced) | `query_length`, `result_count`, `zero_results` (bool), `source` (`algolia`/`postgres`) |
| `submission_started` | Builder opens the submit form / first field focus | `entry_point` |
| `submission_completed` | Submission POST succeeds (status PENDING) | `project_slug`, `tag_count`, `has_repo` (bool), `has_live_url` (bool) |
| `builder_profile_viewed` | A builder profile page is viewed | `profile_handle`, `is_own_profile` (bool) |
| `github_oauth_started` | "Continue with GitHub" clicked | `entry_point` (e.g. `upvote_gate`, `submit_gate`, `nav`) |
| `github_oauth_completed` | OAuth callback succeeds | `is_new_builder` (bool) |

**Conventions**
- Mutations are captured **server-side** (in the route handler) for reliability/anti-tamper: `upvote_toggled`, `submission_completed`, `github_oauth_completed`. Pure UI events (`page_viewed`, `project_card_clicked`, `search_performed`, `submission_started`, `github_oauth_started`) are captured client-side.
- `submission_started` + `submission_completed` form the submission funnel; `github_oauth_started` + `github_oauth_completed` form the auth funnel.

---

## 4. Identity Strategy

We model the journey **anonymous → GitHub-authenticated**.

1. **Anonymous:** PostHog assigns an anonymous `distinct_id` (cookie) on first visit. All pre-auth events (`page_viewed`, `search_performed`, `project_card_clicked`, `github_oauth_started`) are attributed to this anonymous id.
2. **On successful OAuth (`github_oauth_completed`):** call PostHog `identify(builderDistinctId)` using a stable id (the Builder `id` / GitHub-derived handle) and **alias/merge** the prior anonymous id so the pre- and post-login activity stitch into one person.
3. **Authenticated:** subsequent events carry the builder distinct_id. Person properties set on identify: `handle`, `is_admin` (bool), `signup_date`. **No email** stored in PostHog person properties (privacy minimisation).
4. **Sign-out:** call PostHog `reset()` so a shared device doesn't conflate two builders; a fresh anonymous id starts.

**Groups (optional, Phase 2):** treat each **project** as a PostHog group (`group_type=project`, key=`project_slug`) so we can analyse engagement per project (views, upvotes) as a cohort.

---

## 5. Dashboard KPIs

A PostHog dashboard ("undoverse — Phase 1") with these tiles:

1. **Active users** — DAU/WAU/MAU trend.
2. **Submission funnel** — `submission_started → submission_completed` (conversion %).
3. **Auth funnel** — `github_oauth_started → github_oauth_completed` (conversion %); new-builder rate.
4. **Upvotes over time** — daily `upvote_toggled` (upvoted=true), and net upvotes.
5. **Top projects by tenant visits** — `page_viewed` (surface=tenant) grouped by `tenant_slug`.
6. **Project card CTR** — `project_card_clicked` / hub `page_viewed`.
7. **Search health** — searches/day and **zero-result rate**.
8. **New builders** — daily count of `github_oauth_completed` where `is_new_builder=true`.

Builder-facing and admin dashboards (FR-009) read from these same events (per-project for builders; aggregate for admin).

---

## 6. Phase 1 North Star Metric

**North Star: Weekly Live Projects Engaged (WLPE)** — the number of LIVE projects that received at least one meaningful interaction (a tenant `page_viewed` *and/or* an `upvote_toggled`) in a rolling 7-day window.

Rationale: undoverse succeeds when its catalogue is *alive* — projects are being discovered and appreciated, not just listed. WLPE captures both sides of the marketplace (supply that's live, demand that engages) in a single number, and it naturally rises when builders ship more projects *and* visitors engage with them. Supporting/guardrail metrics: submission conversion, OAuth conversion, and search zero-result rate.

---

## 7. Implementation Notes

- All capture calls route through `packages/analytics` `capture(event, props)`; the wrapper rejects any event not in the allow-list (TypeScript union) and strips disallowed property keys.
- DNT respected: if the browser signals Do-Not-Track, client capture is disabled (server-side mutation events may still be counted in aggregate without personal attribution).
- Autocapture is **off**; we ship explicit, named events only, for a clean, intentional dataset.
- Event names and properties are versioned in this document; changes require a PR updating both the taxonomy here and the wrapper's allow-list.

---

*End of Product Analytics Plan v1.0 — undoverse.in — 72BPM.*
