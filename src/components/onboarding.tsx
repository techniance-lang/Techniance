"use client";

import clsx from "clsx";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAILY_GOALS } from "@/lib/game/rules";
import { FlameIcon } from "./icons";
import { ProgressBar } from "./ui";

interface CourseCard {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  tagline: string;
  level: string;
  lessons: number;
}

export function Onboarding({ name, courses }: { name: string; courses: CourseCard[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState<string | null>(null);
  const [goal, setGoal] = useState<number>(20);
  const [busy, setBusy] = useState(false);

  async function finish() {
    setBusy(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCourse: course, dailyGoal: goal, onboarded: true }),
    });
    router.replace(`/courses/${course}`);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setStep(0)}
          className={clsx("grid size-10 place-items-center rounded-xl text-muted hover:bg-surface-2", step === 0 && "invisible")}
          aria-label="Back"
        >
          <ArrowLeft />
        </button>
        <ProgressBar value={(step + 1) / 2} />
      </div>

      <div className="flex flex-1 flex-col py-10">
        {step === 0 ? (
          <>
            <h1 className="text-3xl font-black">Hi {name}! What do you want to learn?</h1>
            <p className="mt-2 font-semibold text-muted">You can switch or add courses any time.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {courses.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCourse(c.slug)}
                  data-selected={course === c.slug}
                  className="tile flex flex-col items-center p-5 text-center"
                >
                  <span className="grid size-20 place-items-center rounded-2xl text-5xl" style={{ background: `color-mix(in srgb, ${c.color} 22%, transparent)` }}>
                    {c.emoji}
                  </span>
                  <span className="mt-4 font-black text-fg">{c.title}</span>
                  <span className="mt-1 text-sm font-semibold text-muted">{c.tagline}</span>
                  <span className="mt-3 text-xs font-extrabold tracking-wide text-muted uppercase">
                    {c.level} · {c.lessons} lessons
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <FlameIcon className="size-14 animate-flicker" />
              <div>
                <h1 className="text-3xl font-black">Pick a daily goal</h1>
                <p className="mt-1 font-semibold text-muted">Hit it every day to build your streak.</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.xp}
                  onClick={() => setGoal(g.xp)}
                  data-selected={goal === g.xp}
                  className="tile flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-black">{g.label}</span>
                  <span className="font-bold text-muted">
                    {g.xp} XP · {g.blurb}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="border-t-2 border-line pt-5">
        <div className="flex justify-end">
          {step === 0 ? (
            <button className="btn btn-success w-full sm:w-44" disabled={!course} onClick={() => setStep(1)}>
              Continue
            </button>
          ) : (
            <button className="btn btn-success w-full sm:w-44" disabled={busy} onClick={finish}>
              {busy && <Loader2 className="size-4 animate-spin" />} Start learning
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
