import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware — subdomain routing for *.undoverse.in.
 *
 *   kuzhiundo.undoverse.in        →  /projects/kuzhiundo
 *   currentundo.undoverse.in      →  /projects/currentundo
 *   undoverse.in / www / api / _next  →  passthrough
 *
 * Strictly Edge-compatible: no Node APIs, no DB access. We only read the
 * Host header, work out the subdomain, and rewrite the path.
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "undoverse.in";

// Subdomains that should NOT be treated as a project slug.
const RESERVED = new Set(["www", "app", "api", "admin", "assets", "cdn", "vercel"]);

// Only allow slugs that are purely lowercase alphanumeric + hyphens, 2-40 chars.
// Prevents path-traversal (e.g. "../etc") and injection via the Host header.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$|^[a-z0-9]{2,40}$/;

function getSubdomain(host: string): string | null {
  // Strip the port (local dev: kuzhiundo.undoverse.localhost:3000)
  const hostname = host.split(":")[0].toLowerCase();

  // Support both the real domain and `*.undoverse.localhost` in dev.
  const bases = [ROOT_DOMAIN, "undoverse.localhost", "localhost"];

  for (const base of bases) {
    if (hostname === base) return null; // apex — no subdomain
    if (hostname.endsWith(`.${base}`)) {
      const sub = hostname.slice(0, -1 * (base.length + 1));
      // Guard against multi-level like a.b.undoverse.in — take the left-most label.
      return sub.split(".")[0] || null;
    }
  }

  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Never touch framework/internal paths.
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path === "/favicon.ico" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    /\.[a-z0-9]+$/i.test(path) // any file with an extension
  ) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") ?? "";
  const subdomain = getSubdomain(host);

  // Apex domain or reserved subdomain → serve the app normally.
  if (!subdomain || RESERVED.has(subdomain)) {
    return NextResponse.next();
  }

  // Validate the slug before rewriting — block malformed / injection attempts.
  if (!SLUG_RE.test(subdomain)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // A project subdomain. Rewrite to its detail page, preserving any deeper path.
  // kuzhiundo.undoverse.in/changelog → /projects/kuzhiundo/changelog
  const rewritten = url.clone();
  const suffix = path === "/" ? "" : path;
  rewritten.pathname = `/projects/${subdomain}${suffix}`;

  const res = NextResponse.rewrite(rewritten);
  // Let downstream RSCs know which tenant we resolved.
  res.headers.set("x-undoverse-subdomain", subdomain);
  return res;
}

export const config = {
  // Run on everything except Next internals & static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
