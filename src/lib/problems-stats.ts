import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "./db";

const { submissions } = schema;

/** Per-problem acceptance and solver counts across all users. */
export async function problemStats() {
  const db = await getDb();
  const rows = await db
    .select({
      slug: submissions.problemSlug,
      total: sql<number>`count(*)`,
      accepted: sql<number>`sum(case when ${submissions.verdict} = 'accepted' then 1 else 0 end)`,
      solvers: sql<number>`count(distinct case when ${submissions.verdict} = 'accepted' then ${submissions.userId} end)`,
    })
    .from(submissions)
    .groupBy(submissions.problemSlug)
    .all();
  return new Map(rows.map((r) => [r.slug, { total: Number(r.total), accepted: Number(r.accepted), solvers: Number(r.solvers) }]));
}

export async function userProblemStatus(userId: string) {
  const db = await getDb();
  const rows = await db
    .select({
      slug: submissions.problemSlug,
      solved: sql<number>`max(case when ${submissions.verdict} = 'accepted' then 1 else 0 end)`,
    })
    .from(submissions)
    .where(eq(submissions.userId, userId))
    .groupBy(submissions.problemSlug)
    .all();
  return new Map(rows.map((r) => [r.slug, Number(r.solved) ? ("solved" as const) : ("attempted" as const)]));
}
