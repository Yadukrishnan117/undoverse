#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  undoverse.in — Initial GitHub push script
#  Run this ONCE from your Terminal inside the project folder:
#
#    cd ~/Claude/Projects/Undoverse.in
#    bash push-to-github.sh
# ─────────────────────────────────────────────────────────────

set -e

REPO_URL="https://github.com/Yadukrishnan117/undoverse.git"
BRANCH="main"

echo ""
echo "🔄  undoverse.in — pushing to GitHub..."
echo "    Target: $REPO_URL"
echo ""

# Init git if not already
if [ ! -d ".git" ]; then
  echo "📁  Initialising git repository..."
  git init
fi

# Set default branch to main
git checkout -b main 2>/dev/null || git checkout main

# Stage everything (respects .gitignore)
echo "📦  Staging all files..."
git add .

# Initial commit
echo "✍️   Creating initial commit..."
git commit -m "feat: initial scaffold — undoverse.in v0.1.0-alpha

- Next.js 14 App Router + Turborepo monorepo
- Tailwind CSS + shadcn/ui with Kerala-proud brand identity
- Prisma schema (users, projects, builders, upvotes, submissions, changelogs)
- Auth.js v5 GitHub OAuth
- Edge middleware for wildcard *.undoverse.in subdomain routing
- Seed fallback for currentundo, kuzhiundo, damundo
- Full SDLC documentation suite (SRS, System Design, Test Plan, UX Copy, Runbook)
- GitHub Actions CI/CD: dev → staging → production pipeline
- Vercel configuration with security headers
- CLAUDE.md working memory for future AI sessions

Built by 72BPM, Trivandrum, Kerala 🌴
Co-pilot: Claude (Anthropic)"

# Set remote
echo "🔗  Setting remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

# Push
echo "🚀  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅  Done! Your code is live at:"
echo "    https://github.com/Yadukrishnan117/undoverse"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Next steps:"
echo "  1. Create 'develop' and 'staging' branches"
echo "  2. Add GitHub Actions secrets (see CLAUDE.md)"
echo "  3. Connect Vercel to this repo"
echo "  4. Set up Neon PostgreSQL databases"
echo "  5. cp .env.example .env  →  fill in your values"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
