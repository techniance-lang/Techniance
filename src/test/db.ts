import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDb } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { schema } from "@/lib/db";

/**
 * Points the app at a brand-new migrated SQLite file. Call in beforeEach for
 * isolation. (A file, not :memory:, because migrations use a write transaction
 * on a separate connection.)
 */
export async function freshDb() {
  const dir = mkdtempSync(join(tmpdir(), "techniance-test-"));
  process.env.DATABASE_URL = `file:${join(dir, "test.db")}`;
  (globalThis as unknown as { __db?: unknown }).__db = undefined;
  return getDb();
}

let n = 0;
/** Inserts a user with sensible defaults and returns the full row. */
export async function makeUser(overrides: Partial<User> = {}): Promise<User> {
  const db = await getDb();
  n++;
  const now = Date.now();
  const username = overrides.username ?? `user${n}_${Math.random().toString(36).slice(2, 7)}`;
  const [row] = await db
    .insert(schema.users)
    .values({
      id: overrides.id ?? `u-${n}-${Math.random().toString(36).slice(2)}`,
      username,
      usernameLower: username.toLowerCase(),
      email: overrides.email ?? `${username}@example.com`,
      passwordHash: "x",
      displayName: username,
      avatarColor: "#7c5cff",
      heartsUpdatedAt: now,
      createdAt: now,
      onboarded: true,
      ...overrides,
    })
    .returning();
  return row;
}
