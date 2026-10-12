export interface Stats {
  xp: number;
  streak: number;
  longestStreak: number;
  lessonsCompleted: number;
  perfectLessons: number;
  problemsSolved: number;
  hardSolved: number;
  coursesStarted: number;
  coursesCompleted: number;
  leagueTier: number;
}

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string;
  gems: number;
  /** Progress toward the goal as [current, target]. */
  progress: (s: Stats) => [number, number];
}

const t = (current: number, target: number): [number, number] => [Math.min(current, target), target];

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "first-lesson", title: "First Steps", description: "Complete your first lesson", icon: "👣", gems: 20, progress: (s) => t(s.lessonsCompleted, 1) },
  { key: "lessons-10", title: "Bookworm", description: "Complete 10 lessons", icon: "📚", gems: 50, progress: (s) => t(s.lessonsCompleted, 10) },
  { key: "lessons-25", title: "Scholar", description: "Complete 25 lessons", icon: "🎓", gems: 100, progress: (s) => t(s.lessonsCompleted, 25) },
  { key: "perfect-5", title: "Perfectionist", description: "Finish 5 lessons without a mistake", icon: "💎", gems: 50, progress: (s) => t(s.perfectLessons, 5) },
  { key: "streak-3", title: "Warming Up", description: "Reach a 3-day streak", icon: "🔥", gems: 20, progress: (s) => t(s.longestStreak, 3) },
  { key: "streak-7", title: "Week Warrior", description: "Reach a 7-day streak", icon: "⚔️", gems: 50, progress: (s) => t(s.longestStreak, 7) },
  { key: "streak-30", title: "Unstoppable", description: "Reach a 30-day streak", icon: "🌋", gems: 200, progress: (s) => t(s.longestStreak, 30) },
  { key: "solve-1", title: "Hello, Judge", description: "Solve your first practice problem", icon: "✅", gems: 20, progress: (s) => t(s.problemsSolved, 1) },
  { key: "solve-10", title: "Problem Solver", description: "Solve 10 practice problems", icon: "🧩", gems: 100, progress: (s) => t(s.problemsSolved, 10) },
  { key: "solve-hard", title: "Hard Hitter", description: "Solve a hard problem", icon: "🥊", gems: 75, progress: (s) => t(s.hardSolved, 1) },
  { key: "xp-500", title: "Rising Star", description: "Earn 500 XP", icon: "⭐", gems: 30, progress: (s) => t(s.xp, 500) },
  { key: "xp-2000", title: "XP Machine", description: "Earn 2,000 XP", icon: "🚀", gems: 100, progress: (s) => t(s.xp, 2000) },
  { key: "polyglot", title: "Polyglot", description: "Start 2 different courses", icon: "🌍", gems: 40, progress: (s) => t(s.coursesStarted, 2) },
  { key: "graduate", title: "Graduate", description: "Complete an entire course", icon: "🏆", gems: 150, progress: (s) => t(s.coursesCompleted, 1) },
  { key: "promoted", title: "Moving Up", description: "Get promoted to the Silver league", icon: "🥈", gems: 50, progress: (s) => t(s.leagueTier, 1) },
];

export function achievementByKey(key: string) {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
