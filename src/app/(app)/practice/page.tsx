import { CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BoltIcon } from "@/components/icons";
import { ProblemList, type ProblemRow } from "@/components/problem-list";
import { DifficultyBadge, Markdown } from "@/components/ui";
import { PROBLEMS, problemOfTheDay } from "@/content/problems";
import type { Difficulty } from "@/content/types";
import { requireUser } from "@/lib/auth";
import { XP } from "@/lib/game/rules";
import { problemStats, userProblemStatus } from "@/lib/problems-stats";

export const metadata = { title: "Practice" };

export default async function PracticePage() {
  const user = await requireUser();
  const [stats, status] = await Promise.all([problemStats(), userProblemStatus(user.id)]);
  const potd = problemOfTheDay(new Date().toISOString().slice(0, 10));

  const rows: ProblemRow[] = PROBLEMS.map((p) => {
    const s = stats.get(p.slug);
    return {
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      status: status.get(p.slug) ?? "todo",
      acceptance: s && s.total ? Math.round((s.accepted / s.total) * 100) : null,
      solvers: s?.solvers ?? 0,
      xp: XP.problem[p.difficulty],
    };
  });
  const tags = [...new Set(PROBLEMS.flatMap((p) => p.tags))].sort();
  const by = (d: Difficulty) => ({
    total: rows.filter((r) => r.difficulty === d).length,
    solved: rows.filter((r) => r.difficulty === d && r.status === "solved").length,
  });
  const solved = rows.filter((r) => r.status === "solved").length;
  const potdSolved = status.get(potd.slug) === "solved";

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-12 lg:px-8">
      <h1 className="text-3xl font-black">Practice arena</h1>
      <p className="mt-1 font-semibold text-muted">Contest-style problems with hidden tests. Read from stdin, print to stdout.</p>

      <div className="mt-8 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <Link
          href={`/practice/${potd.slug}`}
          className="group relative overflow-hidden rounded-3xl p-6 text-white transition hover:-translate-y-1"
          style={{ background: "linear-gradient(135deg, var(--brand), #c25cff 60%, #ff7a59)", boxShadow: "0 6px 0 var(--brand-strong)" }}
        >
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider uppercase opacity-90">
            <CalendarDays className="size-4" /> Problem of the day
          </div>
          <h2 className="mt-2 text-2xl font-black">{potd.title}</h2>
          <Markdown text={potd.statement} className="mt-2 line-clamp-2 max-w-md text-sm font-semibold opacity-90 [&_code]:border-white/30 [&_code]:bg-white/15" />
          <div className="mt-5 flex items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black capitalize">{potd.difficulty}</span>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
              <BoltIcon className="size-4" /> +{XP.problem[potd.difficulty] + XP.problemOfTheDayBonus} XP
            </span>
            {potdSolved && (
              <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-success-strong">
                <CheckCircle2 className="size-4" /> Solved
              </span>
            )}
          </div>
          <span className="pointer-events-none absolute -right-6 -bottom-8 text-[140px] leading-none opacity-15 transition group-hover:scale-110">{"{}"}</span>
        </Link>

        <div className="card p-6">
          <div className="flex items-center gap-5">
            <Ring value={solved / rows.length} label={`${solved}`} sub={`/ ${rows.length}`} />
            <div className="flex-1 space-y-2.5">
              {(["easy", "medium", "hard"] as const).map((d) => {
                const s = by(d);
                return (
                  <div key={d} className="flex items-center justify-between gap-3">
                    <DifficultyBadge difficulty={d} />
                    <span className="text-sm font-black">
                      {s.solved}<span className="text-muted">/{s.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ProblemList rows={rows} tags={tags} />
      </div>
    </div>
  );
}

function Ring({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--success)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-black">{label}</div>
          <div className="text-xs font-bold text-muted">{sub} solved</div>
        </div>
      </div>
    </div>
  );
}
