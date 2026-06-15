#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  undoverse.in — Push to GitHub
#  Usage: bash push.sh ghp_YOUR_CLASSIC_PAT_HERE
#  Get a PAT at: https://github.com/settings/tokens/new
#  Required scopes: repo + workflow
# ─────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

PAT="${1:-}"

if [ -z "$PAT" ]; then
  echo "Usage: bash push.sh YOUR_GITHUB_PAT"
  echo "Get one at: https://github.com/settings/tokens/new (repo + workflow scopes)"
  exit 1
fi

# Remove stale git lock if present
rm -f .git/index.lock 2>/dev/null || true

# Stage everything
git add -A

# Commit (skip if nothing changed)
if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "feat: futuristic UI redesign — glassmorphism, animated hero, scroll reveals

- Complete visual overhaul with dark space aesthetic
- Animated mesh grid + floating glow orbs in hero
- Gradient animated headline + scroll-reveal sections
- Glassmorphism project cards with neon border hover
- AnimatedCounter component (counts up on scroll)
- ScrollReveal component (IntersectionObserver)
- Marquee ticker strip
- Bento features grid
- Premium frosted-glass nav
- Animated stats row
- Aurora gradient CTA card
- next.config.ts → next.config.mjs (Next.js 14 fix)"
fi

# Set remote with PAT
git remote set-url origin "https://${PAT}@github.com/Yadukrishnan117/undoverse.git"

# Push
echo ""
echo "🚀 Pushing to GitHub..."
git push origin HEAD

# Reset remote URL (don't store PAT in config)
git remote set-url origin "https://github.com/Yadukrishnan117/undoverse.git"

echo ""
echo "✅ Pushed to https://github.com/Yadukrishnan117/undoverse"
echo ""
echo "Next: deploy to Vercel → https://vercel.com/new"
echo "  1. Import from GitHub → Yadukrishnan117/undoverse"
echo "  2. Framework: Next.js (auto-detected)"
echo "  3. Root directory: apps/web"
echo "  4. Add env vars (see .env.local for the list)"
echo "  5. Click Deploy → your site goes live"
