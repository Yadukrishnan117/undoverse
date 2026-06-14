# Environment Setup Guide

This guide gets undoverse.in running on your machine from a clean checkout,
explains every environment variable, and covers the problems people hit most
often.

Built by 72BPM, Trivandrum, Kerala.

---

## Prerequisites

| Tool | Version | Notes |
| ---- | ------- | ----- |
| **Node.js** | 20.x (LTS) | Project minimum is `>=18.18.0`; CI uses 20. We recommend [nvm](https://github.com/nvm-sh/nvm). |
| **pnpm** | 9.1.0 | Pinned via `packageManager`. Install with `corepack enable` or `npm i -g pnpm@9.1.0`. |
| **Git** | any recent | For cloning and branching. |
| **A Neon account** | — | Free tier is enough for development. https://neon.tech |
| **A GitHub account** | — | To create an OAuth app for sign-in. |

Quick check:

```bash
node -v   # v20.x
pnpm -v   # 9.1.0
git --version
```

If you use nvm:

```bash
nvm install 20
nvm use 20
corepack enable          # makes the pinned pnpm available
```

---

## First-time setup

```bash
# 1. Clone
git clone https://github.com/undoverse-in/undoverse.git
cd undoverse

# 2. Install all workspace dependencies
pnpm install

# 3. Create your local env file
cp .env.example .env
# ...then fill in the values (see the next section)

# 4. Generate the Prisma client
pnpm db:generate

# 5. Create the schema in your dev database
pnpm db:push

# 6. Start the dev server
pnpm dev
```

The app runs at **http://localhost:3000**.

---

## Environment variables

Copy `.env.example` to `.env` and fill in each value below. Never commit `.env`.

> **A note on auth variable names:** this project uses **Auth.js v5**, whose
> variables are `AUTH_SECRET`, `AUTH_GITHUB_ID`, and `AUTH_GITHUB_SECRET`. These
> are the v5 successors to the older NextAuth names `NEXTAUTH_SECRET`,
> `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`. Use the `AUTH_*` names — they
> are what the code reads.

### `DATABASE_URL` (required)

The **pooled** Neon connection string used by the app at runtime (PgBouncer /
serverless-friendly).

- Where to get it: Neon Console → your project → **Connection Details** → choose
  the **Pooled connection** → copy the string.
- It looks like:
  ```
  postgresql://user:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/undoverse?sslmode=require&pgbouncer=true
  ```

### `DIRECT_URL` (required)

The **direct** (non-pooled) Neon connection string. Prisma uses this for
migrations, which can't run through PgBouncer.

- Where to get it: same Neon **Connection Details** panel → toggle off pooling
  (the **Direct connection**) → copy.
- It looks like:
  ```
  postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/undoverse?sslmode=require
  ```

> **Tip:** Use a **separate Neon database (or branch) per environment** —
> development, staging, and production each get their own. Neon's branching
> feature makes this cheap.

### `AUTH_SECRET` (required) — *formerly `NEXTAUTH_SECRET`*

A long random string used to encrypt session tokens.

Generate one:

```bash
npx auth secret
# or
openssl rand -base64 33
```

Paste the output as the value.

### `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` (required) — *formerly `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`*

Credentials for the GitHub OAuth app used for sign-in.

To create the OAuth app:

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (https://github.com/settings/developers).
2. Fill in:
   - **Application name:** `undoverse (local)` (make separate apps per env)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**.
4. Copy the **Client ID** → `AUTH_GITHUB_ID`.
5. Click **Generate a new client secret**, copy it → `AUTH_GITHUB_SECRET`.

For staging/production, create separate OAuth apps with callback URLs:

- Staging: `https://staging.undoverse.in/api/auth/callback/github`
- Production: `https://undoverse.in/api/auth/callback/github`

### `NEXT_PUBLIC_ROOT_DOMAIN` (required)

The root domain that wildcard subdomains hang off of. Used by the middleware for
subdomain routing.

- Local: `localhost:3000`
- Production: `undoverse.in`

### `NEXT_PUBLIC_APP_URL` (required)

The full public base URL of the app, used for absolute links and Open Graph
tags.

- Local: `http://localhost:3000`
- Staging: `https://staging.undoverse.in`
- Production: `https://undoverse.in`

### `ALGOLIA_APP_ID` / `ALGOLIA_API_KEY` (optional — search)

Powers site search. Skip these if you aren't working on search.

- Create a (free) Algolia application at https://www.algolia.com.
- **App ID:** Algolia Dashboard → **Settings → API Keys → Application ID** →
  `ALGOLIA_APP_ID`.
- **API Key:** use a **search-only** key for the client and an **admin/write**
  key only on the server for indexing. Dashboard → **Settings → API Keys**.
  Set the server key as `ALGOLIA_API_KEY`.

> Never expose an admin/write key to the browser. Only the search-only key may
> be public (`NEXT_PUBLIC_*`).

### `POSTHOG_KEY` (optional — analytics)

Product analytics. Skip if not working on analytics.

- Create a project at https://posthog.com (or self-host).
- PostHog → **Project Settings → Project API Key** → `POSTHOG_KEY`.
- The host is usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`;
  set it via `POSTHOG_HOST` if your setup needs it.

---

### Example `.env`

```dotenv
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/undoverse?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-xxxx.ap-southeast-1.aws.neon.tech/undoverse?sslmode=require"

# Auth.js v5
AUTH_SECRET="<output of: openssl rand -base64 33>"
AUTH_GITHUB_ID="<github oauth client id>"
AUTH_GITHUB_SECRET="<github oauth client secret>"

# Public config
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: search
ALGOLIA_APP_ID="<algolia app id>"
ALGOLIA_API_KEY="<algolia admin/write key, server-side only>"

# Optional: analytics
POSTHOG_KEY="<posthog project api key>"
```

---

## Running locally with subdomain routing

undoverse uses subdomains for sub-projects (e.g. `myproject.undoverse.in`).
Browsers don't resolve arbitrary subdomains of `localhost` by default, so you
have two options for local development.

### Option A — `*.localhost` (no setup, Chrome/Edge/Firefox)

Most modern browsers resolve any `*.localhost` host to `127.0.0.1` automatically.
Just visit:

```
http://myproject.localhost:3000
```

Set `NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"` so the middleware treats the
left-most label as the subdomain.

### Option B — edit `/etc/hosts` (works everywhere, incl. Safari)

Safari does **not** resolve `*.localhost`. Add explicit entries:

```bash
sudo nano /etc/hosts
```

Add lines like:

```
127.0.0.1   undoverse.localhost
127.0.0.1   myproject.undoverse.localhost
```

Then visit `http://myproject.undoverse.localhost:3000`. On Windows the hosts file
is at `C:\Windows\System32\drivers\etc\hosts`.

---

## Common setup problems and solutions

**`pnpm: command not found` or wrong pnpm version**
Run `corepack enable`, or install the pinned version: `npm i -g pnpm@9.1.0`.
The repo pins `pnpm@9.1.0` via the `packageManager` field.

**`Cannot find module '@prisma/client'` / Prisma types missing**
You haven't generated the client. Run `pnpm db:generate`. This also runs
automatically as part of `pnpm build`.

**Prisma migration errors / "prepared statement" or PgBouncer errors**
Migrations must use the **direct** connection. Make sure `DIRECT_URL` is set to
the non-pooled Neon string. `DATABASE_URL` (pooled, with `pgbouncer=true`) is for
runtime only.

**`P1001: Can't reach database server`**
Check the Neon connection string, confirm `sslmode=require` is present, and make
sure your Neon project/branch isn't paused (free-tier projects auto-suspend;
opening the Neon console wakes them).

**GitHub sign-in returns "redirect_uri mismatch"**
The OAuth app's **Authorization callback URL** must exactly match
`<base-url>/api/auth/callback/github`. Use separate OAuth apps for local,
staging, and production.

**Subdomain pages 404 locally**
Confirm `NEXT_PUBLIC_ROOT_DOMAIN` matches how you're accessing the site
(`localhost:3000`), and that you're using `*.localhost` or `/etc/hosts` per the
section above. Safari requires the `/etc/hosts` approach.

**`AUTH_SECRET` / "no secret" errors**
Generate one with `openssl rand -base64 33` (or `npx auth secret`) and set
`AUTH_SECRET` in `.env`.

**Port 3000 already in use**
Stop the other process, or run `pnpm --filter @undoverse/web dev -- -p 3001`.

**Stale build / weird type errors after pulling**
Clear caches and reinstall:

```bash
pnpm clean
pnpm install
pnpm db:generate
```
