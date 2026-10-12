import "server-only";
import { cache } from "react";
import { getCourse } from "@/content/courses";
import type { User } from "./db/schema";
import { msUntilWeekEnd, weekKey } from "./game/dates";
import { leagueStandings, questsWithProgress, todayFor } from "./game/engine";
import { LEAGUES, regenHearts } from "./game/rules";

/** Everything the stat bar and right rail need, in one place. Cached per request. */
export const getShellData = cache(async (user: User) => {
  const now = new Date();
  const week = weekKey(now);
  const [{ activity, quests }, standings] = await Promise.all([questsWithProgress(user), leagueStandings(week, user.leagueTier)]);
  const rank = standings.findIndex((s) => s.userId === user.id);
  return {
    today: todayFor(user, now),
    streakActiveToday: user.lastActiveDay === todayFor(user, now),
    dailyXp: activity.xp,
    quests,
    league: {
      ...LEAGUES[user.leagueTier],
      tier: user.leagueTier,
      rank: rank === -1 ? null : rank + 1,
      cohort: standings.length,
      weeklyXp: rank === -1 ? 0 : standings[rank].weeklyXp,
      endsInMs: msUntilWeekEnd(now),
    },
    heartsNextAt: regenHearts(user.hearts, user.heartsUpdatedAt, now.getTime()).nextAt,
    boostActive: user.xpBoostUntil > now.getTime(),
    course: user.currentCourse ? getCourse(user.currentCourse) : undefined,
  };
});

export type ShellData = Awaited<ReturnType<typeof getShellData>>;

export function formatDuration(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m % 60}m`;
}
