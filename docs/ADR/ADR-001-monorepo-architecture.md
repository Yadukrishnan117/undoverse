# ADR-001: Monorepo Architecture with Turborepo

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Deciders** | Yadukrishnan K H (CEO), 72BPM engineering |
| **Context** | undoverse.in — multi-tenant developer-creator hub |

---

## Context

undoverse.in is one user-facing Next.js application today, but the undo ecosystem is expected to grow: more projects, possibly more apps (admin console, docs site, future creator tooling in Phases 2–3), and a shared design language across all of them. We need a code-organisation strategy that:

- Lets multiple apps and packages share UI, the Prisma client, config, auth, search, and analytics code without copy-paste.
- Keeps build and CI times reasonable as the codebase grows.
- Supports a small team (fast onboarding, one clone, one `pnpm install`).
- Plays well with Vercel and Next.js 14.

## Decision

We will use a **Turborepo monorepo** managed with **pnpm workspaces**.

Structure:
```
apps/
  web/            # Next.js 14 hub + tenant + API (MVP)
packages/
  ui/             # shared design-system components
  db/             # Prisma schema + client + seed
  config/         # eslint / tsconfig / tailwind presets
  auth/           # Auth.js v5 config
  search/         # Algolia client + indexing
  analytics/      # PostHog wrapper + event taxonomy
```

Turborepo provides task orchestration with caching (`build`, `lint`, `test`, `type-check`) and a clear dependency graph; pnpm provides efficient, content-addressed workspace installs.

## Alternatives Considered

### 1. Polyrepo (separate repos per app/package)
- **Pros:** strong isolation; independent release cadence; smaller per-repo surface.
- **Cons:** painful code sharing (versioned internal packages, publish/consume overhead); cross-cutting changes span many PRs; harder for a small team; CI duplicated. **Rejected** — sharing UI/db/config is central to our plan.

### 2. Single Next.js app (no packages)
- **Pros:** simplest possible setup; fastest to start.
- **Cons:** no clean seams for future apps (admin, docs); shared logic becomes tangled; refactors get harder as the product grows into Phases 2–3. **Rejected** — we know more apps are coming and want boundaries now.

### 3. Nx
- **Pros:** powerful generators, dependency graph, plugin ecosystem, strong caching.
- **Cons:** heavier conceptual overhead and configuration than we need; Turborepo's Vercel integration and minimalism fit our stack and team size better. **Rejected for now** — re-evaluate if tooling needs outgrow Turborepo.

## Consequences

**Positive**
- One clone, one install; shared code consumed via workspace imports (`@undoverse/ui`, `@undoverse/db`).
- Turborepo caching keeps CI fast; only affected tasks rebuild.
- First-class Vercel support (Turborepo is a Vercel project) simplifies deploys.
- Clear seams make adding an admin or docs app a low-friction `apps/*` addition.

**Negative / trade-offs**
- Slightly more initial setup than a single app (workspace + pipeline config).
- All apps share one dependency tree; a breaking dependency bump can ripple — mitigated by CI gates and the package boundaries.
- Contributors must understand workspace conventions (documented in the README).

**Follow-ups**
- Define `turbo.json` pipelines for `build`, `lint`, `test`, `type-check`.
- Enforce import boundaries (no app-to-app imports; apps depend on packages, not vice versa).
