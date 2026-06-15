import Link from "next/link";

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
        <linearGradient id="undo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="undo-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Circular undo arc */}
      <path
        d="M9 9a10 10 0 1 1-2.4 6.5"
        stroke="url(#undo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#undo-glow)"
      />
      {/* Arrow head */}
      <path
        d="M9 4v6h6"
        stroke="url(#undo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#undo-glow)"
      />
    </svg>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-white/[0.06]" />

      <nav
        className="container-content relative flex h-16 items-center gap-4"
        aria-label="Primary"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight group"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <UndoMark />
          </div>
          <span className="text-[1.05rem] text-[var(--fg-strong)]">
            undo
            <span
              className="font-bold"
              style={{
                background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              verse
            </span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/#projects"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg-strong)] hover:bg-white/[0.04] transition-all sm:block"
          >
            Projects
          </Link>
          <Link
            href="/#builders"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg-strong)] hover:bg-white/[0.04] transition-all sm:block"
          >
            Builders
          </Link>
          <Link
            href="/#how-it-works"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg-strong)] hover:bg-white/[0.04] transition-all lg:block"
          >
            How it works
          </Link>

          <div className="ml-2 h-4 w-px bg-white/[0.08] hidden sm:block" />

          <Link
            href="/submit"
            className="ml-2 btn btn-primary py-2 px-4 text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Submit project
          </Link>
        </div>
      </nav>
    </header>
  );
}
