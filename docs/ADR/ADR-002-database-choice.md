# ADR-002: Database — Neon PostgreSQL with Prisma

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-06-15 |
| **Deciders** | Yadukrishnan K H (CEO), 72BPM engineering |
| **Context** | undoverse.in — multi-tenant developer-creator hub |

---

## Context

undoverse.in needs a primary datastore for builders, projects, upvotes, changelog entries, and Auth.js session/account tables. Requirements:

- **Relational data** with clear foreign keys and uniqueness constraints (one upvote per builder per project; unique project slug = subdomain).
- **Serverless-friendly:** runs behind Vercel serverless/edge functions, which fan out and exhaust traditional connection pools.
- **Branchable / cheap environments:** separate data for dev / UAT / prod without standing up separate servers.
- **Strong TypeScript integration** and migrations for a small team.
- **Cost-efficient** at MVP scale, scaling without a re-platform.

## Decision

We will use **Neon (serverless PostgreSQL)** as the database and **Prisma** as the ORM/migration tool.

- App runtime connects via Neon's **pooled** connection string (`DATABASE_URL`); migrations use the **direct** connection (`DIRECT_URL`).
- Each environment (dev / UAT / prod) uses a separate **Neon branch**, giving isolated data with near-instant provisioning and point-in-time restore.
- Prisma provides the schema, typed client, and forward-only migrations consumed by `packages/db`.

## Alternatives Considered

### 1. PlanetScale (MySQL/Vitess)
- **Pros:** excellent serverless scaling; branching workflow; battle-tested.
- **Cons:** MySQL (we prefer Postgres features — `text[]`, GIN, richer JSONB); historically no foreign-key enforcement in the Vitess model (mitigated later but a friction point); we want native FK constraints for upvote/slug integrity. **Rejected** in favour of Postgres semantics.

### 2. Supabase (PostgreSQL + BaaS)
- **Pros:** Postgres; bundled auth, storage, realtime; generous tiers.
- **Cons:** we already chose Auth.js v5 + GitHub OAuth, so Supabase's auth is redundant; we'd use only the DB, where Neon's serverless branching and pooling fit our Vercel deployment more cleanly. **Rejected** — overlap with our existing auth choice and we want a focused DB.

### 3. MongoDB
- **Pros:** flexible documents; easy to start.
- **Cons:** our data is inherently relational (builders↔projects↔upvotes) with constraints we want enforced at the DB; we'd reimplement uniqueness/integrity in app code. **Rejected** — wrong shape for this domain.

### 4. SQLite + Turso (libSQL)
- **Pros:** very cheap; edge-replicated; great for read-heavy, simple apps.
- **Cons:** weaker fit for concurrent writes (upvotes, submissions) and for the Prisma/Postgres feature set we want; migration/tooling maturity for our patterns lower than Neon+Prisma. **Rejected for now** — revisit only if read-edge latency becomes the dominant concern.

## Consequences

**Positive**
- Native Postgres: foreign keys, unique constraints, `text[]` tags with GIN index, JSONB for builder links, transactional upvote-count maintenance.
- Serverless pooling avoids connection exhaustion under Vercel fan-out.
- Neon branches give cheap, isolated dev/UAT/prod databases and point-in-time restore for safe rollbacks (see DEPLOYMENT_RUNBOOK §C.5).
- Prisma gives end-to-end types into the monorepo and a clean migration workflow.

**Negative / trade-offs**
- Two connection strings to manage (pooled vs direct) per environment — documented in the runbook.
- Prisma's pooled-connection nuances in serverless require care (short transactions, correct datasource config).
- Cold starts / autosuspend on Neon's free tiers can add latency to the first request after idle — mitigated by ISR caching of read-heavy pages so the DB is off the hot path.

**Follow-ups**
- Configure `datasource` with `url = DATABASE_URL` and `directUrl = DIRECT_URL`.
- Add a reconciliation job to verify `upvoteCount` against `Upvote` rows.
- Phase 3: consider a read replica or materialised views for analytics queries.
