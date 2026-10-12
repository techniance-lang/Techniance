import "server-only";
import { sql } from "drizzle-orm";
import { getDb, schema } from "./db";

/**
 * Fixed-window rate limiter stored in the database, so it works across
 * serverless instances. Returns whether this hit is allowed.
 *
 *   const ok = await rateLimit(`login:${ip}`, 10, 15 * 60_000);
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfterSec: number }> {
  const db = await getDb();
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const rows = await db
    .insert(schema.rateLimits)
    .values({ key, windowStart, count: 1 })
    .onConflictDoUpdate({ target: [schema.rateLimits.key, schema.rateLimits.windowStart], set: { count: sql`${schema.rateLimits.count} + 1` } })
    .returning({ count: schema.rateLimits.count });
  // Opportunistic cleanup of old windows (cheap, indexed by primary key prefix).
  if (Math.random() < 0.02) {
    await db.delete(schema.rateLimits).where(sql`${schema.rateLimits.windowStart} < ${now - 24 * 60 * 60 * 1000}`);
  }
  const count = rows[0]?.count ?? 1;
  return { ok: count <= limit, retryAfterSec: Math.ceil((windowStart + windowMs - now) / 1000) };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
