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
      { label: "GitHub", href: "https://github.com/72bpm" },
      { label: "Contact", href: "mailto:hello@undoverse.in" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-content grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <UndoMark size={26} />
            <span className="text-lg text-[var(--fg-strong)]">
              undo<span className="text-brand">verse</span>
            </span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            The home of the undo ecosystem. Discover what Kerala is shipping,
            back the builders, and add your own undo to the stack.
          </p>
        </div>

        {sections.map((s) => (
          <nav key={s.title} aria-label={s.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--fg-strong)]">
              {s.title}
            </h3>
            <ul className="space-y-2">
              {s.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--fg-strong)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-content flex flex-col gap-2 py-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} undoverse. Built by{" "}
            <a
              href="https://72bpm.com"
              className="text-[var(--fg-strong)] underline-offset-4 hover:underline"
            >
              72BPM
            </a>{" "}
            in Trivandrum, Kerala.
          </p>
          <p className="flex items-center gap-1.5">
            Made with stubborn pride <span aria-hidden>🌴</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
