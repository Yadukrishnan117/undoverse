import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Lightweight liveness probe used by smoke tests and uptime monitors.
 * Does NOT touch the database — DB failure is a readiness concern, not liveness.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      version: process.env.npm_package_version ?? "0.1.0",
      env: process.env.VERCEL_ENV ?? "development",
    },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}
