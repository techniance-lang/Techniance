import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProblemWorkspace } from "@/components/problem-workspace";
import { getProblem, problemOfTheDay } from "@/content/problems";
import { requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { XP } from "@/lib/game/rules";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProblem((await params).slug);
  return { title: p?.title ?? "Problem" };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const problem = getProblem((await params).slug);
  if (!problem) notFound();
  const user = await requireUser();
  const db = await getDb();
  const subs = await db
    .select()
    .from(schema.submissions)
    .where(and(eq(schema.submissions.userId, user.id), eq(schema.submissions.problemSlug, problem.slug)))
    .orderBy(desc(schema.submissions.createdAt))
    .limit(30)
    .all();
  const potd = problemOfTheDay(new Date().toISOString().slice(0, 10)).slug === problem.slug;
  const { hidden, ...rest } = problem;

  return (
    <ProblemWorkspace
      problem={{ ...rest, hiddenCount: hidden.length }}
      hidden={hidden}
      initialSubmissions={subs.map(({ id, language, verdict, passed, total, runtimeMs, createdAt, code }) => ({ id, language, verdict, passed, total, runtimeMs, createdAt, code }))}
      solved={subs.some((s) => s.verdict === "accepted")}
      xp={XP.problem[problem.difficulty] + (potd ? XP.problemOfTheDayBonus : 0)}
      potd={potd}
    />
  );
}
