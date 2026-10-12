import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getProblem, problemOfTheDay } from "@/content/problems";
import { getCurrentUser } from "@/lib/auth";
import { accessOf } from "@/lib/billing/access";
import { canAccessProblem } from "@/lib/billing/entitlements";
import { getDb, schema } from "@/lib/db";
import { grantRewards } from "@/lib/game/engine";
import { XP } from "@/lib/game/rules";
import { error, json, parse } from "@/lib/http";

const Body = z.object({
  slug: z.string(),
  language: z.enum(["python", "javascript"]),
  code: z.string().max(100_000),
  verdict: z.enum(["accepted", "wrong_answer", "runtime_error", "time_limit"]),
  passed: z.number().int().min(0),
  total: z.number().int().min(1),
  runtimeMs: z.number().int().min(0).max(600_000),
});

/**
 * Records a judged submission. Code is executed in the learner's browser
 * (see public/workers), so this endpoint trusts the reported verdict; plug a
 * server-side judge in here for rated contests.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const body = parsed.data;

  const problem = getProblem(body.slug);
  if (!problem) return error("Unknown problem", 404);
  if (!canAccessProblem(accessOf(user), problem.difficulty)) return error("This problem requires Pro", 402);
  const expectedTotal = problem.samples.length + problem.hidden.length;
  if (body.total !== expectedTotal || body.passed > body.total) return error("Test count mismatch");
  if (body.verdict === "accepted" && body.passed !== body.total) return error("Inconsistent verdict");

  const db = await getDb();
  const alreadySolved = await db
    .select({ id: schema.submissions.id })
    .from(schema.submissions)
    .where(
      and(
        eq(schema.submissions.userId, user.id),
        eq(schema.submissions.problemSlug, problem.slug),
        eq(schema.submissions.verdict, "accepted"),
      ),
    )
    .get();

  const [submission] = await db
    .insert(schema.submissions)
    .values({ userId: user.id, problemSlug: problem.slug, ...body, createdAt: Date.now() })
    .returning();

  let reward = null;
  if (body.verdict === "accepted" && !alreadySolved) {
    const grants: { amount: number; source: string; refId: string }[] = [
      { amount: XP.problem[problem.difficulty], source: "problem", refId: problem.slug },
    ];
    if (problemOfTheDay(new Date().toISOString().slice(0, 10)).slug === problem.slug) {
      grants.push({ amount: XP.problemOfTheDayBonus, source: "daily", refId: problem.slug });
    }
    reward = await grantRewards(user, grants);
  }
  return json({ submission, reward, firstSolve: body.verdict === "accepted" && !alreadySolved });
}
