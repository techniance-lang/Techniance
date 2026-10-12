export interface DayActivity {
  xp: number;
  lessons: number;
  perfectLessons: number;
  problems: number;
}

export interface QuestDef {
  key: string;
  title: string;
  icon: string;
  metric: keyof DayActivity;
  target: number;
}

const POOL: QuestDef[] = [
  { key: "xp-30", title: "Earn 30 XP", icon: "⚡", metric: "xp", target: 30 },
  { key: "xp-50", title: "Earn 50 XP", icon: "⚡", metric: "xp", target: 50 },
  { key: "lessons-2", title: "Complete 2 lessons", icon: "📘", metric: "lessons", target: 2 },
  { key: "lessons-3", title: "Complete 3 lessons", icon: "📘", metric: "lessons", target: 3 },
  { key: "perfect-1", title: "Finish a lesson with no mistakes", icon: "🎯", metric: "perfectLessons", target: 1 },
  { key: "problem-1", title: "Solve a practice problem", icon: "🧩", metric: "problems", target: 1 },
  { key: "problem-2", title: "Solve 2 practice problems", icon: "🧩", metric: "problems", target: 2 },
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Three quests per user per day: one XP quest, one lesson quest and one
 * problem/accuracy quest, chosen deterministically so they're stable all day.
 */
export function questsForDay(userId: string, day: string): QuestDef[] {
  const h = hash(`${userId}:${day}`);
  const xp = POOL.filter((q) => q.metric === "xp");
  const lessons = POOL.filter((q) => q.metric === "lessons");
  const other = POOL.filter((q) => q.metric === "perfectLessons" || q.metric === "problems");
  return [xp[h % xp.length], lessons[(h >>> 4) % lessons.length], other[(h >>> 8) % other.length]];
}

export function questProgress(q: QuestDef, a: DayActivity) {
  const current = Math.min(a[q.metric], q.target);
  return { current, target: q.target, done: current >= q.target };
}
