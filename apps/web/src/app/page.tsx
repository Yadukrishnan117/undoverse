import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export default async function HomePage() {
  const projects = await getProjects();
  const totalUpvotes = projects.reduce((n, p) => n + p.upvotes, 0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="container-content pb-16 pt-20 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--muted)] animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Shipping out of Trivandrum, Kerala
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl animate-fade-up">
            Where Kerala builds
            <br />
            <span className="bg-gradient-to-r from-brand via-brand-muted to-accent bg-clip-text text-transparent">
              the internet.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] animate-fade-up">
            undoverse is the home of the <em className="not-italic text-[var(--fg-strong)]">undo</em>{" "}
            ecosystem — a growing family of small, stubborn, useful websites built
            by people from God&apos;s own country who got tired of waiting for
            someone else to fix it. Discover what&apos;s being shipped, back the
            builders, and add your own undo to the stack.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up">
            <a href="#projects" className="btn btn-primary">
              Explore the ecosystem
            </a>
            <Link href="/submit" className="btn btn-ghost">
              Submit your project
            </Link>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8 animate-fade-up">
            <Stat label="Live undos" value={projects.length.toString()} />
            <Stat
              label="Community upvotes"
              value={totalUpvotes.toLocaleString("en-IN")}
            />
            <Stat label="Built by" value="72BPM" />
          </dl>
        </div>
      </section>

      {/* ── Projects grid ───────────────────────────────────── */}
      <section id="projects" className="scroll-mt-20">
        <div className="container-content py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">The undo ecosystem</h2>
              <p className="mt-2 max-w-xl text-[var(--muted)]">
                Each one solves a real, annoyingly-Kerala-specific problem. Tap a
                card to dig in, or upvote the ones you&apos;d miss if they vanished.
              </p>
            </div>
            <Link
              href="/submit"
              className="hidden whitespace-nowrap text-sm font-medium text-accent hover:underline sm:block"
            >
              Add yours →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="border-y border-line bg-[var(--surface-2)]/40">
        <div className="container-content py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">How undoverse works</h2>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            One hub, three moves. No gatekeeping, no pitch decks.
          </p>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            <Step
              n={1}
              title="Discover"
              body="Browse the live ecosystem. Every project has its own subdomain, changelog, and the people behind it — front and centre."
            />
            <Step
              n={2}
              title="Back the builders"
              body="Upvote what you love and follow the makers. Builders can wire up UPI or a wallet so support flows straight to them — no middleman."
            />
            <Step
              n={3}
              title="Ship your undo"
              body="Got a tiny site that fixes one real thing? Submit it. If it fits the ethos, it gets a subdomain and a place in the verse."
            />
          </ol>
        </div>
      </section>

      {/* ── Builder CTA ─────────────────────────────────────── */}
      <section id="builders" className="scroll-mt-20">
        <div className="container-content py-20">
          <div className="card relative overflow-hidden p-8 sm:p-12">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl"
              aria-hidden
            />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Built something that fixes one real thing?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
                You don&apos;t need a startup, a logo, or a runway. If you shipped a
                small site that makes life in Kerala measurably less annoying, it
                belongs here. Get a subdomain, a builder profile, and a community
                that actually shows up.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/submit" className="btn btn-accent">
                  Submit a project
                </Link>
                <a
                  href="https://github.com/72bpm"
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See us on GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold text-[var(--fg-strong)]">{value}</dd>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="card p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 font-mono text-sm font-bold text-brand">
        {n}
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </li>
  );
}
