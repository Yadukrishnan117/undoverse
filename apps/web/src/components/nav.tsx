import Link from "next/link";
import { SearchBar } from "@/components/search-bar";

/**
 * Top navigation. The logo is an inline "undo" arrow — no asset, no flash of
 * unstyled logo, scales crisply at any size.
 */
export function UndoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="undo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      {/* the reset / undo curl */}
      <path
        d="M9 9a10 10 0 1 1-2.4 6.5"
        stroke="url(#undo-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9 4v6h6"
        stroke="url(#undo-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-[var(--surface)]/80 backdrop-blur-md">
      <nav
        className="container-content flex h-16 items-center gap-4"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-[var(--fg-strong)]"
        >
          <UndoMark />
          <span className="text-lg">
            undo<span className="text-brand">verse</span>
          </span>
        </Link>

        <div className="ml-2 hidden flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/#projects"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg-strong)] sm:block"
          >
            Projects
          </Link>
          <Link
            href="/#builders"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg-strong)] sm:block"
          >
            Builders
          </Link>
          <Link href="/submit" className="btn btn-primary px-4 py-2 text-sm">
            Submit a project
          </Link>
        </div>
      </nav>
    </header>
  );
}
