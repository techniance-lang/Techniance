import { describe, expect, it } from "vitest";
import { freshDb, makeUser } from "@/test/db";

describe("migrations", () => {
  it("creates a usable schema from scratch", async () => {
    const db = await freshDb();
    const u = await makeUser({ username: "Ada" });
    expect(u.plan).toBe("free");
    expect(u.proUntil).toBe(0);
    expect(u.usernameLower).toBe("ada");
    const tables = await db.run("SELECT name FROM sqlite_master WHERE type = 'table'");
    const names = (tables.rows as unknown as { name: string }[]).map((r) => r.name);
    for (const t of ["users", "lesson_attempts", "solved_problems", "problem_stats", "certificates", "purchases", "stripe_events", "rate_limits", "password_resets"]) {
      expect(names).toContain(t);
    }
  });
});
