"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Global search. Keeps it honest: a controlled input that filters the live
 * project list via the /api/projects?q= endpoint, with keyboard support
 * (Cmd/Ctrl-K to focus, Esc to clear) and a real loading + empty state.
 */
type Hit = {
  slug: string;
  name: string;
  tagline: string;
  status: string;
};

export function SearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cmd/Ctrl-K focuses the search box from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced fetch as the user types.
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setHits([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/projects?q=${encodeURIComponent(term)}&take=6`,
          { headers: { accept: "application/json" } },
        );
        const data = await res.json();
        setHits(Array.isArray(data.projects) ? data.projects : []);
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  function go(slug: string) {
    setOpen(false);
    setQ("");
    router.push(`/projects/${slug}`);
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="Search the undoverse…"
          aria-label="Search projects"
          aria-expanded={open}
          aria-controls="search-results"
          role="combobox"
          autoComplete="off"
          className="input pl-10 pr-14"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-[var(--muted)] sm:block">
          ⌘K
        </kbd>
      </div>

      {open && (
        <ul
          id="search-results"
          role="listbox"
          className="card absolute z-50 mt-2 w-full overflow-hidden p-1.5 shadow-card"
        >
          {loading && (
            <li className="px-3 py-3 text-sm text-[var(--muted)]">
              Searching…
            </li>
          )}
          {!loading && hits.length === 0 && (
            <li className="px-3 py-3 text-sm text-[var(--muted)]">
              No undos match “{q.trim()}”. Maybe you should build it?
            </li>
          )}
          {!loading &&
            hits.map((h) => (
              <li key={h.slug} role="option" aria-selected="false">
                <button
                  type="button"
                  onClick={() => go(h.slug)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-[var(--surface)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--fg-strong)]">
                      {h.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--muted)]">
                      {h.tagline}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {h.slug}.undoverse.in
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
