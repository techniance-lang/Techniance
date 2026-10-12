import { eq } from "drizzle-orm";
import { CalendarDays, Settings } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HEATMAP_DAYS, Heatmap } from "@/components/heatmap";
import { BoltIcon, FlameIcon, FreezeIcon, TrophyIcon } from "@/components/icons";
import { Avatar, ProgressBar } from "@/components/ui";
import { COURSES, courseLessons } from "@/content/courses";
import { requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { addDays } from "@/lib/game/dates";
import { getStats, refreshUser, todayFor, xpByDay } from "@/lib/game/engine";
import { LEAGUES, levelInfo, levelTitle } from "@/lib/game/rules";
import { lessonProgressFor } from "@/lib/progress";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  return { title: `@${(await params).username}` };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const viewer = await requireUser();
  const { username } = await params;
  const db = await getDb();
  const row = await db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  if (!row) notFound();
  const user = row.id === viewer.id ? viewer : await refreshUser(row);
  const me = user.id === viewer.id;

  const today = todayFor(user);
  const [stats, activity, unlocked, progress] = await Promise.all([
    getStats(user),
    xpByDay(user.id, addDays(today, -HEATMAP_DAYS)),
    db.select().from(schema.achievements).where(eq(schema.achievements.userId, user.id)).all(),
    lessonProgressFor(user.id),
  ]);
  const unlockedAt = new Map(unlocked.map((a) => [a.key, a.unlockedAt]));
  const lv = levelInfo(user.xp);
  const league = LEAGUES[user.leagueTier];
  const activeToday = user.lastActiveDay === today;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-12">
      {/* Header */}
      <div className="card relative overflow-hidden">
        <div className="h-28" style={{ background: `linear-gradient(135deg, ${user.avatarColor}, color-mix(in srgb, ${user.avatarColor} 40%, var(--brand)))` }} />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <Avatar name={user.displayName} color={user.avatarColor} size={104} className="border-4 border-surface" />
            {me && (
              <Link href="/settings" className="btn btn-ghost btn-sm">
                <Settings className="size-4" /> Edit profile
              </Link>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-black">{user.displayName}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-muted">
            <span>@{user.username}</span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-4" /> Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
          </div>
          {user.bio && <p className="mt-3 font-semibold">{user.bio}</p>}
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-sm font-black">
              <span>
                Level {lv.level} · <span className="text-brand">{levelTitle(lv.level)}</span>
              </span>
              <span className="text-muted">{lv.toNext} XP to level {lv.level + 1}</span>
            </div>
            <ProgressBar value={lv.progress} color="var(--brand)" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <h2 className="mt-8 mb-3 text-xl font-black">Statistics</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<FlameIcon className="size-8" dim={!activeToday && user.streak === 0} />} value={user.streak} label="Day streak" />
        <Stat icon={<BoltIcon className="size-8" />} value={user.xp.toLocaleString()} label="Total XP" />
        <Stat icon={<TrophyIcon className="size-8" color={league.color} />} value={league.name} label="Current league" />
        <Stat icon={<span className="text-3xl">🔥</span>} value={user.longestStreak} label="Longest streak" />
        <Stat icon={<span className="text-3xl">📘</span>} value={stats.lessonsCompleted} label="Lessons done" />
        <Stat icon={<span className="text-3xl">🧩</span>} value={stats.problemsSolved} label="Problems solved" />
        <Stat icon={<span className="text-3xl">🎯</span>} value={stats.perfectLessons} label="Perfect lessons" />
        <Stat icon={<FreezeIcon className="size-8" />} value={user.streakFreezes} label="Freezes equipped" />
      </div>

      {/* Activity */}
      <h2 className="mt-8 mb-3 text-xl font-black">Activity</h2>
      <div className="card p-5">
        <Heatmap today={today} xp={activity.xp} frozen={activity.frozen} />
      </div>

      {/* Courses */}
      <h2 className="mt-8 mb-3 text-xl font-black">Courses</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {COURSES.map((c) => {
          const lessons = courseLessons(c);
          const done = lessons.filter((l) => progress.completed.has(l.id)).length;
          return (
            <div key={c.slug} className="card flex items-center gap-3 p-4">
              <span className="text-3xl">{c.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{c.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar value={done / lessons.length} height={8} color={c.color} />
                  <span className="text-xs font-extrabold text-muted">{done}/{lessons.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements */}
      <h2 className="mt-8 mb-3 text-xl font-black">
        Achievements <span className="text-muted">· {unlocked.length}/{ACHIEVEMENTS.length}</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const [cur, target] = a.progress(stats);
          const at = unlockedAt.get(a.key);
          return (
            <div key={a.key} className={`card flex items-center gap-4 p-4 ${at ? "" : "opacity-70"}`}>
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl text-3xl ${at ? "bg-[color-mix(in_srgb,var(--gold)_25%,transparent)]" : "bg-surface-3 grayscale"}`}>{a.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-black">{a.title}</div>
                <div className="text-sm font-semibold text-muted">{a.description}</div>
                {at ? (
                  <div className="mt-1 text-xs font-extrabold text-gold">Unlocked {new Date(at).toLocaleDateString()}</div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <ProgressBar value={cur / target} height={8} color="var(--gold)" />
                    <span className="text-xs font-extrabold whitespace-nowrap text-muted">{cur}/{target}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="truncate text-xl font-black">{value}</div>
        <div className="truncate text-xs font-bold text-muted">{label}</div>
      </div>
    </div>
  );
}
