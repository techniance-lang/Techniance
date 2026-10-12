import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCourse } from "@/content/courses";
import { getCurrentUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { isValidTimezone } from "@/lib/game/dates";
import { DAILY_GOALS } from "@/lib/game/rules";
import { error, json, parse } from "@/lib/http";

const goals = DAILY_GOALS.map((g) => g.xp) as number[];

const Body = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  bio: z.string().trim().max(160).optional(),
  dailyGoal: z.number().int().refine((g) => goals.includes(g), "is not a valid goal").optional(),
  timezone: z.string().refine(isValidTimezone, "is not a valid timezone").optional(),
  currentCourse: z.string().refine((s) => !!getCourse(s), "is not a course").optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  onboarded: z.literal(true).optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const db = await getDb();
  if (Object.keys(parsed.data).length) {
    await db.update(schema.users).set(parsed.data).where(eq(schema.users.id, user.id));
  }
  return json({ ok: true });
}
