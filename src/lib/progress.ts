import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";

export async function lessonProgressFor(userId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.lessonProgress).where(eq(schema.lessonProgress.userId, userId)).all();
  return {
    rows,
    completed: new Set(rows.map((r) => r.lessonId)),
    perfect: new Set(rows.filter((r) => r.perfect).map((r) => r.lessonId)),
  };
}
