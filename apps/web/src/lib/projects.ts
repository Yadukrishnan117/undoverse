import { db } from "@/lib/db";
import type { ProjectCardData, ProjectStatus } from "@/components/project-card";

/**
 * Project data access.
 *
 * In production these read from Neon via Prisma. But a brand-new clone with an
 * empty database should still render a believable site, so every reader falls
 * back to the curated seed below. That keeps `pnpm dev` honest on first run and
 * doubles as the canonical content for the three flagship undos.
 */

export type BuilderDetail = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: "BUILDER" | "MAINTAINER" | "CONTRIBUTOR";
  bio?: string | null;
};

export type ProjectDetail = ProjectCardData & {
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  buildersDetailed: BuilderDetail[];
  changelog: {
    title: string;
    description: string;
    version: string;
    date: string;
  }[];
};

const SEED: ProjectDetail[] = [
  {
    slug: "currentundo",
    name: "currentundo",
    subdomain: "currentundo",
    tagline: "Real-time Kerala power-cut tracker — know before the lights go.",
    description:
      "currentundo started as a WhatsApp group reacting to KSEB load-shedding and turned into a crowd-sourced, real-time outage map for all of Kerala. Report an outage in two taps, see live restoration ETAs, and get a ping before scheduled cuts hit your feeder. No login wall, no ads — just the one thing everyone keeps asking the group chat.",
    status: "ACTIVE",
    repoUrl: "https://github.com/72bpm/currentundo",
    demoUrl: "https://currentundo.undoverse.in",
    upvotes: 1284,
    stars: 412,
    builders: [
      { username: "anaghadev", displayName: "Anagha S", avatarUrl: null },
      { username: "rahulkv", displayName: "Rahul K V", avatarUrl: null },
    ],
    buildersDetailed: [
      {
        username: "anaghadev",
        displayName: "Anagha S",
        avatarUrl: null,
        role: "MAINTAINER",
        bio: "Maps + realtime nerd. Lives off filter coffee and websockets.",
      },
      {
        username: "rahulkv",
        displayName: "Rahul K V",
        avatarUrl: null,
        role: "BUILDER",
        bio: "Backend & infra. Got tired of guessing when the fan would stop.",
      },
    ],
    changelog: [
      {
        title: "Feeder-level ETAs",
        description:
          "Restoration estimates now resolve down to your exact KSEB feeder instead of the whole town.",
        version: "v2.3.0",
        date: "2026-05-28",
      },
      {
        title: "Offline-first reporting",
        description:
          "Report an outage even with no signal — it syncs the moment you're back online.",
        version: "v2.2.0",
        date: "2026-04-11",
      },
    ],
  },
  {
    slug: "kuzhiundo",
    name: "kuzhiundo",
    subdomain: "kuzhiundo",
    tagline: "Crowd-mapped potholes for Kerala roads — report, track, shame, fix.",
    description:
      "kuzhi means pit. kuzhiundo asks the only question that matters on a Kerala monsoon commute: is there a pit? Snap a pothole, drop a pin, and it lands on a public map that tags the responsible local body. Reports that get enough upvotes auto-generate a formal complaint draft. It's civic tech with a sense of humour and a real paper trail.",
    status: "ACTIVE",
    repoUrl: "https://github.com/72bpm/kuzhiundo",
    demoUrl: "https://kuzhiundo.undoverse.in",
    upvotes: 967,
    stars: 288,
    builders: [
      { username: "fathimaz", displayName: "Fathima Z", avatarUrl: null },
      { username: "joelpaul", displayName: "Joel Paul", avatarUrl: null },
    ],
    buildersDetailed: [
      {
        username: "fathimaz",
        displayName: "Fathima Z",
        avatarUrl: null,
        role: "MAINTAINER",
        bio: "Product + civic data. Believes a good map can embarrass a panchayat into action.",
      },
      {
        username: "joelpaul",
        displayName: "Joel Paul",
        avatarUrl: null,
        role: "CONTRIBUTOR",
        bio: "Frontend. Ships the pothole-cam in his spare time.",
      },
    ],
    changelog: [
      {
        title: "Auto-complaint drafts",
        description:
          "Hit 50 upvotes and kuzhiundo drafts a ready-to-file complaint to the local body.",
        version: "v1.5.0",
        date: "2026-06-02",
      },
    ],
  },
  {
    slug: "damundo",
    name: "damundo",
    subdomain: "damundo",
    tagline: "Live dam water-level & shutter alerts for Kerala's rivers.",
    description:
      "Built in the shadow of 2018. damundo pulls reservoir levels and shutter-opening notices for Kerala's major dams into one calm, legible dashboard, with proximity alerts for people living downstream. Currently in a focused beta with a handful of districts — accuracy over reach. The goal is simple: nobody downstream should learn about an open shutter from the water itself.",
    status: "UPCOMING",
    repoUrl: "https://github.com/72bpm/damundo",
    demoUrl: null,
    upvotes: 642,
    stars: 156,
    builders: [{ username: "rahulkv", displayName: "Rahul K V", avatarUrl: null }],
    buildersDetailed: [
      {
        username: "rahulkv",
        displayName: "Rahul K V",
        avatarUrl: null,
        role: "BUILDER",
        bio: "Backend & infra. Building damundo because alerts should beat the flood.",
      },
    ],
    changelog: [
      {
        title: "Private beta — Idukki & Pathanamthitta",
        description:
          "First two districts live for downstream alert testing with local volunteers.",
        version: "v0.4.0-beta",
        date: "2026-05-19",
      },
    ],
  },
];

function toCard(p: ProjectDetail): ProjectCardData {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    subdomain: p.subdomain,
    status: p.status,
    upvotes: p.upvotes,
    stars: p.stars,
    builders: p.builders,
  };
}

/** All projects as cards, newest/most-upvoted first. Falls back to seed. */
export async function getProjects(query?: string): Promise<ProjectCardData[]> {
  try {
    const rows = await db.project.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { tagline: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        builders: { include: { user: true } },
        _count: { select: { upvotes: true } },
      },
      orderBy: { upvotes: { _count: "desc" } },
    });

    if (rows.length === 0) throw new Error("empty");

    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      subdomain: r.subdomain,
      status: r.status as ProjectStatus,
      upvotes: r._count.upvotes,
      stars: null,
      builders: r.builders.map((b) => ({
        username: b.user.username,
        displayName: b.user.displayName,
        avatarUrl: b.user.avatarUrl,
      })),
    }));
  } catch {
    const q = query?.trim().toLowerCase();
    const list = q
      ? SEED.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q),
        )
      : SEED;
    return list.map(toCard);
  }
}

/** Single project detail by slug. Falls back to seed. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const fromSeed = SEED.find((p) => p.slug === slug) ?? null;
  try {
    const r = await db.project.findUnique({
      where: { slug },
      include: {
        builders: { include: { user: true } },
        changelogs: { orderBy: { createdAt: "desc" } },
        _count: { select: { upvotes: true } },
      },
    });
    if (!r) return fromSeed;
    return {
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      subdomain: r.subdomain,
      status: r.status as ProjectStatus,
      repoUrl: r.repoUrl,
      demoUrl: r.demoUrl,
      upvotes: r._count.upvotes,
      stars: null,
      builders: r.builders.map((b) => ({
        username: b.user.username,
        displayName: b.user.displayName,
        avatarUrl: b.user.avatarUrl,
      })),
      buildersDetailed: r.builders.map((b) => ({
        username: b.user.username,
        displayName: b.user.displayName,
        avatarUrl: b.user.avatarUrl,
        role: b.role as BuilderDetail["role"],
        bio: b.user.bio,
      })),
      changelog: r.changelogs.map((c) => ({
        title: c.title,
        description: c.description,
        version: c.version,
        date: c.createdAt.toISOString().slice(0, 10),
      })),
    };
  } catch {
    return fromSeed;
  }
}

export function allSeedSlugs() {
  return SEED.map((p) => p.slug);
}
