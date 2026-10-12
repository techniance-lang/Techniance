"use client";

import confetti from "canvas-confetti";
import { Clock, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Reward } from "@/lib/game/engine";
import { levelTitle } from "@/lib/game/rules";
import { sounds } from "@/lib/sound";
import { BoltIcon, FlameIcon, GemIcon } from "./icons";

function burst() {
  const colors = ["#7c5cff", "#ffc800", "#22c06b", "#1cb0f6", "#ff4b6e"];
  confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors, disableForReducedMotion: true });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, disableForReducedMotion: true }), 200);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, disableForReducedMotion: true }), 350);
}

type Screen = "summary" | "streak" | "level" | "unlocks";

export function RewardSequence({
  title,
  reward,
  accuracy,
  seconds,
  onDone,
  doneLabel = "Continue",
}: {
  title: string;
  reward: Reward | null;
  accuracy?: number;
  seconds?: number;
  onDone: () => void;
  doneLabel?: string;
}) {
  const screens = useMemo(() => {
    const s: Screen[] = ["summary"];
    if (reward?.streakExtended) s.push("streak");
    if (reward?.levelUp) s.push("level");
    if (reward && (reward.achievements.length || reward.quests.length || reward.dailyGoalReached)) s.push("unlocks");
    return s;
  }, [reward]);
  const [i, setI] = useState(0);
  const screen = screens[i];

  useEffect(() => {
    sounds.complete();
    burst();
  }, []);
  useEffect(() => {
    if (i > 0) burst();
  }, [i]);

  const next = () => (i < screens.length - 1 ? setI(i + 1) : onDone());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && next();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <div key={screen} className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        {screen === "summary" && (
          <>
            <div className="animate-pop text-7xl">🎉</div>
            <h1 className="mt-6 text-3xl font-black text-gold sm:text-4xl">{title}</h1>
            {reward?.boosted && <p className="mt-2 font-black text-gold">Double XP active!</p>}
            <div className="mt-10 flex w-full flex-wrap justify-center gap-3 [&>*]:w-[calc(50%-0.375rem)] sm:[&>*]:w-32">
              <StatCard label="Total XP" color="var(--gold)" icon={<BoltIcon className="size-5" />} value={`+${reward?.xp ?? 0}`} delay={0} />
              {accuracy !== undefined && (
                <StatCard label={accuracy === 100 ? "Perfect!" : "Accuracy"} color="var(--success)" icon={<Target className="size-5" />} value={`${accuracy}%`} delay={120} />
              )}
              {seconds !== undefined && (
                <StatCard label="Time" color="var(--gem)" icon={<Clock className="size-5" />} value={`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`} delay={240} />
              )}
              {reward && reward.gems > 0 && (
                <StatCard label="Gems" color="var(--gem)" icon={<GemIcon className="size-5" />} value={`+${reward.gems}`} delay={360} />
              )}
            </div>
            {!reward && <p className="mt-8 font-bold text-muted">Already solved — no XP this time, but nice practice!</p>}
          </>
        )}

        {screen === "streak" && reward && (
          <>
            <div className="relative">
              <FlameIcon className="size-40 animate-flicker" />
            </div>
            <div className="animate-pop mt-2 text-8xl font-black text-flame">{reward.streak}</div>
            <h1 className="mt-2 text-3xl font-black text-flame">day streak!</h1>
            <p className="mt-4 max-w-sm font-bold text-muted">
              {reward.streak === 1 ? "Day one. Come back tomorrow to keep it going!" : "You're on fire! Practice every day to keep your streak alive."}
            </p>
          </>
        )}

        {screen === "level" && reward?.levelUp && (
          <>
            <div className="animate-pop grid size-36 place-items-center rounded-full bg-brand text-6xl font-black text-white shadow-[0_8px_0_var(--brand-strong)]">
              {reward.levelUp}
            </div>
            <h1 className="mt-8 text-3xl font-black text-brand">Level up!</h1>
            <p className="mt-2 text-lg font-bold text-muted">
              You reached level {reward.levelUp} — {levelTitle(reward.levelUp)}.
            </p>
          </>
        )}

        {screen === "unlocks" && reward && (
          <>
            <h1 className="text-3xl font-black">Rewards unlocked</h1>
            <div className="mt-8 w-full space-y-3 text-left">
              {reward.dailyGoalReached && (
                <UnlockRow icon="🎯" title="Daily goal reached!" subtitle={`${reward.dailyGoal} XP today`} />
              )}
              {reward.quests.map((q) => (
                <UnlockRow key={q.key} icon={q.icon} title="Quest complete" subtitle={q.title} />
              ))}
              {reward.achievements.map((a) => (
                <UnlockRow key={a.key} icon={a.icon} title={`Achievement: ${a.title}`} subtitle={a.description} highlight />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="border-t-2 border-line px-4 py-5">
        <div className="mx-auto flex max-w-xl justify-end">
          <button onClick={next} className="btn btn-lg w-full sm:w-48" autoFocus>
            {i < screens.length - 1 ? "Continue" : doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, delay }: { label: string; value: string; color: string; icon: React.ReactNode; delay: number }) {
  return (
    <div className="animate-pop overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color, animationDelay: `${delay}ms` }}>
      <div className="py-1 text-xs font-black tracking-wide text-white uppercase">{label}</div>
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-surface py-3 text-xl font-black" style={{ color }}>
        {icon} {value}
      </div>
    </div>
  );
}

function UnlockRow({ icon, title, subtitle, highlight }: { icon: string; title: string; subtitle: string; highlight?: boolean }) {
  return (
    <div className={`animate-pop card flex items-center gap-4 p-4 ${highlight ? "border-gold" : ""}`}>
      <span className="text-4xl">{icon}</span>
      <div className="flex-1">
        <div className="font-black">{title}</div>
        <div className="text-sm font-bold text-muted">{subtitle}</div>
      </div>
      <GemIcon className="size-6" />
    </div>
  );
}
