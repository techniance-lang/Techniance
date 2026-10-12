import { z } from "zod";
import { getLesson, isLessonUnlocked } from "@/content/courses";
import { getCurrentUser } from "@/lib/auth";
import { accessOf } from "@/lib/billing/access";
import { canAccessLevel } from "@/lib/billing/entitlements";
import { completedLessons, recordLesson } from "@/lib/game/engine";
import { error, json, parse } from "@/lib/http";

const Body = z.object({
  lessonId: z.string(),
  correct: z.number().int().min(0),
  attempts: z.number().int().min(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const { lessonId, correct, attempts } = parsed.data;

  const ref = getLesson(lessonId);
  if (!ref) return error("Unknown lesson", 404);
  if (!isLessonUnlocked(lessonId, await completedLessons(user.id))) return error("Lesson is locked", 403);
  if (!canAccessLevel(accessOf(user), ref.unit.level)) return error("This lesson requires Pro", 402);

  const accuracy = Math.round((Math.min(correct, attempts) / attempts) * 100);
  const reward = await recordLesson(user, lessonId, ref.course.slug, accuracy);
  return json({ reward, accuracy });
}
