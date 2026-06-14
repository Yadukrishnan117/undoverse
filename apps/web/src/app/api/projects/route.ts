import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getProjects } from "@/lib/projects";

export const runtime = "nodejs";

/**
 * GET /api/projects?q=<term>&take=<n>
 * Lists projects (optionally filtered) as lightweight cards. Used by the global
 * search bar and any client that wants the live ecosystem list.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || undefined;
  const take = Math.min(Math.max(Number(searchParams.get("take") ?? 24), 1), 50);

  try {
    const projects = (await getProjects(q)).slice(0, take);
    return NextResponse.json(
      { projects, count: projects.length },
      { headers: { "cache-control": "public, max-age=30, s-maxage=60" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Couldn't load projects right now. Please retry shortly." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/projects
 * Creates a Submission (a *proposed* project pending human review). This is
 * what the /submit form posts to — we deliberately do NOT create a live Project
 * here; that happens when a maintainer approves the submission.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "We couldn't read that submission — was the form sent correctly?" },
      { status: 400 },
    );
  }

  const projectName = String(body.projectName ?? "").trim();
  const tagline = String(body.tagline ?? "").trim();
  const conceptUrl = String(body.conceptUrl ?? "").trim() || null;
  const repoUrl = String(body.repoUrl ?? "").trim() || null;

  // Server-side validation — never trust the client.
  if (!projectName)
    return NextResponse.json({ error: "A project name is required." }, { status: 422 });
  if (!tagline)
    return NextResponse.json(
      { error: "A one-line tagline is required." },
      { status: 422 },
    );
  if (tagline.length > 90)
    return NextResponse.json(
      { error: "Tagline must be 90 characters or fewer." },
      { status: 422 },
    );
  if (!conceptUrl && !repoUrl)
    return NextResponse.json(
      { error: "Include at least one link — a live demo or the repository." },
      { status: 422 },
    );

  const session = await auth();
  const submitterId = session?.user?.id ?? null;

  try {
    const submission = await db.submission.create({
      data: {
        projectName,
        tagline,
        conceptUrl,
        repoUrl,
        status: "PENDING",
        ...(submitterId ? { submitter: { connect: { id: submitterId } } } : {}),
      },
    });
    return NextResponse.json(
      {
        ok: true,
        id: submission.id,
        message: "Submission received. A human will review it soon.",
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn't save your submission. It's on us — try again in a moment.",
      },
      { status: 500 },
    );
  }
}
