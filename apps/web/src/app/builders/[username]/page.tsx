import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getProjects } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";

type Params = { params: { username: string } };

/**
 * Builder profile. Tries the database first; if the user isn't there (fresh
 * clone, seed-only data) it reconstructs a profile from whichever seed projects
 * list this username as a builder. Either way the page renders something real.
 */
async function getBuilder(username: string) {
  // 1. Real user row, if it exists.
  try {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        projects: { include: { project: true } },
      },
    });
    if (user) {
      return {
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        upiId: user.upiId,
        walletAddr: user.walletAddr,
        joined: user.createdAt.toISOString().slice(0, 10),
        source: "db" as const,
      };
    }
  } catch {
    // fall through to seed reconstruction
  }

  // 2. Reconstruct from seed projects.
  const projects = await getProjects();
  for (const p of projects) {
    const match = p.builders.find((b) => b.username === username);
    if (match) {
      return {
        username: match.username,
        displayName: match.displayName,
        avatarUrl: match.avatarUrl,
        bio: null as string | null,
        upiId: null as string | null,
        walletAddr: null as string | null,
        joined: null as string | null,
        source: "seed" as const,
      };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const builder = await getBuilder(params.username);
  if (!builder) return { title: "Builder not found" };
  return {
    title: `${builder.displayName} (@${builder.username})`,
    description:
      builder.bio ?? `${builder.displayName} builds in the undo ecosystem.`,
  };
}

export default async function BuilderPage({ params }: Params) {
  const builder = await getBuilder(params.username);
  if (!builder) notFound();

  const all = await getProjects();
  const built = all.filter((p) =>
    p.builders.some((b) => b.username === builder.username),
  );

  return (
    <div className="container-content py-12">
      <Link
        href="/#projects"
        className="text-sm text-[var(--muted)] hover:text-[var(--fg-strong)]"
      >
        ← Back to the ecosystem
      </Link>

      <header className="mt-6 flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-center">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-2)] text-2xl font-bold text-[var(--muted)]">
          {builder.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={builder.avatarUrl}
              alt={builder.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            builder.displayName.slice(0, 2).toUpperCase()
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold">{builder.displayName}</h1>
          <p className="mt-1 font-mono text-sm text-accent">@{builder.username}</p>
          {builder.bio && (
            <p className="mt-3 max-w-xl leading-relaxed text-[var(--muted)]">
              {builder.bio}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <a
              href={`https://github.com/${builder.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[var(--fg-strong)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.5 18.3 4.8 18.3 4.8c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
              </svg>
              github.com/{builder.username}
            </a>
            {builder.joined && <span>· Joined {builder.joined}</span>}
          </div>
        </div>

        {/* Support — only show what the builder actually configured */}
        {(builder.upiId || builder.walletAddr) && (
          <aside className="rounded-lg border border-line bg-[var(--surface-2)] p-4 text-sm">
            <p className="font-semibold text-[var(--fg-strong)]">Back this builder</p>
            {builder.upiId && (
              <p className="mt-2 text-[var(--muted)]">
                UPI:{" "}
                <span className="font-mono text-[var(--fg-strong)]">
                  {builder.upiId}
                </span>
              </p>
            )}
            {builder.walletAddr && (
              <p className="mt-1 break-all text-[var(--muted)]">
                Wallet:{" "}
                <span className="font-mono text-xs text-[var(--fg-strong)]">
                  {builder.walletAddr}
                </span>
              </p>
            )}
          </aside>
        )}
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-bold">
          Projects {built.length > 0 && `(${built.length})`}
        </h2>
        {built.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            No projects on undoverse yet. Watch this space.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {built.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
