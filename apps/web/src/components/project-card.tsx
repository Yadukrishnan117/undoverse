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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  ACTIVE: {
    label: "Live",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    dot: "#34d399",
  },
  UPCOMING: {
    label: "Upcoming",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    dot: "#fbbf24",
  },
  ARCHIVED: {
    label: "Archived",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
    dot: "#64748b",
  },
};

function rootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "undoverse.in";
}

// Decorative icons per project — just geometric patterns
const CARD_PATTERNS = [
  // Hexagon-ish
  <svg key="0" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
    <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="rgba(99,102,241,0.06)" />
    <polygon points="20,10 28,15 28,25 20,30 12,25 12,15" stroke="rgba(34,211,238,0.3)" strokeWidth="1" fill="none" />
  </svg>,
  // Diamond
  <svg key="1" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
    <rect x="8" y="8" width="24" height="24" rx="2" transform="rotate(45 20 20)" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="rgba(99,102,241,0.06)" />
    <rect x="13" y="13" width="14" height="14" rx="1" transform="rotate(45 20 20)" stroke="rgba(34,211,238,0.3)" strokeWidth="1" fill="none" />
  </svg>,
  // Triangle stack
  <svg key="2" width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
    <polygon points="20,6 34,32 6,32" stroke="rgba(99,102,241,0.4)" strokeWidth="1.5" fill="rgba(99,102,241,0.06)" />
    <polygon points="20,14 28,28 12,28" stroke="rgba(34,211,238,0.3)" strokeWidth="1" fill="none" />
  </svg>,
];

export function ProjectCard({ project, index = 0 }: { project: ProjectCardData; index?: number }) {
  const status = STATUS_CONFIG[project.status];
  const [count, setCount] = useState(project.upvotes);
  const [voted, setVoted] = useState(false);
  const [pending, startTransition] = useTransition();
  const pattern = CARD_PATTERNS[index % CARD_PATTERNS.length];

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
        setVoted(voted);
        setCount(count);
      }
    });
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "linear-gradient(145deg, rgba(13,26,45,0.9) 0%, rgba(7,16,31,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(99,102,241,0.25)";
        el.style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2), 0 0 30px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.06)";
        el.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
      }}
    >
      {/* Invisible full-card link */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`Open ${project.name}`}
      />

      {/* Top section */}
      <div className="relative z-10 flex items-start justify-between gap-3 p-5 pb-0">
        {/* Pattern icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {pattern}
        </div>

        {/* Upvote button */}
        <button
          type="button"
          onClick={upvote}
          aria-pressed={voted}
          aria-label={`Upvote ${project.name}. Currently ${count} votes.`}
          className="relative z-10 shrink-0 flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200"
          style={{
            background: voted ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${voted ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: voted ? "#818cf8" : "var(--muted)",
            boxShadow: voted ? "0 0 16px rgba(99,102,241,0.2)" : "none",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" aria-hidden>
            <path d="M12 4l8 10H4l8-10z" />
          </svg>
          <span className="tabular-nums leading-none">{count}</span>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <div className="mt-2">
          <h3 className="text-base font-bold text-[var(--fg-strong)] leading-snug group-hover:text-white transition-colors">
            {project.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] line-clamp-2">
            {project.tagline}
          </p>
        </div>

        {/* Subdomain link */}
        <a
          href={`https://${project.subdomain}.${rootDomain()}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 mt-4 inline-flex items-center gap-1.5 font-mono text-xs transition-all"
          style={{ color: "var(--accent)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {project.subdomain}.undoverse.in ↗
        </a>

        {/* Footer row */}
        <div
          className="mt-4 flex items-center justify-between pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <BuilderStack builders={project.builders} />

          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ color: status.color, background: status.bg }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: status.dot }}
              aria-hidden
            />
            {status.label}
          </span>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99,102,241,0.03), transparent 40%)",
        }}
        aria-hidden
      />
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
            className="relative z-10 block h-7 w-7 overflow-hidden rounded-full bg-[var(--surface)]"
            style={{ border: "2px solid rgba(13,26,45,0.9)" }}
          >
            {b.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.avatarUrl} alt={b.displayName} className="h-full w-full object-cover" />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-[9px] font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))",
                  color: "var(--brand-muted)",
                }}
              >
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
        <span className="text-xs text-[var(--muted)]">72BPM</span>
      )}
    </div>
  );
}
