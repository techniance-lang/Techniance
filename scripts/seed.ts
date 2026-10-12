// Seeds demo learners so leagues and leaderboards have company in local dev.
// Usage: npm run db:seed   (password for every demo account: demo1234)
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { COURSES, courseLessons } from "../src/content/courses";
import { addDays, dayKey, weekKey } from "../src/lib/game/dates";
import { MIGRATION } from "../src/lib/db/migration";

const url = process.env.DATABASE_URL ?? "file:./data/techniance.db";
if (url.startsWith("file:")) mkdirSync("data", { recursive: true });
const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

const NAMES = ["ada", "linus", "grace", "alan", "margaret", "dennis", "barbara", "ken", "radia", "guido", "brendan", "katherine", "tim", "frances"];
const COLORS = ["#7c5cff", "#ff6b6b", "#2ed47a", "#ffb020", "#3d8bff", "#ff5cc8", "#00c2c7", "#ff8a3d"];

async function main() {
  await db.executeMultiple(MIGRATION);
  const hash = await bcrypt.hash("demo1234", 10);
  const now = new Date();
  const today = dayKey(now, "UTC");
  const week = weekKey(now);
  let created = 0;

  for (const [i, name] of NAMES.entries()) {
    const username = `demo_${name}`;
    const exists = await db.execute({ sql: "select 1 from users where username = ?", args: [username] });
    if (exists.rows.length) continue;
    const id = randomUUID();
    const course = COURSES[i % COURSES.length];
    const lessons = courseLessons(course).slice(0, 1 + (i % 6));
    const streak = (i * 3) % 17;
    const events: [number, string, string][] = [];
    for (let d = 0; d < 28; d++) {
      const day = addDays(today, -d);
      const active = d < streak || Math.random() < 0.45;
      if (!active) continue;
      const xp = 10 + Math.floor(Math.random() * 5) * 10;
      events.push([xp, day, weekKey(new Date(`${day}T12:00:00Z`))]);
    }
    const total = events.reduce((s, e) => s + e[0], 0);

    await db.execute({
      sql: `insert into users (id, username, email, password_hash, display_name, avatar_color, bio, timezone, xp, gems, hearts, hearts_updated_at,
              streak, longest_streak, last_active_day, daily_goal, current_course, onboarded, created_at)
            values (?, ?, ?, ?, ?, ?, ?, 'UTC', ?, ?, 5, ?, ?, ?, ?, 20, ?, 1, ?)`,
      args: [id, username, `${username}@example.com`, hash, name[0].toUpperCase() + name.slice(1), COLORS[i % COLORS.length], "Demo learner", total, 150 + i * 20, Date.now(), streak, Math.max(streak, (i * 5) % 23), streak ? today : addDays(today, -3), course.slug, Date.now() - 30 * 864e5],
    });
    for (const [amount, day, wk] of events) {
      await db.execute({ sql: "insert into xp_events (user_id, amount, source, day, week, created_at) values (?, ?, 'lesson', ?, ?, ?)", args: [id, amount, day, wk, Date.parse(`${day}T12:00:00Z`)] });
    }
    for (const l of lessons) {
      await db.execute({ sql: "insert into lesson_progress (user_id, lesson_id, course_slug, best_accuracy, perfect, completed_at) values (?, ?, ?, 100, ?, ?)", args: [id, l.id, course.slug, Math.random() < 0.5 ? 1 : 0, Date.now()] });
    }
    if (events.some((e) => e[2] === week)) {
      await db.execute({ sql: "insert into league_memberships (user_id, week, tier) values (?, ?, 0)", args: [id, week] });
    }
    created++;
  }
  console.log(`Seeded ${created} demo learners (password: demo1234).`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});
