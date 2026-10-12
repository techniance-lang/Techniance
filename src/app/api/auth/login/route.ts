import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { error, json, parse } from "@/lib/http";

const Body = z.object({
  identifier: z.string().trim().min(1, "is required"),
  password: z.string().min(1, "is required"),
});

export async function POST(req: Request) {
  const parsed = await parse(req, Body);
  if ("response" in parsed) return parsed.response;
  const { identifier, password } = parsed.data;
  const db = await getDb();
  const user = await db
    .select()
    .from(schema.users)
    .where(or(eq(schema.users.email, identifier.toLowerCase()), eq(schema.users.username, identifier)))
    .get();
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return error("Wrong username/email or password", 401);
  }
  await createSession(user.id);
  return json({ ok: true, onboarded: user.onboarded });
}
