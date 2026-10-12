import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import type { User } from "@/lib/db/schema";
import { CourseBadge } from "./course-badge";
import { MAX_HEARTS } from "@/lib/game/rules";
import { formatDuration, type ShellData } from "@/lib/shell";
import { FlameIcon, GemIcon, HeartIcon, TrophyIcon } from "./icons";
import { ProgressBar } from "./ui";

export function StatBar({ user, shell }: { user: User; shell: ShellData }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-5">
      {shell.course && (
        <Link href="/courses" className="rounded-xl transition hover:scale-105" title={shell.course.title}>
          <CourseBadge course={shell.course} size={38} />
        </Link>
      )}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-black transition hover:bg-surface-2"
        title={shell.streakActiveToday ? "Streak extended today!" : "Complete a lesson to extend your streak"}
      >
        <FlameIcon className={shell.streakActiveToday ? "size-7 animate-flicker" : "size-7"} dim={!shell.streakActiveToday} />
        <span className={shell.streakActiveToday ? "text-flame" : "text-muted"}>{user.streak}</span>
      </Link>
      <Link href="/shop" className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-black text-gem transition hover:bg-surface-2" title="Gems">
        <GemIcon className="size-7" /> {user.gems}
      </Link>
      <Link
        href="/shop"
        className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 font-black text-heart transition hover:bg-surface-2"
        title={shell.heartsNextAt ? `Next heart in ${formatDuration(shell.heartsNextAt - Date.now())}` : "Hearts full"}
      >
        <HeartIcon className="size-7" dim={user.hearts === 0} /> {user.hearts}
      </Link>
    </div>
  );
}

export function RightRail({ user, shell }: { user: User; shell: ShellData }) {
  return (
    <aside className="sticky top-6 hidden w-[340px] shrink-0 space-y-5 self-start lg:block">
      <StatBar user={user} shell={shell} />
      {shell.boostActive && (
        <div className="card flex items-center gap-3 border-gold/60 p-4">
          <Zap className="size-6 text-gold" />
          <div className="text-sm font-black">
            Double XP active
            <div className="font-bold text-muted">{formatDuration(user.xpBoostUntil - Date.now())} left</div>
          </div>
        </div>
      )}
      <DailyGoalCard user={user} shell={shell} />
      <LeagueCard shell={shell} />
      <QuestsCard shell={shell} />
    </aside>
  );
}

export function DailyGoalCard({ user, shell }: { user: User; shell: ShellData }) {
  const done = shell.dailyXp >= user.dailyGoal;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black">Daily goal</h3>
        <Link href="/settings" className="text-xs font-extrabold text-brand uppercase hover:underline">Edit</Link>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <FlameIcon className="size-12 shrink-0" dim={!shell.streakActiveToday} />
        <div className="flex-1">
          <div className="mb-1.5 text-sm font-bold text-muted">
            {done ? "Goal complete! 🎉" : `${user.dailyGoal - shell.dailyXp} XP to go`}
          </div>
          <ProgressBar value={shell.dailyXp / user.dailyGoal} color="var(--gold)" />
          <div className="mt-1 text-right text-xs font-extrabold text-muted">
            {Math.min(shell.dailyXp, user.dailyGoal)} / {user.dailyGoal} XP
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeagueCard({ shell }: { shell: ShellData }) {
  const { league } = shell;
  return (
    <Link href="/leaderboard" className="card block p-5 transition hover:bg-surface-2">
      <div className="flex items-center justify-between">
        <h3 className="font-black">{league.name} League</h3>
        <ChevronRight className="size-5 text-muted" />
      </div>
      <div className="mt-3 flex items-center gap-4">
        <TrophyIcon className="size-12 shrink-0" color={league.color} />
        <p className="text-sm font-bold text-muted">
          {league.rank ? (
            <>
              You&apos;re <span className="text-fg">#{league.rank}</span> of {league.cohort} with {league.weeklyXp} XP this week.
            </>
          ) : (
            "Earn XP to join this week's league and compete for promotion."
          )}
          <span className="mt-1 block text-xs">Ends in {formatDuration(league.endsInMs)}</span>
        </p>
      </div>
    </Link>
  );
}

export function QuestsCard({ shell }: { shell: ShellData }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black">Daily quests</h3>
        <Link href="/quests" className="text-xs font-extrabold text-brand uppercase hover:underline">View all</Link>
      </div>
      <ul className="mt-4 space-y-4">
        {shell.quests.map((q) => (
          <li key={q.key} className="flex items-center gap-3">
            <span className="text-2xl">{q.icon}</span>
            <div className="flex-1">
              <div className="mb-1.5 text-sm font-bold">{q.title}</div>
              <div className="flex items-center gap-2">
                <ProgressBar value={q.current / q.target} height={12} color={q.done ? "var(--success)" : "var(--gold)"} />
                <span className="w-10 text-right text-xs font-extrabold text-muted">
                  {q.current}/{q.target}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeartsRow({ hearts }: { hearts: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <HeartIcon key={i} className="size-6" dim={i >= hearts} />
      ))}
    </div>
  );
}
