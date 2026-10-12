import clsx from "clsx";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { FlameIcon, TrophyIcon } from "@/components/icons";
import { Avatar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { msUntilWeekEnd, weekKey } from "@/lib/game/dates";
import { leagueStandings } from "@/lib/game/engine";
import { DEMOTE_COUNT, LEAGUES, MIN_COHORT_FOR_DEMOTION, PROMOTE_COUNT, levelInfo } from "@/lib/game/rules";
import { formatDuration } from "@/lib/shell";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser();
  const tab = (await searchParams).tab === "global" ? "global" : "league";
  const now = new Date();
  const db = await getDb();

  const tabs = (
    <div className="mx-auto mt-6 flex w-fit rounded-2xl border-2 border-line p-1">
      {(["league", "global"] as const).map((t) => (
        <Link
          key={t}
          href={t === "league" ? "/leaderboard" : "/leaderboard?tab=global"}
          className={clsx("rounded-xl px-5 py-2 text-sm font-extrabold uppercase", tab === t ? "bg-brand text-white" : "text-muted hover:text-fg")}
        >
          {t === "league" ? "Weekly league" : "All-time"}
        </Link>
      ))}
    </div>
  );

  if (tab === "global") {
    const top = await db
      .select({ id: schema.users.id, username: schema.users.username, displayName: schema.users.displayName, avatarColor: schema.users.avatarColor, xp: schema.users.xp, streak: schema.users.streak, leagueTier: schema.users.leagueTier })
      .from(schema.users)
      .orderBy(desc(schema.users.xp), schema.users.username)
      .limit(50)
      .all();
    return (
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-12">
        <h1 className="text-center text-3xl font-black">Leaderboard</h1>
        {tabs}
        <ol className="card mt-6 overflow-hidden">
          {top.map((u, i) => (
            <Row key={u.id} rank={i + 1} me={u.id === user.id} username={u.username} name={u.displayName} color={u.avatarColor} right={`${u.xp.toLocaleString()} XP`} sub={`Level ${levelInfo(u.xp).level} · ${LEAGUES[u.leagueTier].name}`} streak={u.streak} first={i === 0} />
          ))}
        </ol>
      </div>
    );
  }

  const week = weekKey(now);
  const league = LEAGUES[user.leagueTier];
  const standings = await leagueStandings(week, user.leagueTier);
  const lastResult = await db
    .select()
    .from(schema.leagueMemberships)
    .where(and(eq(schema.leagueMemberships.userId, user.id), isNotNull(schema.leagueMemberships.result)))
    .orderBy(desc(schema.leagueMemberships.week))
    .get();
  const demotionOn = standings.length >= MIN_COHORT_FOR_DEMOTION && user.leagueTier > 0;
  const promotionOn = user.leagueTier < LEAGUES.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 pb-12">
      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {LEAGUES.map((l, i) => (
          <div key={l.name} title={l.name} className={clsx("shrink-0 transition", i === user.leagueTier ? "scale-125" : i > user.leagueTier ? "opacity-30 grayscale" : "opacity-70")}>
            <TrophyIcon className="size-9" color={l.color} />
          </div>
        ))}
      </div>
      <h1 className="mt-4 text-center text-3xl font-black">{league.name} League</h1>
      <p className="mt-1 text-center font-bold text-muted">
        {promotionOn ? `Top ${PROMOTE_COUNT} advance to the next league` : "You're in the top league!"} · Ends in {formatDuration(msUntilWeekEnd(now))}
      </p>
      {tabs}

      {lastResult?.result && lastResult.week === weekKey(new Date(now.getTime() - 7 * 864e5)) && (
        <div className={clsx("mt-6 rounded-2xl border-2 p-4 text-center font-bold", lastResult.result === "promoted" ? "border-success bg-success-soft" : lastResult.result === "demoted" ? "border-danger bg-danger-soft" : "border-line")}>
          Last week you {lastResult.result === "stayed" ? `stayed in ${LEAGUES[lastResult.tier].name}` : `were ${lastResult.result} to ${league.name}`}
          {lastResult.result === "promoted" ? " 🎉" : lastResult.result === "demoted" ? ". Bounce back this week!" : "."}
        </div>
      )}

      {standings.length === 0 || !standings.some((s) => s.userId === user.id) ? (
        <div className="card mt-6 p-8 text-center">
          <TrophyIcon className="mx-auto size-16" color={league.color} />
          <h2 className="mt-4 text-xl font-black">Join this week&apos;s league</h2>
          <p className="mt-1 font-semibold text-muted">Complete a lesson or solve a problem to start competing.</p>
          <Link href="/learn" className="btn mt-5">Start a lesson</Link>
        </div>
      ) : null}

      {standings.length > 0 && (
        <ol className="card mt-6 overflow-hidden">
          {standings.map((s, i) => {
            const rank = i + 1;
            const promo = promotionOn && rank <= PROMOTE_COUNT && s.weeklyXp > 0;
            const demo = demotionOn && rank > standings.length - DEMOTE_COUNT;
            return (
              <div key={s.userId}>
                {promotionOn && rank === PROMOTE_COUNT + 1 && (
                  <div className="flex items-center justify-center gap-2 border-t-2 border-line bg-success-soft py-1.5 text-xs font-black text-success-strong uppercase dark:text-success">
                    <ArrowUp className="size-4" /> Promotion zone <ArrowUp className="size-4" />
                  </div>
                )}
                {demotionOn && rank === standings.length - DEMOTE_COUNT + 1 && (
                  <div className="flex items-center justify-center gap-2 border-t-2 border-line bg-danger-soft py-1.5 text-xs font-black text-danger uppercase">
                    <ArrowDown className="size-4" /> Demotion zone <ArrowDown className="size-4" />
                  </div>
                )}
                <Row
                  rank={rank}
                  me={s.userId === user.id}
                  username={s.username}
                  name={s.displayName}
                  color={s.avatarColor}
                  right={`${s.weeklyXp} XP`}
                  streak={s.streak}
                  rankColor={promo ? "var(--success)" : demo ? "var(--danger)" : undefined}
                  first={i === 0}
                />
              </div>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Row({
  rank,
  me,
  username,
  name,
  color,
  right,
  sub,
  streak,
  rankColor,
  first,
}: {
  rank: number;
  me: boolean;
  username: string;
  name: string;
  color: string;
  right: string;
  sub?: string;
  streak: number;
  rankColor?: string;
  first?: boolean;
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <Link href={`/profile/${username}`} className={clsx("flex items-center gap-4 px-4 py-3 transition hover:bg-surface-2", !first && "border-t-2 border-line", me && "bg-brand-soft")}>
      <span className="w-8 text-center text-lg font-black" style={{ color: rankColor }}>
        {medal ?? rank}
      </span>
      <Avatar name={name} color={color} size={44} />
      <div className="min-w-0 flex-1">
        <div className={clsx("truncate font-black", me && "text-brand")}>
          {name} {me && <span className="text-xs">(you)</span>}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted">
          {sub ?? `@${username}`}
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-flame">
              <FlameIcon className="size-3.5" /> {streak}
            </span>
          )}
        </div>
      </div>
      <span className="font-black whitespace-nowrap">{right}</span>
    </Link>
  );
}
