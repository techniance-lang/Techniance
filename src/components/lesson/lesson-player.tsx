"use client";

import clsx from "clsx";
import { CheckCircle2, Volume2, VolumeX, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language, Step } from "@/content/types";
import type { Reward } from "@/lib/game/engine";
import { setSoundEnabled, soundEnabled, sounds } from "@/lib/sound";
import { HeartIcon } from "../icons";
import { RewardSequence } from "../rewards";
import { ProgressBar } from "../ui";
import { ChoiceStep, CodeStep, FillStep, LearnStep, OrderStep, type Answer } from "./steps";

const PRAISE = ["Nice!", "Great job!", "Correct!", "Awesome!", "You got it!", "Excellent!"];

export function LessonPlayer({
  lessonId,
  lessonTitle,
  steps,
  language,
  initialHearts,
  practice,
  exitHref,
}: {
  lessonId: string;
  lessonTitle: string;
  steps: Step[];
  language: Language;
  initialHearts: number;
  /** Replays of completed lessons don't cost hearts. */
  practice: boolean;
  exitHref: string;
}) {
  const router = useRouter();
  // Queue of step indices; questions answered wrong are re-queued at the end.
  const [queue, setQueue] = useState<number[]>(() => steps.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [attemptKey, setAttemptKey] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [checking, setChecking] = useState(false);
  const [hearts, setHearts] = useState(initialHearts);
  const [stats, setStats] = useState({ correct: 0, attempts: 0 });
  const [combo, setCombo] = useState(0);
  const [solved, setSolved] = useState(0);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [done, setDone] = useState<{ reward: Reward | null; accuracy: number } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [muted, setMuted] = useState(false);
  const answer = useRef<Answer>({ ready: false, check: () => false });
  const [ready, setReady] = useState(false);
  const startedAt = useRef(Date.now());
  const seconds = useRef(0);

  useEffect(() => setMuted(!soundEnabled()), []);

  const stepIndex = queue[pos];
  const step = steps[stepIndex];
  const progress = done ? 1 : solved / steps.length;
  const outOfHearts = !practice && hearts <= 0;

  const onAnswer = useCallback((a: Answer) => {
    answer.current = a;
    setReady(a.ready);
  }, []);

  const finish = useCallback(
    async (finalStats: { correct: number; attempts: number }) => {
      seconds.current = Math.round((Date.now() - startedAt.current) / 1000);
      const attempts = Math.max(1, finalStats.attempts);
      const res = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, correct: finalStats.correct, attempts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(data.error ?? "Couldn't save your progress");
        return;
      }
      setDone({ reward: data.reward, accuracy: data.accuracy });
    },
    [lessonId],
  );

  const advance = useCallback(() => {
    // Wrong answers on regular questions are re-queued, so they don't count yet.
    if (!(result === "wrong" && step?.type !== "code")) setSolved((n) => n + 1);
    const isLast = pos >= queue.length - 1;
    if (isLast) {
      void finish(stats);
      return;
    }
    setPos((p) => p + 1);
    setResult(null);
    setReady(false);
    setAttemptKey((k) => k + 1);
  }, [pos, queue.length, finish, stats, result, step]);

  const check = useCallback(async () => {
    if (!step) return;
    if (step.type === "learn") {
      advance();
      return;
    }
    if (!answer.current.ready || checking) return;
    setChecking(true);
    const ok = await answer.current.check();
    setChecking(false);
    setStats((s) => ({ correct: s.correct + (ok ? 1 : 0), attempts: s.attempts + 1 }));
    setResult(ok ? "correct" : "wrong");
    if (ok) {
      sounds.correct();
      setCombo((c) => c + 1);
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    } else {
      sounds.wrong();
      setCombo(0);
      // Code steps are retried in place; other questions come back later in the lesson.
      if (step.type !== "code") setQueue((q) => [...q, stepIndex]);
      if (!practice && step.type !== "code") {
        setHearts((h) => Math.max(0, h - 1));
        fetch("/api/lesson/heart", { method: "POST" }).catch(() => {});
      }
    }
  }, [step, advance, checking, practice, stepIndex]);

  const retry = () => {
    setResult(null);
    setReady(answer.current.ready);
  };

  // Enter = check / continue
  useEffect(() => {
    if (done || outOfHearts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;
      const t = e.target as HTMLElement;
      if (t.closest(".cm-editor")) return;
      e.preventDefault();
      if (result === "correct" || (result === "wrong" && step?.type !== "code")) advance();
      else if (result === "wrong") retry();
      else void check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done) {
    return (
      <RewardSequence
        title={done.accuracy === 100 ? "Perfect lesson!" : "Lesson complete!"}
        reward={done.reward}
        accuracy={done.accuracy}
        seconds={seconds.current}
        onDone={() => {
          router.push(exitHref);
          router.refresh();
        }}
      />
    );
  }

  const stepProps = {
    seed: `${lessonId}:${stepIndex}:${pos}`,
    language,
    locked: result !== null || checking,
    result,
    onAnswer,
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-4 pt-6 pb-2">
        <button onClick={() => setConfirmQuit(true)} className="text-muted transition hover:text-fg" aria-label="Quit lesson">
          <X className="size-7" strokeWidth={2.6} />
        </button>
        <div className="relative flex-1">
          <ProgressBar value={progress} />
          {combo >= 3 && (
            <span key={combo} className="animate-pop absolute -top-6 left-[var(--x)] -translate-x-1/2 text-xs font-black whitespace-nowrap text-flame" style={{ ["--x" as string]: `${Math.max(8, progress * 100)}%` }}>
              {combo} IN A ROW 🔥
            </span>
          )}
        </div>
        <button
          onClick={() => {
            setSoundEnabled(muted);
            setMuted(!muted);
          }}
          className="text-muted transition hover:text-fg"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
        </button>
        <div className={clsx("flex items-center gap-1.5 text-lg font-black", practice ? "text-muted" : "text-heart")} title={practice ? "Practice mode — hearts aren't used" : "Hearts"}>
          <HeartIcon className="size-7" dim={practice || hearts === 0} /> {practice ? "∞" : hearts}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {pos >= steps.length && result === null && <div className="mb-4 text-sm font-extrabold text-flame uppercase">⟲ Previous mistake</div>}
        <div key={`${pos}-${attemptKey}`} className={clsx(result === "wrong" && step?.type !== "code" && "animate-shake")}>
          {step.type === "learn" && <LearnStep step={step} language={language} />}
          {step.type === "choice" && <ChoiceStep step={step} {...stepProps} />}
          {step.type === "fill" && <FillStep step={step} {...stepProps} />}
          {step.type === "order" && <OrderStep step={step} {...stepProps} />}
          {step.type === "code" && <CodeStep step={step} {...stepProps} />}
        </div>
      </div>

      {/* Footer / feedback */}
      <div
        className={clsx(
          "sticky bottom-0 border-t-2 transition-colors",
          result === "correct" ? "border-transparent bg-success-soft" : result === "wrong" ? "border-transparent bg-danger-soft" : "border-line bg-bg",
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          {result ? (
            <div className="flex animate-pop items-start gap-3">
              {result === "correct" ? <CheckCircle2 className="size-10 shrink-0 text-success" /> : <XCircle className="size-10 shrink-0 text-danger" />}
              <div>
                <div className={clsx("text-xl font-black", result === "correct" ? "text-success-strong dark:text-success" : "text-danger-strong dark:text-danger")}>
                  {result === "correct" ? praise : step.type === "code" ? "Not quite — check the failing tests" : "Not quite"}
                </div>
                {"explain" in step && <p className={clsx("mt-0.5 max-w-xl text-sm font-semibold", result === "correct" ? "text-success-strong dark:text-success" : "text-danger-strong dark:text-danger")}>{step.explain}</p>}
              </div>
            </div>
          ) : (
            <span className="hidden text-sm font-bold text-muted sm:block">
              {step.type === "learn" ? "Read, then continue" : <>Press <span className="kbd">Enter</span> to check</>}
            </span>
          )}
          {result === "wrong" && step.type === "code" ? (
            <div className="flex gap-2">
              <button onClick={advance} className="btn btn-ghost flex-1 sm:w-32 sm:flex-none">Skip</button>
              <button onClick={retry} className="btn btn-danger flex-1 sm:w-40 sm:flex-none">Try again</button>
            </div>
          ) : result ? (
            <button onClick={advance} className={clsx("btn w-full sm:w-44", result === "correct" ? "btn-success" : "btn-danger")} autoFocus>
              Continue
            </button>
          ) : (
            <button onClick={() => void check()} disabled={step.type !== "learn" && (!ready || checking)} className="btn btn-success w-full sm:w-44">
              {step.type === "learn" ? "Continue" : checking ? "Running…" : "Check"}
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <Modal>
          <div className="text-5xl">⚠️</div>
          <h2 className="mt-4 text-2xl font-black">Couldn&apos;t save progress</h2>
          <p className="mt-2 font-semibold text-muted">{saveError}</p>
          <button className="btn mt-6 w-full" onClick={() => { setSaveError(null); void finish(stats); }}>Retry</button>
          <Link href={exitHref} className="btn btn-ghost mt-3 w-full">Leave</Link>
        </Modal>
      )}

      {outOfHearts && !result && (
        <Modal>
          <HeartIcon className="mx-auto size-20" dim />
          <h2 className="mt-4 text-2xl font-black">You ran out of hearts</h2>
          <p className="mt-2 font-semibold text-muted">Hearts refill over time, or get a full refill in the shop. Replaying finished lessons never costs hearts.</p>
          <Link href="/shop" className="btn btn-gem mt-6 w-full">Refill hearts</Link>
          <Link href={exitHref} className="btn btn-ghost mt-3 w-full">Quit lesson</Link>
        </Modal>
      )}

      {confirmQuit && (
        <Modal onClose={() => setConfirmQuit(false)}>
          <div className="text-5xl">🥺</div>
          <h2 className="mt-4 text-2xl font-black">Wait, don&apos;t go!</h2>
          <p className="mt-2 font-semibold text-muted">You&apos;ll lose your progress in &ldquo;{lessonTitle}&rdquo; if you quit now.</p>
          <button className="btn mt-6 w-full" onClick={() => setConfirmQuit(false)} autoFocus>Keep learning</button>
          <Link href={exitHref} className="mt-4 block text-sm font-extrabold text-danger uppercase hover:underline">End session</Link>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="card animate-pop w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
