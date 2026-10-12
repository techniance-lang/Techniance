import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { MAX_HEARTS, MAX_STREAK_FREEZES, SHOP } from "@/lib/game/rules";
import { error, json, parse } from "@/lib/http";

const Body = z.object({ item: z.enum(["streakFreeze", "heartRefill", "xpBoost"]) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const { item } = parsed.data;
  const { price } = SHOP[item];
  if (user.gems < price) return error("Not enough gems");

  const now = Date.now();
  const patch: Partial<typeof schema.users.$inferInsert> = { gems: user.gems - price };
  if (item === "streakFreeze") {
    if (user.streakFreezes >= MAX_STREAK_FREEZES) return error(`You can hold at most ${MAX_STREAK_FREEZES} streak freezes`);
    patch.streakFreezes = user.streakFreezes + 1;
  } else if (item === "heartRefill") {
    if (user.hearts >= MAX_HEARTS) return error("Your hearts are already full");
    patch.hearts = MAX_HEARTS;
    patch.heartsUpdatedAt = now;
  } else {
    patch.xpBoostUntil = Math.max(now, user.xpBoostUntil) + SHOP.xpBoost.durationMs;
  }
  const db = await getDb();
  await db.update(schema.users).set(patch).where(eq(schema.users.id, user.id));
  return json({ ok: true, user: { gems: patch.gems, streakFreezes: patch.streakFreezes ?? user.streakFreezes, hearts: patch.hearts ?? user.hearts, xpBoostUntil: patch.xpBoostUntil ?? user.xpBoostUntil } });
}
