import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AnimatedCounter } from "@/components/animated-counter";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

// ─────────────────────────────────────────────────────────────
//  Static ecosystem marquee labels
// ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "currentundo", "kuzhiundo", "damundo", "72BPM", "Trivandrum",
  "Kerala", "Ship it", "undoverse", "Open source", "Dev culture",
  "currentundo", "kuzhiundo", "damundo", "72BPM", "Trivandrum",
  "Kerala", "Ship it", "undoverse", "Open source", "Dev culture",
];

// ─────────────────────────────────────────────────────────────
//  Process steps
// ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse the live ecosystem. Every project has its own subdomain, changelog, and builders front and centre. No gatekeeping.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Back the builders",
    body: "Upvote what you love. Builders wire up UPI or a wallet so support flows straight to them — zero middleman, maximum signal.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Ship your undo",
    body: "Got a tiny site that fixes one real thing? Submit it. Fits the ethos? You get a subdomain, a builder profile, and a community.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22 11 13 2 9l20-7z" />
      </svg>
    ),
  },
];

// ─────────────────────────────────────────────────────────────
//  Features grid
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "Sub-domain routing",
    body: "Every project gets its own space — kuzhiundo.undoverse.in, damundo.undoverse.in. No redeploys needed.",
    icon: "🌐",
    accent: "#6366f1",
  },
  {
    title: "Builder profiles",
    body: "Proof-of-work portfolios. Show what you shipped, not what you studied.",
    icon: "👤",
    accent: "#22d3ee",
  },
  {
    title: "Micro-monetisation",
    body: "UPI, wallets, and tipping links baked into builder profiles. Support flows directly.",
    icon: "💰",
    accent: "#a78bfa",
  },
  {
    title: "Open source",
    body: "The platform is MIT-licensed. Build undoverse with us. Good First Issues always open.",
    icon: "⚡",
    accent: "#34d399",
  },
];

export default async function HomePage() {
  const projects = await getProjects();
  const totalUpvotes = projects.reduce((n, p) => n + p.upvotes, 0);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">

        {/* Mesh grid background */}
        <div className="absolute inset-0 mesh-bg opacity-60" aria-hidden />

        {/* Glowing orbs */}
        <div
          className="orb orb-brand animate-float-slow"
          style={{ width: "700px", height: "700px", top: "-200px", right: "-150px", opacity: 0.6 }}
          aria-hidden
        />
        <div
          className="orb orb-accent animate-float"
          style={{ width: "500px", height: "500px", bottom: "-100px", left: "-100px", opacity: 0.5, animationDelay: "2s" }}
          aria-hidden
        />
        <div
          className="orb orb-brand"
          style={{ width: "300px", height: "300px", top: "30%", left: "40%", opacity: 0.2 }}
          aria-hidden
        />

        {/* Hero content */}
        <div className="container-content relative z-10 pt-16 pb-20">
          {/* Badge */}
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <span className="badge">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ok)] animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ok)]" />
              </span>
              Live · Shipping from Trivandrum, Kerala
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mt-7 max-w-4xl text-5xl font-black leading-[1.04] tracking-[-0.03em] sm:text-7xl animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <span className="text-[var(--fg-strong)]">The universe where</span>
            <br />
            <span className="text-[var(--fg-strong)]">the internet gets</span>
            <br />
            <span className="gradient-text">its do-over.</span>
          </h1>

          {/* Subtext */}
          <p
            className="mt-7 max-w-2xl text-xl leading-relaxed text-[var(--muted)] animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            undoverse is the launchpad for the{" "}
            <em className="not-italic font-semibold text-[var(--fg-strong)]">undo</em> ecosystem
            — a family of sharp, opinionated websites built by Kerala developers who got tired of
            waiting for someone else to fix it.
          </p>

          {/* CTA buttons */}
          <div
            className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#projects"
              className="btn btn-primary text-[0.9375rem]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8l4 4-4 4" />
              </svg>
              Explore the ecosystem
            </a>
            <Link href="/submit" className="btn btn-ghost text-[0.9375rem]">
              Submit your project
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div
            className="mt-14 animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            <div
              className="inline-grid grid-cols-3 rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <HeroStat value={projects.length} label="Live projects" suffix="+" />
              <HeroStat value={totalUpvotes || 12} label="Upvotes" suffix="" />
              <HeroStatText value="Kerala" label="Built in" />

            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--surface))" }}
          aria-hidden
        />
      </section>

      {/* ══════════════════════════════════════════════════════
          MARQUEE TICKER
      ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y py-3.5 no-scrollbar" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, var(--surface), transparent)" }} aria-hidden />
        <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(270deg, var(--surface), transparent)" }} aria-hidden />
        <div className="flex animate-marquee gap-8 w-max">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted)" }}>
              <span className="h-1 w-1 rounded-full" style={{ background: i % 5 === 0 ? "var(--brand)" : i % 5 === 2 ? "var(--accent)" : "var(--muted)", opacity: 0.6 }} aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PROJECTS GRID
      ══════════════════════════════════════════════════════ */}
      <section id="projects" className="scroll-mt-20 relative">

        {/* Section orb */}
        <div
          className="orb orb-brand absolute"
          style={{ width: "400px", height: "400px", top: "0", left: "-100px", opacity: 0.15 }}
          aria-hidden
        />

        <div className="container-content py-20 relative z-10">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-2">
              <div>
                <p className="section-label mb-3">Ecosystem</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-[var(--fg-strong)]">
                  The undo universe
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)]">
                  Each one fixes a real, annoyingly-specific problem. Upvote the ones you&apos;d miss if they vanished.
                </p>
              </div>
              <Link
                href="/submit"
                className="btn btn-outline-brand py-2.5 px-4 text-sm shrink-0 self-start sm:self-auto"
              >
                + Add yours
              </Link>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ScrollReveal key={p.slug} delay={i * 80}>
                <ProjectCard project={p} index={i} />
              </ScrollReveal>
            ))}

            {/* "Your project here" placeholder card */}
            <ScrollReveal delay={projects.length * 80}>
              <Link
                href="/submit"
                className="group relative flex flex-col items-center justify-center rounded-2xl min-h-[180px] transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: "1px dashed rgba(99,102,241,0.2)",
                  background: "rgba(99,102,241,0.03)",
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-semibold" style={{ color: "#818cf8" }}>Submit your project</p>
                <p className="mt-1 text-xs text-center px-6" style={{ color: "var(--muted)" }}>Get a subdomain and join the ecosystem</p>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="scroll-mt-20 relative">
        <div className="divider-glow" aria-hidden />
        <div className="container-content py-20">
          <ScrollReveal>
            <p className="section-label mb-3">Process</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-[var(--fg-strong)]">
              Three moves. No pitch decks.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              undoverse is the shortest path from &ldquo;I built a thing&rdquo; to &ldquo;people are using it.&rdquo;
            </p>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.n} delay={i * 100}>
                <div
                  className="relative flex flex-col rounded-2xl p-6 transition-all duration-300 group hover:-translate-y-1"
                  style={{
                    background: "linear-gradient(145deg, rgba(13,26,45,0.8) 0%, rgba(7,16,31,0.9) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Step number */}
                  <span
                    className="font-mono text-xs font-bold tracking-widest mb-4"
                    style={{ color: "var(--brand-muted)" }}
                  >
                    {step.n}
                  </span>

                  {/* Icon */}
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#818cf8",
                    }}
                  >
                    {step.icon}
                  </div>

                  <h3 className="text-lg font-bold text-[var(--fg-strong)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>

                  {/* Hover accent line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)" }}
                    aria-hidden
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        <div className="divider-glow" aria-hidden />
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════════════════ */}
      <section className="relative">
        <div
          className="orb orb-accent absolute"
          style={{ width: "500px", height: "500px", top: "20%", right: "-150px", opacity: 0.12 }}
          aria-hidden
        />

        <div className="container-content py-20 relative z-10">
          <ScrollReveal>
            <p className="section-label mb-3">Platform</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-[var(--fg-strong)]">
              Built for the builder economy
            </h2>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 70}>
                <div
                  className="relative rounded-2xl p-6 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(145deg, rgba(13,26,45,0.8), rgba(7,16,31,0.9))",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="text-2xl mb-4 w-10 h-10 flex items-center justify-center rounded-xl"
                    style={{ background: `${f.accent}15`, border: `1px solid ${f.accent}25` }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-[var(--fg-strong)]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{f.body}</p>

                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 100% 0%, ${f.accent}12, transparent 70%)`,
                    }}
                    aria-hidden
                  />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LIVE STATS
      ══════════════════════════════════════════════════════ */}
      <section className="relative">
        <div className="divider-glow" aria-hidden />
        <div className="container-content py-16">
          <div className="grid grid-cols-2 gap-px md:grid-cols-4 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { value: projects.length, suffix: "", label: "Live projects", accent: "#6366f1" },
              { value: totalUpvotes || 12, suffix: "+", label: "Community upvotes", accent: "#22d3ee" },
              { value: 3, suffix: "", label: "Active builders", accent: "#a78bfa" },
              { value: 72, suffix: "BPM", label: "Studio", isText: true, accent: "#34d399" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center py-8 px-6 text-center"
                style={{ background: "rgba(13,26,45,0.6)" }}
              >
                <div
                  className="text-3xl font-black sm:text-4xl mb-1 font-mono"
                  style={{ color: stat.accent }}
                >
                  {stat.isText ? (
                    stat.value + stat.suffix
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  )}
                </div>
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="divider-glow" aria-hidden />
      </section>

      {/* ══════════════════════════════════════════════════════
          BUILDER CTA
      ══════════════════════════════════════════════════════ */}
      <section id="builders" className="scroll-mt-20">
        <div className="container-content py-20">
          <ScrollReveal>
            <div
              className="relative overflow-hidden rounded-3xl p-10 sm:p-14"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(13,26,45,0.9) 40%, rgba(34,211,238,0.07) 100%)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 0 80px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Background orbs inside card */}
              <div
                className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)" }}
                aria-hidden
              />
              <div
                className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)" }}
                aria-hidden
              />

              {/* Mesh bg inside card */}
              <div className="absolute inset-0 mesh-bg opacity-30" aria-hidden />

              <div className="relative z-10 max-w-2xl">
                <p className="section-label mb-4">For builders</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl text-[var(--fg-strong)]">
                  Built something that fixes{" "}
                  <span className="gradient-text-static">one real thing?</span>
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
                  You don&apos;t need a startup, a logo, or a runway. If you shipped a small site
                  that makes life measurably less annoying, it belongs here. Get a subdomain,
                  a builder profile, and a community that actually shows up.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/submit" className="btn btn-primary">
                    Submit a project
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </Link>
                  <a
                    href="https://github.com/undoverse-in"
                    className="btn btn-ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

function HeroStat({ value, label, suffix, last }: { value: number; label: string; suffix: string; last?: boolean }) {
  return (
    <div
      className="flex flex-col items-center px-6 py-4"
      style={!last ? { borderRight: "1px solid rgba(255,255,255,0.07)" } : undefined}
    >
      <div className="text-2xl font-black font-mono" style={{ color: "var(--fg-strong)" }}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {label}
      </p>
    </div>
  );
}

function HeroStatText({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-2xl font-black" style={{ color: "var(--fg-strong)" }}>
        {value}
      </div>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {label}
      </p>
    </div>
  );
}
