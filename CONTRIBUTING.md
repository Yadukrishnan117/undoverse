# Contributing to undoverse.in

Thanks for your interest in building **undoverse.in** with us.

## Project philosophy

> Build in Kerala, ship for the world.

undoverse.in is built by [72BPM](https://72bpm.com) in Trivandrum, Kerala. It is
the hub for the "undo" ecosystem — a growing family of developer-creator
sub-projects. We care about three things, in order:

1. **Craft.** Small, well-tested, accessible, fast.
2. **Clarity.** Code and docs that a new contributor can follow in an afternoon.
3. **Community.** Built locally, open to contributors everywhere.

If a change makes the product simpler for users and the codebase clearer for the
next contributor, it's probably the right change.

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Monorepo:** Turborepo + pnpm workspaces
- **Database:** Neon (serverless PostgreSQL) via Prisma
- **Auth:** Auth.js v5 (GitHub OAuth)
- **Deployment:** Vercel Pro
- **Package manager:** pnpm (`pnpm@9.1.0`)
- **Node:** 20.x (project minimum is `>=18.18.0`, but CI runs Node 20)

Monorepo layout:

```
.
├── apps/
│   └── web/          # Next.js application (undoverse.in)
├── packages/
│   ├── db/           # Prisma schema, client, migrations (@undoverse/db)
│   └── ui/           # Shared React components (@undoverse/ui)
└── docs/             # Project documentation
```

---

## Development setup

> A more detailed, troubleshooting-friendly walkthrough lives in
> [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md). The short version:

### 1. Prerequisites

- [Node 20+](https://nodejs.org/) (use [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20`)
- [pnpm 9](https://pnpm.io/installation): `npm install -g pnpm@9.1.0` (or `corepack enable`)
- Git

### 2. Clone and install

```bash
git clone https://github.com/undoverse-in/undoverse.git
cd undoverse
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then fill in the values. See
[`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md) for where each value
comes from.

### 4. Set up the database

```bash
# Generate the Prisma client
pnpm db:generate

# Push the schema to your dev database (or use migrations)
pnpm db:push
```

### 5. Run the app

```bash
pnpm dev
```

The app starts on http://localhost:3000.

---

## Branching convention

We deploy along this cycle:

```
feature/* ──▶ develop ──▶ staging ──▶ main (production)
```

- `develop` — integration branch; preview deploys per PR.
- `staging` — deploys to https://staging.undoverse.in (UAT).
- `main` — deploys to https://undoverse.in (production, gated by approval).

Branch names use a `type/slug` format:

| Type       | Use for                         | Example                       |
| ---------- | ------------------------------- | ----------------------------- |
| `feature/` | New functionality               | `feature/builder-profiles`    |
| `fix/`     | Bug fixes                       | `fix/subdomain-redirect-loop` |
| `chore/`   | Tooling, deps, refactors        | `chore/bump-next-14-2`        |
| `docs/`    | Documentation only              | `docs/contributing-guide`     |

Keep slugs short, lowercase, and hyphenated.

---

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(optional scope): <description>

[optional body]

[optional footer(s)]
```

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`,
`build`, `ci`, `style`, `revert`.

Examples:

```
feat(web): add builder profile page
fix(db): correct unique index on submission slug
docs: explain subdomain routing in setup guide
chore(ci): cache pnpm store in workflows
```

The first line should be under ~72 characters and written in the imperative
mood ("add", not "added").

---

## Pull request process

1. **Branch** off the right base (usually `develop`).
2. Open a **Draft PR** early so others can see direction.
3. Make sure local checks pass:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Fill in the PR template (it loads automatically).
5. **Mark ready for review.** CI must be green and at least one CODEOWNER must
   approve.
6. Once merged to `develop`, changes flow to `staging` for UAT, then to `main`
   for production. Production deploys require a manual approval.

Every PR gets an automatic **preview deployment** and a **Lighthouse** report
posted as a comment — check them before requesting review.

---

## Code style

- **Formatting:** Prettier. Run `pnpm format` before pushing.
- **Linting:** ESLint (`pnpm lint`). No new warnings.
- **Types:** No `any` without a written reason. `pnpm typecheck` must pass.
- **Imports:** Prefer named imports; keep them ordered.
- **Components:** Small and composable. Shared, reusable UI goes in
  `packages/ui`. App-specific UI stays in `apps/web`.
- **Accessibility:** Semantic HTML, labelled controls, keyboard support, and
  sufficient color contrast. UI PRs are reviewed for a11y.
- **No stray debug:** Remove `console.log` / commented-out code before review.

---

## Adding a new "undo" sub-project

undoverse hosts multiple sub-projects under the "undo" family. To add one:

1. **Pitch it first.** Open a Feature Request issue describing the sub-project,
   its audience, and its subdomain (e.g. `myproject.undoverse.in`).
2. **Model the data.** Add any new models to `packages/db/prisma/schema.prisma`,
   then create a migration:
   ```bash
   pnpm --filter @undoverse/db migrate
   ```
3. **Build the surface.** Add routes/pages under `apps/web/src/app`. Subdomain
   routing is handled in `apps/web/middleware.ts` — register the new subdomain
   there.
4. **Reuse shared UI** from `@undoverse/ui` wherever possible; promote anything
   reusable into that package.
5. **Add tests** for new logic and **docs** under `docs/` describing the
   sub-project.
6. **Open a PR** following the process above. Preview deploys will give the
   sub-project its own URL for review.

---

## Good first issues

New here? Look for issues labelled
[`good first issue`](https://github.com/undoverse-in/undoverse/labels/good%20first%20issue).
These are scoped to be approachable without deep knowledge of the codebase.
If you want to take one, comment on it to avoid duplicate work, and don't
hesitate to ask questions in the issue or in
[Discussions](https://github.com/undoverse-in/undoverse/discussions).

---

## Code of conduct

By participating, you agree to uphold our Code of Conduct. Be kind, assume good
intent, and help newcomers. Report unacceptable behavior to
**conduct@undoverse.in**. (See `CODE_OF_CONDUCT.md` if present in the repo.)

---

Built with care in Trivandrum. Welcome aboard.
