"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

export type ProjectStatus = "ACTIVE" | "UPCOMING" | "ARCHIVED";

export type BuilderPreview = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ProjectCardData = {
  slug: string;
  name: string;
  tagline: string;
  subdomain: string;
  status: ProjectStatus;
  upvotes: number;
  stars?: number | null;
  builders: BuilderPreview[];
};

const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; dot: string; text: string }
> = {
  ACTIVE: { label: "Active", dot: "var(--ok)", text: "var(--ok)" },
  UPCOMING: { label: "Upcoming", dot: "var(--warn)", text: "var(--warn)" },
  ARCHIVED: { label: "Archived", dot: "var(--off)", text: "var(--off)" },
};

function rootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "undoverse.in";
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const status = STATUS_STYLES[project.status];
  // Optimistic upvote state — feels instant, reconciles with the server.
  const [count, setCount] = useState(project.upvotes);
  const [voted, setVoted] = useState(false);
  const [pending, startTransition] = useTransition();

  function upvote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const next = voted ? count - 1 : count + 1;
    setVoted(!voted);
    setCount(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/upvote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug: project.slug }),
        });
        if (!res.ok) throw new Error("vote failed");
        const data = await res.json();
        if (typeof data.upvotes === "number") setCount(data.upvotes);
        if (typeof data.voted === "boolean") setVoted(data.voted);
      } catch {
        // roll back on failure
        setVoted(voted);
        setCount(count);
      }
    });
  }

  return (
    <article className="card group relative flex flex-col p-5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-glow">
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`Open ${project.name}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-[var(--fg-strong)]">
            {project.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            {project.tagline}
          </p>
        </div>

        <button
          type="button"
          onClick={upvote}
          aria-pressed={voted}
          aria-label={`Upvote ${project.name}. Currently ${count} votes.`}
          className={`relative z-10 flex shrink-0 flex-col items-center rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            voted
              ? "border-brand bg-brand/15 text-brand"
              : "border-line text-[var(--muted)] hover:border-brand-muted hover:text-[var(--fg-strong)]"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5l7 8H5l7-8z"
              fill={voted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span className="mt-0.5 tabular-nums">{count}</span>
        </button>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between">
        <a
          href={`https://${project.subdomain}.${rootDomain()}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-xs text-accent hover:underline"
        >
          {project.subdomain}.{rootDomain()} ↗
        </a>

        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: status.text }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: status.dot }}
            aria-hidden
          />
          {status.label}
        </span>
      </div>

      <div className="relative z-10 mt-4 flex items-center justify-between border-t border-line pt-4">
        <BuilderStack builders={project.builders} />
        {typeof project.stars === "number" && (
          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.8 5.9 20.4l1.5-6.8L2.2 9l6.9-.7L12 2z" />
            </svg>
            <span className="tabular-nums">{project.stars.toLocaleString("en-IN")}</span>
          </span>
        )}
      </div>
    </article>
  );
}

function BuilderStack({ builders }: { builders: BuilderPreview[] }) {
  const shown = builders.slice(0, 4);
  const extra = builders.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((b) => (
          <Link
            key={b.username}
            href={`/builders/${b.username}`}
            onClick={(e) => e.stopPropagation()}
            title={b.displayName}
            className="relative z-10 block h-7 w-7 overflow-hidden rounded-full border-2 border-[var(--surface-2)] bg-[var(--surface)]"
          >
            {b.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.avatarUrl}
                alt={b.displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[var(--muted)]">
                {b.displayName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </Link>
        ))}
      </div>
      {extra > 0 && (
        <span className="ml-2 text-xs text-[var(--muted)]">+{extra}</span>
      )}
      {builders.length === 0 && (
        <span className="text-xs text-[var(--muted)]">No builders yet</span>
      )}
    </div>
  );
}
