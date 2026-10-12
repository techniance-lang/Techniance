"use client";

import clsx from "clsx";
import { Lightbulb, Loader2, Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Language, Step } from "@/content/types";
import { getRunner, runTests, type TestResult } from "@/lib/runner";
import { CodeView } from "../code-view";
import { Markdown } from "../ui";

const CodeEditor = dynamic(() => import("../code-editor"), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-2xl bg-surface-2" />,
});

/** Deterministic shuffle so server and client render the same order. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const a = items.map((v, i) => ({ v, i }));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Never hand back the already-solved order.
  if (a.length > 1 && a.every((x, i) => x.i === i)) a.push(a.shift()!);
  return a.map((x) => x.v);
}

export type Answer = { ready: boolean; check: () => boolean | Promise<boolean> };

interface StepProps<S extends Step> {
  step: S;
  seed: string;
  language: Language;
  /** Locked once the answer has been checked. */
  locked: boolean;
  result: "correct" | "wrong" | null;
  onAnswer: (a: Answer) => void;
}

// ---------------------------------------------------------------- learn

export function LearnStep({ step, language }: { step: Extract<Step, { type: "learn" }>; language: Language }) {
  return (
    <div className="animate-pop space-y-5">
      <div className="text-sm font-extrabold tracking-wider text-brand uppercase">New concept</div>
      <h2 className="text-2xl font-black sm:text-3xl">{step.title}</h2>
      <Markdown text={step.body} className="text-lg leading-relaxed" />
      {step.code && <CodeView code={step.code} language={language} />}
    </div>
  );
}

// ---------------------------------------------------------------- choice

export function ChoiceStep({ step, locked, result, onAnswer, language }: StepProps<Extract<Step, { type: "choice" }>>) {
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    onAnswer({ ready: picked !== null, check: () => picked === step.answer });
  }, [picked, step.answer, onAnswer]);

  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= step.options.length) setPicked(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, step.options.length]);

  const multiline = step.options.some((o) => o.includes("\n") || o.length > 40);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black whitespace-pre-line">{step.prompt}</h2>
      {step.code && <CodeView code={step.code} language={language} />}
      <div className={clsx("grid gap-3", !multiline && "sm:grid-cols-2")}>
        {step.options.map((opt, i) => {
          const state = result && i === step.answer ? "correct" : result === "wrong" && i === picked ? "wrong" : undefined;
          return (
            <button
              key={i}
              disabled={locked}
              onClick={() => setPicked(i)}
              data-selected={!result && picked === i}
              data-state={state}
              className="tile flex items-center gap-3 px-4 py-3.5 text-left font-bold"
            >
              <span className="kbd hidden shrink-0 sm:inline">{i + 1}</span>
              <span className={clsx("flex-1", (/[(){}[\]=;]/.test(opt) || opt.includes("\n")) && "font-mono text-[0.95em] whitespace-pre-wrap")}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- fill in the blanks

export function FillStep({ step, seed, locked, result, onAnswer }: StepProps<Extract<Step, { type: "fill" }>>) {
  const bank = useMemo(() => seededShuffle(step.bank.map((w, i) => ({ w, i })), seed), [step.bank, seed]);
  const blanks = step.answers.length;
  const [filled, setFilled] = useState<({ w: string; i: number } | null)[]>(() => Array(blanks).fill(null));

  useEffect(() => {
    onAnswer({
      ready: filled.every(Boolean),
      check: () => filled.every((f, i) => f?.w === step.answers[i]),
    });
  }, [filled, step.answers, onAnswer]);

  const used = new Set(filled.filter(Boolean).map((f) => f!.i));
  const place = (item: { w: string; i: number }) => {
    const slot = filled.findIndex((f) => f === null);
    if (slot === -1) return;
    setFilled((f) => f.map((x, i) => (i === slot ? item : x)));
  };
  const remove = (slot: number) => setFilled((f) => f.map((x, i) => (i === slot ? null : x)));

  const parts = step.template.split("___");
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">{step.prompt}</h2>
      <pre className="code-block leading-[2.6] whitespace-pre-wrap">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <button
                disabled={locked || !filled[i]}
                onClick={() => remove(i)}
                className={clsx(
                  "mx-0.5 inline-flex min-w-16 items-center justify-center rounded-lg border-2 border-b-4 px-2 align-middle leading-7 font-bold transition",
                  filled[i] ? "border-line bg-surface" : "border-dashed border-muted/50 bg-transparent",
                  result === "correct" && "border-success text-success",
                  result === "wrong" && filled[i]?.w !== step.answers[i] && "border-danger text-danger",
                )}
              >
                {filled[i]?.w ?? " "}
              </button>
            )}
          </span>
        ))}
      </pre>
      {result === "wrong" && (
        <p className="font-bold text-muted">
          Answer: <code className="kbd">{step.answers.join("  ·  ")}</code>
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
        {bank.map((item) => (
          <button
            key={item.i}
            disabled={locked || used.has(item.i)}
            onClick={() => place(item)}
            className={clsx("tile px-4 py-2.5 font-mono font-bold", used.has(item.i) && "!border-transparent !bg-surface-3 text-transparent")}
          >
            {item.w}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- order lines

export function OrderStep({ step, seed, locked, result, onAnswer }: StepProps<Extract<Step, { type: "order" }>>) {
  const bank = useMemo(() => seededShuffle(step.lines.map((w, i) => ({ w, i })), seed), [step.lines, seed]);
  const [picked, setPicked] = useState<{ w: string; i: number }[]>([]);

  useEffect(() => {
    onAnswer({
      ready: picked.length === step.lines.length,
      check: () => picked.every((p, i) => p.w === step.lines[i]),
    });
  }, [picked, step.lines, onAnswer]);

  const used = new Set(picked.map((p) => p.i));
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">{step.prompt}</h2>
      <div
        className={clsx(
          "min-h-40 space-y-2 rounded-2xl border-2 border-dashed p-3 transition",
          result === "correct" ? "border-success bg-success-soft" : result === "wrong" ? "border-danger bg-danger-soft" : "border-line",
        )}
      >
        {picked.length === 0 && <p className="py-12 text-center font-bold text-muted">Tap the lines below in the right order</p>}
        {picked.map((p, idx) => (
          <button
            key={p.i}
            disabled={locked}
            onClick={() => setPicked((xs) => xs.filter((_, j) => j !== idx))}
            className="tile flex w-full items-center gap-3 px-3 py-2 text-left font-mono text-sm whitespace-pre"
          >
            <span className="w-5 shrink-0 text-xs font-black text-muted">{idx + 1}</span>
            {p.w}
          </button>
        ))}
      </div>
      {result === "wrong" && <pre className="code-block text-sm">{step.lines.join("\n")}</pre>}
      <div className="space-y-2">
        {bank.map((item) =>
          used.has(item.i) ? (
            <div key={item.i} className="h-[42px] rounded-2xl bg-surface-3" />
          ) : (
            <button
              key={item.i}
              disabled={locked}
              onClick={() => setPicked((xs) => [...xs, item])}
              className="tile block w-full px-3 py-2 text-left font-mono text-sm whitespace-pre"
            >
              {item.w}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- code

export function CodeStep({ step, locked, result, onAnswer, language }: StepProps<Extract<Step, { type: "code" }>>) {
  const [code, setCode] = useState(step.starter);
  const [running, setRunning] = useState(false);
  const [runtimeLoading, setRuntimeLoading] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; error: string | null } | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const r = getRunner(language);
    r.warm()?.catch(() => {});
    return r.onLoading(setRuntimeLoading);
  }, [language]);

  useEffect(() => {
    onAnswer({
      ready: code.trim().length > 0,
      check: async () => {
        setRunning(true);
        setOutput(null);
        const res = await runTests(language, code, step.tests);
        setResults(res.results);
        setRunning(false);
        return res.verdict === "accepted";
      },
    });
  }, [code, language, step.tests, onAnswer]);

  async function run() {
    setRunning(true);
    setResults(null);
    const out = await getRunner(language).run(code, step.tests[0]?.input ?? "");
    setOutput({ stdout: out.stdout, error: out.timedOut ? "Time limit exceeded — is there an infinite loop?" : out.error });
    setRunning(false);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-extrabold tracking-wider text-brand uppercase">Code challenge</div>
      <Markdown text={step.prompt} className="text-lg font-bold" />
      <div className="overflow-hidden rounded-2xl border-2 border-line">
        <div className="flex items-center justify-between border-b-2 border-line bg-surface-2 px-3 py-2">
          <span className="font-mono text-xs font-bold text-muted">{language === "python" ? "main.py" : "main.js"}</span>
          <div className="flex items-center gap-2">
            {runtimeLoading && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <Loader2 className="size-3.5 animate-spin" /> Loading Python…
              </span>
            )}
            <button onClick={run} disabled={running || locked} className="btn btn-ghost btn-sm">
              {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run
            </button>
          </div>
        </div>
        <CodeEditor value={code} onChange={setCode} language={language} onRun={run} minHeight="200px" />
      </div>

      {output && (
        <div className="rounded-2xl border-2 border-line bg-code p-3">
          <div className="mb-1 text-xs font-extrabold text-muted uppercase">Output{step.tests[0]?.input ? " (with sample input)" : ""}</div>
          <pre className="font-mono text-sm whitespace-pre-wrap">{output.stdout || (!output.error && <span className="text-muted">(no output)</span>)}</pre>
          {output.error && <pre className="mt-1 font-mono text-sm whitespace-pre-wrap text-danger">{output.error}</pre>}
        </div>
      )}

      {results && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <details key={i} open={!r.passed} className={clsx("rounded-2xl border-2 p-3", r.passed ? "border-success/50" : "border-danger/60")}>
              <summary className={clsx("cursor-pointer text-sm font-black", r.passed ? "text-success" : "text-danger")}>
                {r.passed ? "✓" : "✗"} Test {i + 1}
              </summary>
              <div className="mt-2 grid gap-2 font-mono text-xs sm:grid-cols-3">
                {r.input && <IO label="Input" text={r.input} />}
                <IO label="Expected" text={r.expected} />
                <IO label="Your output" text={r.error ?? r.stdout} error={!!r.error} />
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowHint((s) => !s)} className="btn btn-ghost btn-sm">
          <Lightbulb className="size-3.5" /> {showHint ? "Hide hint" : "Hint"}
        </button>
        {result === "wrong" && (
          <button onClick={() => setShowSolution((s) => !s)} className="btn btn-ghost btn-sm">
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        )}
      </div>
      {showHint && <Markdown text={step.hint} className="rounded-2xl bg-brand-soft p-4 font-semibold" />}
      {showSolution && <CodeView code={step.solution} language={language} />}
    </div>
  );
}

function IO({ label, text, error }: { label: string; text: string; error?: boolean }) {
  return (
    <div>
      <div className="mb-1 font-sans font-extrabold text-muted uppercase">{label}</div>
      <pre className={clsx("max-h-40 overflow-auto rounded-lg bg-code p-2 whitespace-pre-wrap", error && "text-danger")}>{text || " "}</pre>
    </div>
  );
}
