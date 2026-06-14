# Changelog

All notable changes to **undoverse.in** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Maintained by 72BPM, Trivandrum, Kerala.

---

## [Unreleased]

### Planned
- Phase 2 (Creator Layer): rich builder profiles, analytics dashboard, project versioning, follow system.

---

## [0.1.0-alpha] - 2026-06-15

Initial alpha of the undoverse hub — the MVP foundation.

### Added
- Initial Turborepo monorepo scaffold (`apps/web` + shared `ui`, `db`, `config`, `auth`, `search`, `analytics` packages).
- Landing page (the hub) showcasing the undo ecosystem with the three initial projects: **currentundo**, **kuzhiundo**, and **damundo**.
- Subdomain routing middleware for multi-tenancy (`<project>.undoverse.in` → tenant view; reserved-word and `www` handling).
- Prisma schema and initial migration (Builder, Project, Upvote, Changelog, and Auth.js adapter tables) against Neon PostgreSQL.
- Project submission form with client/server validation and subdomain availability check (submissions enter `PENDING` review).
- Builder profile pages at `/@<handle>` with editable bio and submitted-project listing.
- GitHub OAuth authentication via Auth.js v5 (first-login builder provisioning, secure session cookies).
- Global search powered by Algolia (typo-tolerant) with a server-side PostgreSQL fallback.
- Upvote system for authenticated builders (one upvote per builder per project, optimistic toggle).

[Unreleased]: https://github.com/72bpm/undoverse/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/72bpm/undoverse/releases/tag/v0.1.0-alpha
