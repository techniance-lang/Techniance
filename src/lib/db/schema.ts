import { integer, primaryKey, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarColor: text("avatar_color").notNull(),
  bio: text("bio").notNull().default(""),
  timezone: text("timezone").notNull().default("UTC"),
  xp: integer("xp").notNull().default(0),
  gems: integer("gems").notNull().default(200),
  hearts: integer("hearts").notNull().default(5),
  heartsUpdatedAt: integer("hearts_updated_at").notNull(),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDay: text("last_active_day"),
  streakFreezes: integer("streak_freezes").notNull().default(0),
  dailyGoal: integer("daily_goal").notNull().default(20),
  currentCourse: text("current_course"),
  xpBoostUntil: integer("xp_boost_until").notNull().default(0),
  leagueTier: integer("league_tier").notNull().default(0),
  onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
  // Billing (migration 2). Entitlement is derived from proUntil (see lib/billing/entitlements.ts).
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status"),
  subscriptionInterval: text("subscription_interval"),
  proUntil: integer("pro_until").notNull().default(0),
  cancelAtPeriodEnd: integer("cancel_at_period_end", { mode: "boolean" }).notNull().default(false),
  acceptedTermsAt: integer("accepted_terms_at"),
  emailReminders: integer("email_reminders", { mode: "boolean" }).notNull().default(true),
  lastReminderDay: text("last_reminder_day"),
  proFreezeGrantedAt: integer("pro_freeze_granted_at").notNull().default(0),
  /** lower(username); unique — usernames are case-insensitive. */
  usernameLower: text("username_lower"),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull().default(0),
  userAgent: text("user_agent"),
});

/** Every XP grant. Powers daily goal, heatmap, weekly leagues and quests. */
export const xpEvents = sqliteTable(
  "xp_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    source: text("source").notNull(), // lesson | practice | problem | daily | quest | achievement
    refId: text("ref_id"),
    day: text("day").notNull(), // YYYY-MM-DD in the user's timezone
    week: text("week").notNull(), // league week key (Monday, UTC)
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("xp_user_day").on(t.userId, t.day), index("xp_week").on(t.week, t.userId)],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    courseSlug: text("course_slug").notNull(),
    timesCompleted: integer("times_completed").notNull().default(1),
    bestAccuracy: integer("best_accuracy").notNull().default(0),
    perfect: integer("perfect", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completed_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemSlug: text("problem_slug").notNull(),
    language: text("language").notNull(),
    code: text("code").notNull(),
    verdict: text("verdict").notNull(), // accepted | wrong_answer | runtime_error | time_limit
    passed: integer("passed").notNull(),
    total: integer("total").notNull(),
    runtimeMs: integer("runtime_ms").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("sub_user_problem").on(t.userId, t.problemSlug)],
);

export const achievements = sqliteTable(
  "achievements",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    unlockedAt: integer("unlocked_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

export const questClaims = sqliteTable(
  "quest_claims",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    questKey: text("quest_key").notNull(),
    claimedAt: integer("claimed_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day, t.questKey] })],
);

/** Which league tier a user competed in for a given week. */
export const leagueMemberships = sqliteTable(
  "league_memberships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    week: text("week").notNull(),
    tier: integer("tier").notNull(),
    result: text("result"), // promoted | demoted | stayed (filled on rollover)
    /** Leagues are split into cohorts of up to 30 learners per (week, tier). */
    cohort: integer("cohort").notNull().default(0),
    weeklyXp: integer("weekly_xp").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.week] }), index("league_week_tier").on(t.week, t.tier)],
);

/** Days a streak freeze was spent, so the calendar can show them. */
export const freezeDays = sqliteTable(
  "freeze_days",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(), // sha256 of the emailed token
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  usedAt: integer("used_at"),
});

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull(),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] })],
);

/** Processed Stripe webhook event ids, for idempotency. */
export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  createdAt: integer("created_at").notNull(),
});

/** One-time purchases (gem packs). id = Stripe Checkout Session id. */
export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  item: text("item").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseSlug: text("course_slug").notNull(),
  issuedAt: integer("issued_at").notNull(),
});

/** Server-graded lesson run. answers: JSON {stepIndex: {correct: boolean, tries: number}}. */
export const lessonAttempts = sqliteTable(
  "lesson_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    practice: integer("practice", { mode: "boolean" }).notNull().default(false),
    startedAt: integer("started_at").notNull(),
    answers: text("answers").notNull().default("{}"),
    attempts: integer("attempts").notNull().default(0),
    mistakes: integer("mistakes").notNull().default(0),
    completedAt: integer("completed_at"),
  },
  (t) => [index("lesson_attempts_user").on(t.userId, t.startedAt)],
);

/** First accepted solve per user and problem — the idempotency key for problem rewards. */
export const solvedProblems = sqliteTable(
  "solved_problems",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemSlug: text("problem_slug").notNull(),
    solvedAt: integer("solved_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.problemSlug] })],
);

/** Per-problem counters, updated with each submission (avoids scanning submissions). */
export const problemStats = sqliteTable("problem_stats", {
  problemSlug: text("problem_slug").primaryKey(),
  total: integer("total").notNull().default(0),
  accepted: integer("accepted").notNull().default(0),
  solvers: integer("solvers").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
