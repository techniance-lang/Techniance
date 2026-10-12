import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, schema } from "./db";
import type { User } from "./db/schema";
import { refreshUser } from "./game/engine";

const COOKIE = "techniance_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const AVATAR_COLORS = ["#7c5cff", "#ff6b6b", "#2ed47a", "#ffb020", "#3d8bff", "#ff5cc8", "#00c2c7", "#ff8a3d"];

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  }
  jar.delete(COOKIE);
}

/** The signed-in user (with hearts/leagues/streak refreshed), or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const row = await db
    .select({ user: schema.users, expiresAt: schema.sessions.expiresAt })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(eq(schema.sessions.id, hashToken(token)))
    .get();
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
    return null;
  }
  return refreshUser(row.user);
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function newUserId() {
  return randomUUID();
}
