/**
 * Versioned schema migrations, applied in order on first database use
 * (see ./index.ts). Never edit a migration that has shipped — add a new one.
 * Keep ./schema.ts (the typed Drizzle view of the tables) in sync.
 */
import type { Client } from "@libsql/client";

export interface Migration {
  id: number;
  name: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: "initial schema",
    // IF NOT EXISTS so databases created before versioned migrations adopt this cleanly.
    sql: `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  xp INTEGER NOT NULL DEFAULT 0,
  gems INTEGER NOT NULL DEFAULT 200,
  hearts INTEGER NOT NULL DEFAULT 5,
  hearts_updated_at INTEGER NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_day TEXT,
  streak_freezes INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 20,
  current_course TEXT,
  xp_boost_until INTEGER NOT NULL DEFAULT 0,
  league_tier INTEGER NOT NULL DEFAULT 0,
  onboarded INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  ref_id TEXT,
  day TEXT NOT NULL,
  week TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS xp_user_day ON xp_events(user_id, day);
CREATE INDEX IF NOT EXISTS xp_week ON xp_events(week, user_id);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  times_completed INTEGER NOT NULL DEFAULT 1,
  best_accuracy INTEGER NOT NULL DEFAULT 0,
  perfect INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  verdict TEXT NOT NULL,
  passed INTEGER NOT NULL,
  total INTEGER NOT NULL,
  runtime_ms INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sub_user_problem ON submissions(user_id, problem_slug);
CREATE TABLE IF NOT EXISTS achievements (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key)
);
CREATE TABLE IF NOT EXISTS quest_claims (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  quest_key TEXT NOT NULL,
  claimed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, day, quest_key)
);
CREATE TABLE IF NOT EXISTS league_memberships (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week TEXT NOT NULL,
  tier INTEGER NOT NULL,
  result TEXT,
  PRIMARY KEY (user_id, week)
);
CREATE INDEX IF NOT EXISTS league_week_tier ON league_memberships(week, tier);
CREATE TABLE IF NOT EXISTS freeze_days (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  PRIMARY KEY (user_id, day)
);
`,
  },
  {
    id: 2,
    name: "launch: billing, accounts, integrity, cohorts",
    sql: `
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT;
ALTER TABLE users ADD COLUMN subscription_interval TEXT;
ALTER TABLE users ADD COLUMN pro_until INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN cancel_at_period_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN accepted_terms_at INTEGER;
ALTER TABLE users ADD COLUMN email_reminders INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN last_reminder_day TEXT;
ALTER TABLE users ADD COLUMN pro_freeze_granted_at INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sub_problem_verdict ON submissions(problem_slug, verdict);
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE INDEX IF NOT EXISTS password_resets_user ON password_resets(user_id);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key, window_start)
);
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  item TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS purchases_user ON purchases(user_id);
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  issued_at INTEGER NOT NULL,
  UNIQUE (user_id, course_slug)
);
ALTER TABLE users ADD COLUMN username_lower TEXT;
UPDATE users SET username_lower = lower(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower ON users(username_lower);
CREATE INDEX IF NOT EXISTS users_xp ON users(xp DESC, username);
ALTER TABLE sessions ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sessions ADD COLUMN user_agent TEXT;
ALTER TABLE league_memberships ADD COLUMN cohort INTEGER NOT NULL DEFAULT 0;
ALTER TABLE league_memberships ADD COLUMN weekly_xp INTEGER NOT NULL DEFAULT 0;
UPDATE league_memberships SET weekly_xp = COALESCE((SELECT SUM(e.amount) FROM xp_events e WHERE e.user_id = league_memberships.user_id AND e.week = league_memberships.week), 0);
CREATE INDEX IF NOT EXISTS league_cohort ON league_memberships(week, tier, cohort, weekly_xp DESC);
CREATE TABLE IF NOT EXISTS lesson_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  practice INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER NOT NULL,
  answers TEXT NOT NULL DEFAULT '{}',
  attempts INTEGER NOT NULL DEFAULT 0,
  mistakes INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS lesson_attempts_user ON lesson_attempts(user_id, started_at);
CREATE TABLE IF NOT EXISTS solved_problems (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug TEXT NOT NULL,
  solved_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, problem_slug)
);
INSERT OR IGNORE INTO solved_problems (user_id, problem_slug, solved_at)
  SELECT user_id, problem_slug, MIN(created_at) FROM submissions WHERE verdict = 'accepted' GROUP BY user_id, problem_slug;
CREATE TABLE IF NOT EXISTS problem_stats (
  problem_slug TEXT PRIMARY KEY,
  total INTEGER NOT NULL DEFAULT 0,
  accepted INTEGER NOT NULL DEFAULT 0,
  solvers INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO problem_stats (problem_slug, total, accepted, solvers)
  SELECT problem_slug, COUNT(*), SUM(CASE WHEN verdict = 'accepted' THEN 1 ELSE 0 END), COUNT(DISTINCT CASE WHEN verdict = 'accepted' THEN user_id END)
  FROM submissions GROUP BY problem_slug;
`,
  },
];

/** Applies pending migrations, each in its own write transaction (safe under concurrent cold starts). */
export async function migrate(client: Client) {
  await client.execute("CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at INTEGER NOT NULL)");
  const applied = new Set((await client.execute("SELECT id FROM schema_migrations")).rows.map((r) => Number(r.id)));
  for (const m of MIGRATIONS) {
    if (applied.has(m.id)) continue;
    const tx = await client.transaction("write");
    try {
      // Another instance may have applied it while we waited for the write lock.
      const done = await tx.execute({ sql: "SELECT 1 FROM schema_migrations WHERE id = ?", args: [m.id] });
      if (!done.rows.length) {
        await tx.executeMultiple(m.sql);
        await tx.execute({ sql: "INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)", args: [m.id, m.name, Date.now()] });
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback().catch(() => {});
      throw new Error(`Migration ${m.id} (${m.name}) failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      tx.close();
    }
  }
}
