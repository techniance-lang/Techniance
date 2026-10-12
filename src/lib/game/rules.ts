// Pure game rules shared by the server and the UI. No database access here.

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 3 * 60 * 60 * 1000; // one heart every 3 hours
export const MAX_STREAK_FREEZES = 2;

export const XP = {
  lesson: 10,
  perfectBonus: 5,
  practiceLesson: 5,
  problem: { easy: 10, medium: 20, hard: 40 } as const,
  problemOfTheDayBonus: 15,
  dailyGoalBonus: 5,
};

export const GEMS = {
  lesson: 5,
  quest: 15,
  dailyGoal: 10,
};

export const SHOP = {
  streakFreeze: { price: 100, name: "Streak Freeze" },
  heartRefill: { price: 60, name: "Heart Refill" },
  xpBoost: { price: 80, name: "Double XP (15 min)", durationMs: 15 * 60 * 1000 },
} as const;
export type ShopItem = keyof typeof SHOP;

export const DAILY_GOALS = [
  { xp: 10, label: "Casual", blurb: "~5 min / day" },
  { xp: 20, label: "Regular", blurb: "~10 min / day" },
  { xp: 50, label: "Serious", blurb: "~20 min / day" },
  { xp: 100, label: "Intense", blurb: "~40 min / day" },
] as const;

// ---------- Levels ----------

/** Total XP needed to reach `level` (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  return 25 * level * (level - 1);
}

export function levelInfo(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    intoLevel: xp - floor,
    levelSpan: next - floor,
    progress: (xp - floor) / (next - floor),
    toNext: next - xp,
  };
}

export function levelTitle(level: number): string {
  if (level >= 30) return "Grandmaster";
  if (level >= 22) return "Master";
  if (level >= 16) return "Expert";
  if (level >= 11) return "Specialist";
  if (level >= 7) return "Coder";
  if (level >= 4) return "Apprentice";
  return "Newbie";
}

// ---------- Hearts ----------

/** Applies passive regeneration. Returns current hearts and when the next one arrives. */
export function regenHearts(hearts: number, updatedAt: number, now: number) {
  if (hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt: now, nextAt: null as number | null };
  const gained = Math.floor((now - updatedAt) / HEART_REGEN_MS);
  const total = Math.min(MAX_HEARTS, hearts + gained);
  if (total >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt: now, nextAt: null };
  const newUpdatedAt = updatedAt + gained * HEART_REGEN_MS;
  return { hearts: total, updatedAt: newUpdatedAt, nextAt: newUpdatedAt + HEART_REGEN_MS };
}

// ---------- Leagues ----------

export const LEAGUES = [
  { name: "Bronze", color: "#cd7f32" },
  { name: "Silver", color: "#b8c4d6" },
  { name: "Gold", color: "#ffc93c" },
  { name: "Sapphire", color: "#3d8bff" },
  { name: "Ruby", color: "#ff4d6d" },
  { name: "Emerald", color: "#2ed47a" },
  { name: "Amethyst", color: "#a26bff" },
  { name: "Pearl", color: "#f3d9ff" },
  { name: "Obsidian", color: "#5b5f7a" },
  { name: "Diamond", color: "#7df9ff" },
] as const;

export const PROMOTE_COUNT = 7;
export const DEMOTE_COUNT = 5;
/** Below this cohort size nobody is demoted. */
export const MIN_COHORT_FOR_DEMOTION = 12;

export function leagueOutcome(rank: number, cohort: number, tier: number, weeklyXp: number) {
  if (weeklyXp > 0 && rank <= PROMOTE_COUNT && tier < LEAGUES.length - 1) return "promoted" as const;
  if (cohort >= MIN_COHORT_FOR_DEMOTION && rank > cohort - DEMOTE_COUNT && tier > 0) return "demoted" as const;
  return "stayed" as const;
}
