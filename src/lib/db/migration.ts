// Tables are created on first connection so `npm run dev` works with zero setup.
// Keep in sync with ./schema.ts (drizzle-kit can also push the schema).
export const MIGRATION = `
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
`;
