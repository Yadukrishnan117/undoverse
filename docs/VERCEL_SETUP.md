# Vercel Deployment Setup — undoverse.in

> One-time setup. After this, every push to `main` auto-deploys to undoverse.in.

---

## Step 1 — Push code to GitHub

```bash
# In Terminal, from the Undoverse.in folder:
bash push.sh ghp_YOUR_PAT_HERE
```

Get a PAT at: https://github.com/settings/tokens/new  
Required scopes: **repo** + **workflow**

---

## Step 2 — Deploy to Vercel (first time)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **Yadukrishnan117/undoverse**
4. Configure project:
   - **Framework:** Next.js *(auto-detected)*
   - **Root directory:** `apps/web`
   - **Build command:** `pnpm turbo build --filter=web` *(from vercel.json)*
   - **Output directory:** `.next` *(from vercel.json)*

---

## Step 3 — Add Environment Variables in Vercel

In **Settings → Environment Variables**, add these for **Production**:

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://undoverse.in` | |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `undoverse.in` | |
| `DATABASE_URL` | `postgresql://...` | From Neon dashboard (pooled) |
| `DIRECT_URL` | `postgresql://...` | From Neon dashboard (direct) |
| `AUTH_SECRET` | `openssl rand -base64 32` | Run in terminal to generate |
| `AUTH_GITHUB_ID` | your OAuth App client ID | See step 5 |
| `AUTH_GITHUB_SECRET` | your OAuth App client secret | See step 5 |

---

## Step 4 — Create Neon Database (free)

1. Go to **https://neon.tech** → New project → name: `undoverse-prod`
2. Copy the **connection strings** (pooled + direct)
3. Paste into Vercel env vars above

---

## Step 5 — Create GitHub OAuth App

1. Go to **https://github.com/settings/developers** → OAuth Apps → New
2. Fill in:
   - **Homepage URL:** `https://undoverse.in`
   - **Authorization callback URL:** `https://undoverse.in/api/auth/callback/github`
3. Copy **Client ID** and **Client Secret** → paste into Vercel env vars

---

## Step 6 — Connect Custom Domain

In Vercel → **Settings → Domains**:
1. Add `undoverse.in`
2. Add `www.undoverse.in` (redirects to apex)
3. Copy the DNS records shown
4. In your domain registrar (or Cloudflare), add:
   - `A` record: `@` → Vercel IP
   - `CNAME`: `www` → `cname.vercel-dns.com`

---

## Step 7 — Add GitHub Actions Secrets (for CI/CD)

In **GitHub → Settings → Secrets and variables → Actions**, add:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create |
| `VERCEL_ORG_ID` | vercel.com/account → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General |
| `PRODUCTION_DATABASE_URL` | Neon pooled URL |
| `PRODUCTION_DIRECT_URL` | Neon direct URL |
| `STAGING_DATABASE_URL` | Neon staging project URL |
| `STAGING_DIRECT_URL` | Neon staging direct URL |

---

## Deploy Flow After Setup

```
git push origin feature/my-change
        ↓
  Opens PR → preview deploy on Vercel
        ↓
  Merge to develop → staging.undoverse.in
        ↓
  Merge to main → undoverse.in (with manual approval gate)
```

---

## Quick Commands

```bash
# Push + deploy
bash push.sh YOUR_PAT

# Run locally
bash dev.sh

# Check Vercel deployment status
# → https://vercel.com/Yadukrishnan117/undoverse
```
