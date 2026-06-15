#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  undoverse.in — Local dev startup
#  Run: bash dev.sh
# ─────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

echo ""
echo "  🌴  undoverse.in — local dev"
echo ""

# 1. Check Node 18+
NODE_VERSION=$(node -v 2>/dev/null | cut -d. -f1 | tr -d 'v' || echo "0")
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌  Node 18+ required. Get it from https://nodejs.org"
  exit 1
fi
echo "✅  Node $(node -v)"

# 2. Install pnpm to ~/bin (no sudo needed)
PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$HOME/bin:$PATH"

if ! command -v pnpm &>/dev/null; then
  echo "📦  Installing pnpm to ~/bin (no sudo)..."
  npm install -g pnpm --prefix "$HOME/.npm-global" 2>/dev/null || \
  curl -fsSL https://get.pnpm.io/install.sh | PNPM_HOME="$HOME/.local/share/pnpm" sh -
  export PATH="$HOME/.npm-global/bin:$HOME/.local/share/pnpm:$PATH"
fi

# Verify pnpm
if ! command -v pnpm &>/dev/null; then
  echo ""
  echo "⚠️  pnpm not found in PATH. Run this first, then re-run dev.sh:"
  echo "    sudo npm install -g pnpm"
  exit 1
fi
echo "✅  pnpm $(pnpm -v)"

# 3. Install dependencies
echo "📦  Installing dependencies..."
pnpm install

# 4. Generate Prisma client
echo "🗄️   Generating Prisma client..."
pnpm db:generate 2>/dev/null || echo "  ↳ Skipped (no DB configured — seed data will be used)"

# 5. Start dev server
echo ""
echo "🚀  Starting → http://localhost:3000"
echo "    Press Ctrl+C to stop."
echo ""
pnpm dev
