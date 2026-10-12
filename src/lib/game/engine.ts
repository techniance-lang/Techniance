import "server-only";
import { and, count, desc, eq, inArray, isNull, lt, sql, sum } from "drizzle-orm";
import { COURSES, courseLessons } from "@/content/courses";
import { PROBLEMS } from "@/content/problems";
import { getDb, schema } from "../db";
import type { User } from "../db/schema";
import { ACHIEVEMENTS, type AchievementDef, type Stats } from "./achievements";
import { addDays, dayKey, daysBetween, weekKey } from "./dates";
import { questProgress, questsForDay, type DayActivity, type QuestDef } from "./quests";
import { GEMS, XP, levelInfo, leagueOutcome, regenHearts } from "./rules";

const { users, xpEvents, lessonProgress, submissions, achievements, questClaims, leagueMemberships, freezeDays } = schema;

export const todayFor = (user: Pick<User, "timezone">, now = new Date()) => dayKey(now, user.timezone);

// ---------------------------------------------------------------- refresh

/**
 * Brings time-based state up to date: heart regeneration, streak freezes or
 * breaks for missed days, and league promotion/demotion when a week has ended.
 */
export async function refreshUser(user: User): Promise<User> {
  const db = await getDb();
  const now = Date.now();
  const patch: Partial<User> = {};

  const h = regenHearts(user.hearts, user.heartsUpdatedAt, now);
  if (h.hearts !== user.hearts || h.updatedAt !== user.heartsUpdatedAt) {
    patch.hearts = h.hearts;
    patch.heartsUpdatedAt = h.updatedAt;
  }

  // Streak: spend freezes on missed days, or reset if there aren't enough.
  const today = todayFor(user);
  if (user.lastActiveDay && user.streak > 0) {
    const gap = daysBetween(user.lastActiveDay, today);
    if (gap >= 2) {
      const missed = gap - 1;
      if (user.streakFreezes >= missed) {
        const days = Array.from({ length: missed }, (_, i) => addDays(user.lastActiveDay!, i + 1));
        await db
          .insert(freezeDays)
          .values(days.map((day) => ({ userId: user.id, day })))
          .onConflictDoNothing();
        patch.streakFreezes = user.streakFreezes - missed;
        patch.lastActiveDay = addDays(today, -1);
      } else {
        patch.streak = 0;
      }
    }
  }

  // Leagues: resolve the most recent finished week this user competed in.
  const currentWeek = weekKey(new Date(now));
  const pending = await db
    .select()
    .from(leagueMemberships)
    .where(and(eq(leagueMemberships.userId, user.id), lt(leagueMemberships.week, currentWeek), isNull(leagueMemberships.result)))
    .orderBy(desc(leagueMemberships.week))
    .all();
  if (pending.length) {
    const last = pending[0];
    const standings = await leagueStandings(last.week, last.tier);
    const idx = standings.findIndex((s) => s.userId === user.id);
    const me = standings[idx];
    const outcome = leagueOutcome(idx + 1, standings.length, last.tier, me?.weeklyXp ?? 0);
    const tier = last.tier + (outcome === "promoted" ? 1 : outcome === "demoted" ? -1 : 0);
    await db
      .update(leagueMemberships)
      .set({ result: outcome })
      .where(and(eq(leagueMemberships.userId, user.id), inArray(leagueMemberships.week, pending.map((p) => p.week))));
    patch.leagueTier = tier;
  }

  if (Object.keys(patch).length === 0) return user;
  await db.update(users).set(patch).where(eq(users.id, user.id));
  const updated = { ...user, ...patch };
  if (patch.leagueTier !== undefined && patch.leagueTier > user.leagueTier) {
    await checkAchievements(updated);
  }
  return updated;
}

// ---------------------------------------------------------------- leagues

export async function leagueStandings(week: string, tier: number) {
  const db = await getDb();
  const rows = await db
    .select({
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      avatarColor: users.avatarColor,
      streak: users.streak,
      weeklyXp: sql<number>`coalesce((select sum(${xpEvents.amount}) from ${xpEvents} where ${xpEvents.userId} = ${users.id} and ${xpEvents.week} = ${week}), 0)`,
    })
    .from(leagueMemberships)
    .innerJoin(users, eq(users.id, leagueMemberships.userId))
    .where(and(eq(leagueMemberships.week, week), eq(leagueMemberships.tier, tier)))
    .all();
  return rows
    .map((r) => ({ ...r, weeklyXp: Number(r.weeklyXp) }))
    .sort((a, b) => b.weeklyXp - a.weeklyXp || a.username.localeCompare(b.username));
}

// ---------------------------------------------------------------- activity

export async function dayActivity(userId: string, day: string): Promise<DayActivity> {
  const db = await getDb();
  const rows = await db
    .select({ source: xpEvents.source, xp: sum(xpEvents.amount), n: count() })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), eq(xpEvents.day, day)))
    .groupBy(xpEvents.source)
    .all();
  const a: DayActivity = { xp: 0, lessons: 0, perfectLessons: 0, problems: 0 };
  for (const r of rows) {
    a.xp += Number(r.xp ?? 0);
    if (r.source === "lesson" || r.source === "practice") a.lessons += r.n;
    if (r.source === "perfect") a.perfectLessons += r.n;
    if (r.source === "problem") a.problems += r.n;
  }
  return a;
}

export async function questsWithProgress(user: User) {
  const db = await getDb();
  const day = todayFor(user);
  const [activity, claims] = await Promise.all([
    dayActivity(user.id, day),
    db.select().from(questClaims).where(and(eq(questClaims.userId, user.id), eq(questClaims.day, day))).all(),
  ]);
  const claimed = new Set(claims.map((c) => c.questKey));
  return {
    activity,
    quests: questsForDay(user.id, day).map((q) => ({ ...q, ...questProgress(q, activity), claimed: claimed.has(q.key) })),
  };
}

export async function getStats(user: User): Promise<Stats> {
  const db = await getDb();
  const [progress, solved] = await Promise.all([
    db.select({ lessonId: lessonProgress.lessonId, courseSlug: lessonProgress.courseSlug, perfect: lessonProgress.perfect }).from(lessonProgress).where(eq(lessonProgress.userId, user.id)).all(),
    solvedProblems(user.id),
  ]);
  const done = new Set(progress.map((p) => p.lessonId));
  const started = new Set(progress.map((p) => p.courseSlug));
  return {
    xp: user.xp,
    streak: user.streak,
    longestStreak: user.longestStreak,
    lessonsCompleted: progress.length,
    perfectLessons: progress.filter((p) => p.perfect).length,
    problemsSolved: solved.size,
    hardSolved: PROBLEMS.filter((p) => p.difficulty === "hard" && solved.has(p.slug)).length,
    coursesStarted: started.size,
    coursesCompleted: COURSES.filter((c) => courseLessons(c).every((l) => done.has(l.id))).length,
    leagueTier: user.leagueTier,
  };
}

export async function solvedProblems(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ slug: submissions.problemSlug })
    .from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.verdict, "accepted")))
    .all();
  return new Set(rows.map((r) => r.slug));
}

export async function completedLessons(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db.select({ id: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId)).all();
  return new Set(rows.map((r) => r.id));
}

// ---------------------------------------------------------------- rewards

export interface Reward {
  xp: number;
  gems: number;
  boosted: boolean;
  streak: number;
  streakExtended: boolean;
  dailyGoalReached: boolean;
  dailyXp: number;
  dailyGoal: number;
  levelUp: number | null;
  quests: Pick<QuestDef, "key" | "title" | "icon">[];
  achievements: Pick<AchievementDef, "key" | "title" | "icon" | "description">[];
}

interface Grant {
  amount: number;
  source: string;
  refId?: string;
}

/**
 * Applies XP grants plus everything that hangs off them: streak, league
 * membership, daily goal, quests and achievements. `user` must be refreshed.
 */
export async function grantRewards(user: User, grants: Grant[], extraGems = 0): Promise<Reward> {
  const db = await getDb();
  const now = new Date();
  const today = todayFor(user, now);
  const week = weekKey(now);
  const boosted = user.xpBoostUntil > now.getTime();
  const mult = boosted ? 2 : 1;
  const before = await dayActivity(user.id, today);

  const rows = grants
    .filter((g) => g.amount > 0)
    .map((g) => ({ userId: user.id, amount: g.amount * mult, source: g.source, refId: g.refId ?? null, day: today, week, createdAt: now.getTime() }));
  const gained = rows.reduce((s, r) => s + r.amount, 0);
  if (rows.length) await db.insert(xpEvents).values(rows);

  // Streak
  let streak = user.streak;
  let streakExtended = false;
  if (gained > 0 && user.lastActiveDay !== today) {
    streak = user.lastActiveDay === addDays(today, -1) ? user.streak + 1 : 1;
    streakExtended = true;
  }

  // League: join this week's league on first XP.
  if (gained > 0) {
    await db.insert(leagueMemberships).values({ userId: user.id, week, tier: user.leagueTier }).onConflictDoNothing();
  }

  let gems = extraGems;
  const dailyXp = before.xp + gained;
  const dailyGoalReached = before.xp < user.dailyGoal && dailyXp >= user.dailyGoal;
  if (dailyGoalReached) gems += GEMS.dailyGoal;

  const updated: User = {
    ...user,
    xp: user.xp + gained,
    streak,
    longestStreak: Math.max(user.longestStreak, streak),
    lastActiveDay: gained > 0 ? today : user.lastActiveDay,
    gems: user.gems + gems,
  };
  await db
    .update(users)
    .set({ xp: updated.xp, streak, longestStreak: updated.longestStreak, lastActiveDay: updated.lastActiveDay, gems: updated.gems })
    .where(eq(users.id, user.id));

  // Quests
  const { quests } = await questsWithProgress(updated);
  const newlyDone = quests.filter((q) => q.done && !q.claimed);
  if (newlyDone.length) {
    await db
      .insert(questClaims)
      .values(newlyDone.map((q) => ({ userId: user.id, day: today, questKey: q.key, claimedAt: now.getTime() })))
      .onConflictDoNothing();
    const questGems = newlyDone.length * GEMS.quest;
    updated.gems += questGems;
    gems += questGems;
    await db.update(users).set({ gems: sql`${users.gems} + ${questGems}` }).where(eq(users.id, user.id));
  }

  const unlocked = await checkAchievements(updated);
  gems += unlocked.reduce((s, a) => s + a.gems, 0);

  const lvBefore = levelInfo(user.xp).level;
  const lvAfter = levelInfo(updated.xp).level;

  return {
    xp: gained,
    gems,
    boosted,
    streak,
    streakExtended,
    dailyGoalReached,
    dailyXp,
    dailyGoal: user.dailyGoal,
    levelUp: lvAfter > lvBefore ? lvAfter : null,
    quests: newlyDone.map(({ key, title, icon }) => ({ key, title, icon })),
    achievements: unlocked.map(({ key, title, icon, description }) => ({ key, title, icon, description })),
  };
}

/** Unlocks any achievements whose goal is now met and pays out their gems. */
export async function checkAchievements(user: User): Promise<AchievementDef[]> {
  const db = await getDb();
  const have = new Set(
    (await db.select({ key: achievements.key }).from(achievements).where(eq(achievements.userId, user.id)).all()).map((r) => r.key),
  );
  const stats = await getStats(user);
  const fresh = ACHIEVEMENTS.filter((a) => {
    if (have.has(a.key)) return false;
    const [cur, target] = a.progress(stats);
    return cur >= target;
  });
  if (!fresh.length) return [];
  const now = Date.now();
  await db
    .insert(achievements)
    .values(fresh.map((a) => ({ userId: user.id, key: a.key, unlockedAt: now })))
    .onConflictDoNothing();
  const gems = fresh.reduce((s, a) => s + a.gems, 0);
  await db.update(users).set({ gems: sql`${users.gems} + ${gems}` }).where(eq(users.id, user.id));
  return fresh;
}

// ---------------------------------------------------------------- lessons & problems

export async function recordLesson(user: User, lessonId: string, courseSlug: string, accuracy: number) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)))
    .get();
  const perfect = accuracy >= 100;
  const now = Date.now();
  if (existing) {
    await db
      .update(lessonProgress)
      .set({
        timesCompleted: existing.timesCompleted + 1,
        bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
        perfect: existing.perfect || perfect,
        completedAt: now,
      })
      .where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)));
  } else {
    await db.insert(lessonProgress).values({ userId: user.id, lessonId, courseSlug, bestAccuracy: accuracy, perfect, completedAt: now });
  }
  if (user.currentCourse !== courseSlug) {
    await db.update(users).set({ currentCourse: courseSlug }).where(eq(users.id, user.id));
    user = { ...user, currentCourse: courseSlug };
  }

  const grants: Grant[] = [{ amount: existing ? XP.practiceLesson : XP.lesson, source: existing ? "practice" : "lesson", refId: lessonId }];
  if (perfect) grants.push({ amount: XP.perfectBonus, source: "perfect", refId: lessonId });
  // Lesson gems are added inside grantRewards' user update.
  return grantRewards(user, grants, existing ? 0 : GEMS.lesson);
}

/** XP/heatmap data for the last `days` days, keyed by day. */
export async function xpByDay(userId: string, fromDay: string) {
  const db = await getDb();
  const rows = await db
    .select({ day: xpEvents.day, xp: sum(xpEvents.amount) })
    .from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), sql`${xpEvents.day} >= ${fromDay}`))
    .groupBy(xpEvents.day)
    .all();
  const frozen = await db
    .select({ day: freezeDays.day })
    .from(freezeDays)
    .where(and(eq(freezeDays.userId, userId), sql`${freezeDays.day} >= ${fromDay}`))
    .all();
  return {
    xp: Object.fromEntries(rows.map((r) => [r.day, Number(r.xp ?? 0)])) as Record<string, number>,
    frozen: frozen.map((f) => f.day),
  };
}
