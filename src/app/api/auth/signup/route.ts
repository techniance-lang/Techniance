import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { AVATAR_COLORS, createSession, hashPassword, newUserId } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { isValidTimezone } from "@/lib/game/dates";
import { error, json, parse } from "@/lib/http";

const Body = z.object({
  username: z
    .string()
    .trim()
    .min(3, "must be at least 3 characters")
    .max(20, "must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "letters, numbers and _ only"),
  email: z.string().trim().toLowerCase().email("must be a valid email"),
  password: z.string().min(8, "must be at least 8 characters").max(200),
  timezone: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const { username, email, password, timezone } = parsed.data;
  const db = await getDb();

  const taken = await db
    .select({ username: schema.users.username, email: schema.users.email })
    .from(schema.users)
    .where(or(eq(schema.users.username, username), eq(schema.users.email, email)))
    .get();
  if (taken) {
    return error(taken.email === email ? "An account with that email already exists" : "That username is taken", 409);
  }

  const id = newUserId();
  await db.insert(schema.users).values({
    id,
    username,
    email,
    passwordHash: await hashPassword(password),
    displayName: username,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    timezone: timezone && isValidTimezone(timezone) ? timezone : "UTC",
    heartsUpdatedAt: Date.now(),
    createdAt: Date.now(),
  });
  await createSession(id);
  return json({ ok: true });
}
