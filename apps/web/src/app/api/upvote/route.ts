import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST /api/upvote   body: { slug: string }
 *
 * Toggles the current user's upvote on a project. Upvotes are unique per
 * (project, user) at the schema level, so this is idempotent: a second call
 * from the same user removes their vote. Returns the fresh count.
 *
 * Requires sign-in — anonymous upvotes are how leaderboards get gamed.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error: "Sign in with GitHub to upvote — it keeps the rankings honest.",
        requiresAuth: true,
      },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  let slug: string;
  try {
    const body = await req.json();
    slug = String(body.slug ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Malformed request — which project are we upvoting?" },
      { status: 400 },
    );
  }
  if (!slug) {
    return NextResponse.json(
      { error: "A project slug is required." },
      { status: 422 },
    );
  }

  try {
    const project = await db.project.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json(
        { error: "That project doesn't exist (or hasn't launched yet)." },
        { status: 404 },
      );
    }

    const existing = await db.upvote.findUnique({
      where: { projectId_userId: { projectId: project.id, userId } },
      select: { id: true },
    });

    let voted: boolean;
    if (existing) {
      await db.upvote.delete({ where: { id: existing.id } });
      voted = false;
    } else {
      await db.upvote.create({
        data: { projectId: project.id, userId },
      });
      voted = true;
    }

    const upvotes = await db.upvote.count({
      where: { projectId: project.id },
    });

    return NextResponse.json({ ok: true, voted, upvotes });
  } catch {
    return NextResponse.json(
      { error: "Your vote didn't go through — please try once more." },
      { status: 500 },
    );
  }
}
