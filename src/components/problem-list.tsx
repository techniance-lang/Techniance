"use client";

import clsx from "clsx";
import { CheckCircle2, Circle, CircleDot, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Difficulty } from "@/content/types";
import { DifficultyBadge } from "./ui";

export interface ProblemRow {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  status: "solved" | "attempted" | "todo";
  acceptance: number | null;
  solvers: number;
  xp: number;
}

export function ProblemList({ rows, tags }: { rows: ProblemRow[]; tags: string[] }) {
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<ProblemRow["status"] | "all">("all");
  const [tag, setTag] = useState<string>("all");

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (difficulty === "all" || r.difficulty === difficulty) &&
          (status === "all" || r.status === status) &&
          (tag === "all" || r.tags.includes(tag)) &&
          (!q || r.title.toLowerCase().includes(q.toLowerCase()) || r.tags.some((t) => t.includes(q.toLowerCase()))),
      ),
    [rows, q, difficulty, status, tag],
  );

  const select = "rounded-xl border-2 border-line bg-surface px-3 py-2 text-sm font-bold outline-none focus:border-brand";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-48 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search problems or tags"
            className="w-full rounded-xl border-2 border-line bg-surface py-2 pr-3 pl-9 text-sm font-bold outline-none placeholder:text-muted focus:border-brand"
          />
        </label>
        <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | "all")} className={select}>
          <option value="all">All levels</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as ProblemRow["status"] | "all")} className={select}>
          <option value="all">Any status</option>
          <option value="todo">Not started</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Solved</option>
        </select>
        <select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} className={select}>
          <option value="all">All tags</option>
          {tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="hidden grid-cols-[2.5rem_1fr_6rem_6.5rem_4.5rem] gap-3 border-b-2 border-line px-4 py-2.5 text-xs font-extrabold tracking-wide text-muted uppercase sm:grid">
          <span />
          <span>Problem</span>
          <span>Difficulty</span>
          <span className="text-right">Acceptance</span>
          <span className="text-right">XP</span>
        </div>
        {filtered.length === 0 && <p className="p-10 text-center font-bold text-muted">No problems match these filters.</p>}
        {filtered.map((r, i) => (
          <Link
            key={r.slug}
            href={`/practice/${r.slug}`}
            className={clsx(
              "grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2 sm:grid-cols-[2.5rem_1fr_6rem_6.5rem_4.5rem]",
              i > 0 && "border-t-2 border-line",
            )}
          >
            <span>
              {r.status === "solved" ? (
                <CheckCircle2 className="size-6 text-success" />
              ) : r.status === "attempted" ? (
                <CircleDot className="size-6 text-gold" />
              ) : (
                <Circle className="size-6 text-line" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-black">{r.title}</span>
              <span className="mt-0.5 flex flex-wrap gap-1">
                {r.tags.map((t) => (
                  <span key={t} className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted">{t}</span>
                ))}
              </span>
            </span>
            <span><DifficultyBadge difficulty={r.difficulty} /></span>
            <span className="hidden text-right text-sm font-bold text-muted sm:block">
              {r.acceptance === null ? "—" : `${r.acceptance}%`}
              <span className="block text-[11px]">{r.solvers} solver{r.solvers === 1 ? "" : "s"}</span>
            </span>
            <span className="hidden text-right font-black text-gold sm:block">+{r.xp}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
