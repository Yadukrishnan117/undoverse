# undoverse.in

**Where Kerala builds the internet.**

undoverse.in is the aggregator and developer-creator economy hub for the *undo* ecosystem —
a growing family of community-built websites (`currentundo`, `kuzhiundo`, `damundo`, and more)
shipped out of Trivandrum by [72BPM](https://72bpm.com) and the wider Kerala dev community.

It is a place to discover what people are building, follow the builders, upvote what you love,
and submit your own *undo* into the ecosystem.

---

## What's inside

This is a [Turborepo](https://turbo.build) monorepo.

```
undoverse.in/
├── apps/
│   └── web/          # Next.js 14 App Router app (the site itself)
├── packages/
│   ├── db/           # Prisma schema + generated client (Neon PostgreSQL)
│   └── ui/           # Shared UI primitives & design tokens
├── turbo.json        # Turborepo pipeline
└── pnpm-workspace.yaml
```

### Stack

- **Next.js 14** (App Router, React Server Components, Edge middleware)
- **TypeScript** end to end
- **Tailwind CSS** + lightweight shadcn-style components
- **Prisma** ORM against **Neon** serverless PostgreSQL
- **Auth.js v5** with GitHub OAuth
- **Vercel** hosting with wildcard `*.undoverse.in` subdomains

---

## Getting started

### 1. Prerequisites

- Node.js `>= 18.18`
- [pnpm](https://pnpm.io) `>= 9` (`corepack enable` then `corepack prepare pnpm@latest --activate`)
- A [Neon](https://neon.tech) PostgreSQL database (free tier is plenty)
- A [GitHub OAuth App](https://github.com/settings/developers) for sign-in

### 2. Install

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env
# then fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
```

Generate an auth secret:

```bash
npx auth secret
```

### 4. Set up the database

```bash
pnpm db:generate   # generate the Prisma client
pnpm db:push       # push the schema to Neon (great for first run / prototyping)
# or, for tracked migrations:
pnpm db:migrate
```

Open Prisma Studio to poke around:

```bash
pnpm db:studio
```

### 5. Run it

```bash
pnpm dev
```

The app boots on [http://localhost:3000](http://localhost:3000).

---

## Subdomains in local dev

Production resolves `kuzhiundo.undoverse.in` → the `kuzhiundo` project page via Edge middleware.
To test subdomains locally, add entries to `/etc/hosts`:

```
127.0.0.1   undoverse.localhost
127.0.0.1   kuzhiundo.undoverse.localhost
127.0.0.1   currentundo.undoverse.localhost
```

then visit `http://kuzhiundo.undoverse.localhost:3000`.

---

## Deployment (Vercel)

1. Import the repo into Vercel. Set the root to the monorepo root; Vercel detects Turborepo.
2. Add all variables from `.env.example` in **Project → Settings → Environment Variables**.
3. Add the domain `undoverse.in` **and** the wildcard `*.undoverse.in` under **Domains**.
4. Point your DNS:
   - `A`/`CNAME` for `undoverse.in` → Vercel
   - `CNAME` for `*` → `cname.vercel-dns.com`

That's it — every `<project>.undoverse.in` will route through `apps/web/middleware.ts`.

---

## License

Code is MIT. The *undo* brand, names, and community belong to their builders.

Made with stubborn pride in Trivandrum, Kerala. 🌴
