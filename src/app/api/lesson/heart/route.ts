import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { accessOf } from "@/lib/billing/access";
import { hasUnlimitedHearts } from "@/lib/billing/entitlements";
import { getDb, schema } from "@/lib/db";
import { MAX_HEARTS, regenHearts } from "@/lib/game/rules";
import { error, json } from "@/lib/http";

/** Spends one heart after a wrong answer in a lesson. */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return error("Not signed in", 401);
  if (hasUnlimitedHearts(accessOf(user))) return json({ hearts: user.hearts, unlimited: true });
  if (user.hearts <= 0) return json({ hearts: 0 });
  const db = await getDb();
  const now = Date.now();
  // Regeneration counts from when the user first dropped below full.
  const heartsUpdatedAt = user.hearts >= MAX_HEARTS ? now : user.heartsUpdatedAt;
  const hearts = user.hearts - 1;
  await db.update(schema.users).set({ hearts, heartsUpdatedAt }).where(eq(schema.users.id, user.id));
  return json({ hearts, nextAt: regenHearts(hearts, heartsUpdatedAt, now).nextAt });
}
