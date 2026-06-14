import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, allSeedSlugs } from "@/lib/projects";

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  return allSeedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.name,
    description: project.tagline,
    openGraph: { title: project.name, description: project.tagline },
  };
}

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "undoverse.in";

const STATUS_COPY: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "var(--ok)" },
  UPCOMING: { label: "Upcoming", color: "var(--warn)" },
  ARCHIVED: { label: "Archived", color: "var(--off)" },
};

export default async function ProjectPage({ params }: Params) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  const status = STATUS_COPY[project.status];

  return (
    <article className="container-content py-12">
      <Link
        href="/#projects"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg-strong)]"
      >
        ← Back to the ecosystem
      </Link>

      {/* Header */}
      <header className="mt-6 flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{project.name}</h1>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: status.color, color: status.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: status.color }}
                aria-hidden
              />
              {status.label}
            </span>
          </div>
          <p className="mt-3 text-lg text-[var(--muted)]">{project.tagline}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open {project.subdomain}.{ROOT} ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                View source ↗
              </a>
            )}
          </div>
        </div>

        <aside className="flex shrink-0 gap-6 rounded-lg border border-line bg-[var(--surface-2)] px-6 py-4">
          <Metric label="Upvotes" value={project.upvotes.toLocaleString("en-IN")} />
          {typeof project.stars === "number" && (
            <Metric label="Stars" value={project.stars.toLocaleString("en-IN")} />
          )}
          <Metric label="Builders" value={project.buildersDetailed.length.toString()} />
        </aside>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold">About</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-[var(--fg)]">
              {project.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold">Changelog</h2>
            {project.changelog.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                No releases logged yet — this one&apos;s fresh out of the oven.
              </p>
            ) : (
              <ol className="mt-5 space-y-5 border-l border-line pl-6">
                {project.changelog.map((c) => (
                  <li key={c.version} className="relative">
                    <span
                      className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand"
                      aria-hidden
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-accent">{c.version}</span>
                      <span className="text-xs text-[var(--muted)]">{c.date}</span>
                    </div>
                    <h3 className="mt-1 font-semibold text-[var(--fg-strong)]">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      {c.description}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Builders sidebar */}
        <aside>
          <h2 className="text-xl font-bold">The builders</h2>
          <ul className="mt-5 space-y-4">
            {project.buildersDetailed.map((b) => (
              <li key={b.username}>
                <Link
                  href={`/builders/${b.username}`}
                  className="card flex gap-3 p-4 transition-colors hover:border-brand-muted"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface)] text-sm font-bold text-[var(--muted)]">
                    {b.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.avatarUrl}
                        alt={b.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      b.displayName.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-[var(--fg-strong)]">
                      {b.displayName}
                    </span>
                    <span className="block text-xs uppercase tracking-wide text-brand">
                      {b.role.toLowerCase()}
                    </span>
                    {b.bio && (
                      <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
                        {b.bio}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold tabular-nums text-[var(--fg-strong)]">
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}
