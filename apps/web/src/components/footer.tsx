import Link from "next/link";
import { UndoMark } from "@/components/nav";

const sections = [
  {
    title: "Explore",
    links: [
      { label: "All projects", href: "/#projects" },
      { label: "Builders", href: "/#builders" },
      { label: "Submit yours", href: "/submit" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "currentundo", href: "/projects/currentundo" },
      { label: "kuzhiundo", href: "/projects/kuzhiundo" },
      { label: "damundo", href: "/projects/damundo" },
    ],
  },
  {
    title: "72BPM",
    links: [
      { label: "About", href: "https://72bpm.com" },
      { label: "GitHub", href: "https://github.com/undoverse-in" },
      { label: "Contact", href: "mailto:hello@undoverse.in" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-8">
      {/* Top divider glow */}
      <div className="divider-glow" aria-hidden />

      <div
        className="relative"
        style={{ background: "linear-gradient(180deg, rgba(13,26,45,0.5) 0%, var(--surface) 100%)" }}
      >
        <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-semibold group">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-brand/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <UndoMark size={24} />
              </div>
              <span className="text-base text-[var(--fg-strong)]">
                undo
                <span
                  style={{
                    background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 700,
                  }}
                >
                  verse
                </span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              The home of the undo ecosystem. Discover what Kerala is shipping,
              back the builders, and add your own undo to the stack.
            </p>
            {/* Social links */}
            <div className="flex gap-2 pt-1">
              <a
                href="https://github.com/undoverse-in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/[0.06] hover:scale-110"
                style={{ border: "1px solid rgba(255,255,255,0.07)", color: "var(--muted)" }}
                aria-label="GitHub"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:hello@undoverse.in"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/[0.06] hover:scale-110"
                style={{ border: "1px solid rgba(255,255,255,0.07)", color: "var(--muted)" }}
                aria-label="Email"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {sections.map((s) => (
            <nav key={s.title} aria-label={s.title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--brand-muted)" }}>
                {s.title}
              </h3>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--muted)] transition-all hover:text-[var(--fg-strong)] hover:translate-x-0.5 inline-block"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="container-content flex flex-col gap-2 py-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {year} undoverse. Built by{" "}
              <a
                href="https://72bpm.com"
                className="font-medium text-[var(--fg-strong)] underline-offset-3 hover:underline transition-colors"
              >
                72BPM
              </a>{" "}
              in Trivandrum, Kerala.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--ok)" }}
                  aria-hidden
                />
                All systems live
              </span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
