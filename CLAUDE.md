# undoverse.in — Working Memory for Claude

> This file is read by Claude at the start of every session on this project.
> Keep it updated after every significant change.

## Project Identity

- **Product:** undoverse.in — multi-tenant aggregator and developer-creator economy hub for the "undo" ecosystem
- **Company:** 72BPM, Trivandrum, Kerala, India
- **CEO:** Yadukrishnan K H (yadu@chargemod.com)
- **GitHub Org:** undoverse-in
- **Domains:** undoverse.in (prod) | staging.undoverse.in (UAT) | *.undoverse.in (sub-projects)

## Current Status (2026-06-15)

- **Phase:** Phase 1 MVP — in development
- **Version:** v0.1.0-alpha
- **Branch:** develop

## Repository Structure

```
undoverse/
├── apps/web/          # Next.js 14 App Router — main site
├── packages/db/       # Prisma schema + client
├── packages/ui/       # Shared component library
├── docs/              # All SDLC documentation
├── .github/           # CI/CD workflows, PR templates, issue templates
├── CONTRIBUTING.md
├── vercel.json
└── CLAUDE.md          # ← this file
```

## Tech Stack (DO NOT change without ADR)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Monorepo | Turborepo + pnpm workspaces |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon PostgreSQL + Prisma |
| Auth | Auth.js v5 (GitHub OAuth) |
| Hosting | Vercel Pro |
| DNS/CDN | Cloudflare |
| Analytics | PostHog (self-hosted) |
| Search | Algolia (free tier) |
| Email | Resend |
| Background Jobs | Inngest |
| Storage | Cloudflare R2 |

## Branch & Deployment Strategy

```
feature/* or fix/*
       ↓ PR → develop
   develop (auto-deploys to Vercel preview)
       ↓ PR → staging
   staging (auto-deploys to staging.undoverse.in)
       ↓ PR + manual approval → main
     main (auto-deploys to undoverse.in)
```

## Environment Variables (see .env.example for full list)

Critical vars:
- `DATABASE_URL` — Neon connection string (pooled)
- `DIRECT_URL` — Neon direct connection (for migrations)
- `AUTH_SECRET` — Auth.js secret (generate with: `openssl rand -base64 32`)
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth app credentials
- `NEXT_PUBLIC_APP_URL` — Base URL for current environment

## Key Design Decisions

1. **Subdomain routing** via Next.js Edge Middleware (`middleware.ts`) — reads from DB/KV, no redeploy needed for new projects
2. **Seed fallback** in `lib/projects.ts` — site works without DB for demos
3. **Open-source from day one** — MIT license, CONTRIBUTING.md, Good First Issues
4. **Brand:** dark-first indigo/cyan (#6366F1 / #0F172A / #22D3EE), Kerala-proud tone, system fonts (no web font dependency)

## Initial Projects (seed data)

- **currentundo** → currentundo.undoverse.in
- **kuzhiundo** → kuzhiundo.undoverse.in  
- **damundo** → damundo.undoverse.in

## SDLC Documents (docs/)

| Document | Purpose |
|---|---|
| `SRS.md` | Software Requirements Specification |
| `SYSTEM_DESIGN.md` | Architecture + API + DB design |
| `TEST_PLAN.md` | Unit, integration, E2E, performance test plan |
| `UX_COPY_GUIDE.md` | Brand voice, copy decisions, terminology |
| `DEPLOYMENT_RUNBOOK.md` | Step-by-step deploy procedures per environment |
| `CHANGELOG.md` | Version history (Keep a Changelog format) |
| `PRODUCT_TRACKING.md` | PostHog event taxonomy + analytics plan |
| `ENVIRONMENT_SETUP.md` | Developer onboarding guide |
| `ADR/ADR-001-monorepo-architecture.md` | Why Turborepo |
| `ADR/ADR-002-database-choice.md` | Why Neon + Prisma |
| `ADR/ADR-003-hosting-strategy.md` | Why Vercel Pro + Cloudflare |

## GitHub Actions Required Secrets

Configure these in GitHub repo settings → Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `TURBO_TOKEN` + `TURBO_TEAM`
- `STAGING_DATABASE_URL` + `STAGING_DIRECT_URL`
- `PRODUCTION_DATABASE_URL` + `PRODUCTION_DIRECT_URL`
- `SLACK_WEBHOOK_URL` (optional, for deploy notifications)

## Phase Roadmap

| Phase | Duration | Status |
|---|---|---|
| Phase 1: MVP | 4 weeks | 🔄 In Progress |
| Phase 2: Creator Layer | 6-8 weeks | ⏳ Pending |
| Phase 3: Economy & Scale | 3 months | ⏳ Pending |

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- **Branches:** `feature/slug`, `fix/slug`, `chore/slug`, `docs/slug`
- **Components:** PascalCase, co-located with their page if single-use
- **API routes:** RESTful, in `src/app/api/`
- **DB queries:** Always go through `packages/db` or `src/lib/db.ts`
- **Env vars:** Never commit `.env` — only `.env.example`

## Last Updated

2026-06-15 — Initial scaffold complete (40 source files + 13 SDLC docs + 13 CI/CD files)
