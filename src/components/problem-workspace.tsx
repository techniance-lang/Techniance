"use client";

import clsx from "clsx";
import { ArrowLeft, CheckCircle2, Clock, Lightbulb, Loader2, Play, RotateCcw, Send, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LANGUAGE_LABEL, type Language, type Problem } from "@/content/types";
import type { Reward } from "@/lib/game/engine";
import { getRunner, normalizeOutput, runTests, VERDICT_LABEL, type TestResult, type Verdict } from "@/lib/runner";
import { sounds } from "@/lib/sound";
import { BoltIcon } from "./icons";
import { RewardSequence } from "./rewards";
import { DifficultyBadge, Markdown } from "./ui";

const CodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[300px] animate-pulse bg-surface-2" />,
});

export interface SubmissionRow {
  id: number;
  language: string;
  verdict: string;
  passed: number;
  total: number;
  runtimeMs: number;
  createdAt: number;
  code: string;
}

type ProblemForClient = Omit<Problem, "hidden"> & { hiddenCount: number };

const draftKey = (slug: string, lang: Language) => `draft:${slug}:${lang}`;

export function ProblemWorkspace({
  problem,
  hidden,
  initialSubmissions,
  solved,
  xp,
  potd,
}: {
  problem: ProblemForClient;
  hidden: Problem["hidden"];
  initialSubmissions: SubmissionRow[];
  solved: boolean;
  xp: number;
  potd: boolean;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(problem.starter.python);
  const [tab, setTab] = useState<"description" | "submissions">("description");
  const [panel, setPanel] = useState<"tests" | "custom" | "result">("tests");
  const [customInput, setCustomInput] = useState(problem.samples[0]?.input ?? "");
  const [customOut, setCustomOut] = useState<{ stdout: string; error: string | null; ms: number } | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [runtimeLoading, setRuntimeLoading] = useState(false);
  const [sampleResults, setSampleResults] = useState<TestResult[] | null>(null);
  const [submitResult, setSubmitResult] = useState<{ verdict: Verdict; passed: number; total: number; ms: number; failed?: TestResult; failedIndex?: number } | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [subs, setSubs] = useState(initialSubmissions);
  const [isSolved, setIsSolved] = useState(solved);
  const [reward, setReward] = useState<{ reward: Reward | null } | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Restore saved language + draft.
  useEffect(() => {
    try {
      const lang = (localStorage.getItem("lang") as Language) || "python";
      setLanguage(lang);
      setCode(localStorage.getItem(draftKey(problem.slug, lang)) ?? problem.starter[lang]);
    } catch {}
  }, [problem.slug, problem.starter]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(problem.slug, language), code);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [code, language, problem.slug]);

  useEffect(() => {
    const r = getRunner(language);
    r.warm()?.catch(() => {});
    return r.onLoading(setRuntimeLoading);
  }, [language]);

  function switchLanguage(lang: Language) {
    try {
      localStorage.setItem("lang", lang);
      setCode(localStorage.getItem(draftKey(problem.slug, lang)) ?? problem.starter[lang]);
    } catch {
      setCode(problem.starter[lang]);
    }
    setLanguage(lang);
    setSampleResults(null);
    setSubmitResult(null);
  }

  const run = useCallback(async () => {
    if (busy) return;
    setBusy("run");
    if (panel === "custom") {
      const out = await getRunner(language).run(code, customInput);
      setCustomOut({ stdout: out.stdout, error: out.timedOut ? "Time limit exceeded" : out.error, ms: out.ms });
    } else {
      setPanel("tests");
      setSampleResults(null);
      const res = await runTests(language, code, problem.samples);
      setSampleResults(res.results);
    }
    setBusy(null);
  }, [busy, panel, language, code, customInput, problem.samples]);

  async function submit() {
    if (busy) return;
    setBusy("submit");
    setPanel("result");
    setSubmitResult(null);
    const tests = [...problem.samples, ...hidden];
    setProgress({ done: 0, total: tests.length });
    const res = await runTests(language, code, tests, {
      stopOnFailure: true,
      onResult: (_, i) => setProgress({ done: i + 1, total: tests.length }),
    });
    const failedIndex = res.results.findIndex((r) => !r.passed);
    const result = {
      verdict: res.verdict,
      passed: res.passed,
      total: tests.length,
      ms: res.ms,
      failed: failedIndex >= 0 ? res.results[failedIndex] : undefined,
      failedIndex: failedIndex >= 0 ? failedIndex : undefined,
    };
    setSubmitResult(result);
    setProgress(null);
    (res.verdict === "accepted" ? sounds.correct : sounds.wrong)();

    const r = await fetch("/api/problems/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: problem.slug, language, code, verdict: res.verdict, passed: res.passed, total: tests.length, runtimeMs: res.ms }),
    });
    const data = await r.json().catch(() => null);
    if (r.ok && data) {
      setSubs((s) => [data.submission, ...s]);
      if (res.verdict === "accepted") {
        if (data.firstSolve) setReward({ reward: data.reward });
        setIsSolved(true);
      }
    }
    setBusy(null);
  }

  if (reward) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
        <RewardSequence
          title="Accepted!"
          reward={reward.reward}
          doneLabel="Back to problem"
          onDone={() => {
            setReward(null);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-dvh lg:flex-row">
      {/* Statement */}
      <section className="flex min-h-0 flex-col border-line lg:w-[44%] lg:border-r-2">
        <div className="flex items-center gap-1 border-b-2 border-line px-3 py-2">
          <Link href="/practice" className="mr-1 grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg" aria-label="Back to problems">
            <ArrowLeft className="size-5" />
          </Link>
          {(["description", "submissions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx("rounded-xl px-3 py-1.5 text-sm font-extrabold capitalize transition", tab === t ? "bg-brand-soft text-brand" : "text-muted hover:text-fg")}
            >
              {t}
              {t === "submissions" && subs.length > 0 && <span className="ml-1.5 text-xs">({subs.length})</span>}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === "description" ? (
            <article>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="mr-2 text-2xl font-black">{problem.title}</h1>
                {isSolved && (
                  <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-black text-success-strong dark:text-success">
                    <CheckCircle2 className="size-3.5" /> Solved
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={problem.difficulty} />
                <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-black text-gold">
                  <BoltIcon className="size-3.5" /> {xp} XP{potd && " · Problem of the day"}
                </span>
                {problem.tags.map((t) => (
                  <span key={t} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-bold text-muted">{t}</span>
                ))}
              </div>
              <Markdown text={problem.statement} className="mt-5 leading-relaxed" />
              <h3 className="mt-6 font-black">Input</h3>
              <Markdown text={problem.input} className="mt-1 text-muted" />
              <h3 className="mt-4 font-black">Output</h3>
              <Markdown text={problem.output} className="mt-1 text-muted" />
              <h3 className="mt-4 font-black">Constraints</h3>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 font-mono text-sm text-muted">
                {problem.constraints.map((c) => <li key={c}>{c}</li>)}
              </ul>
              {problem.samples.map((s, i) => (
                <div key={i} className="mt-6">
                  <h3 className="font-black">Example {i + 1}</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs font-extrabold text-muted uppercase">Input</div>
                      <pre className="code-block max-h-48 !p-3 text-sm">{s.input}</pre>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-extrabold text-muted uppercase">Output</div>
                      <pre className="code-block max-h-48 !p-3 text-sm">{s.expected}</pre>
                    </div>
                  </div>
                  {s.explain && <Markdown text={s.explain} className="mt-2 text-sm text-muted" />}
                </div>
              ))}
              {problem.hint && (
                <div className="mt-6">
                  <button onClick={() => setShowHint((h) => !h)} className="btn btn-ghost btn-sm">
                    <Lightbulb className="size-3.5" /> {showHint ? "Hide hint" : "Show hint"}
                  </button>
                  {showHint && <Markdown text={problem.hint} className="mt-3 rounded-2xl bg-brand-soft p-4 text-sm font-semibold" />}
                </div>
              )}
              <p className="mt-8 text-xs font-bold text-muted">
                {problem.samples.length} sample + {problem.hiddenCount} hidden tests. Output is compared line by line, ignoring trailing spaces.
              </p>
            </article>
          ) : (
            <Submissions subs={subs} onLoad={(s) => { switchLanguage(s.language as Language); setCode(s.code); }} />
          )}
        </div>
      </section>

      {/* Editor + console */}
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b-2 border-line px-3 py-2">
          <select
            aria-label="Language"
            value={language}
            onChange={(e) => switchLanguage(e.target.value as Language)}
            className="rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-sm font-bold outline-none focus:border-brand"
          >
            {(Object.keys(LANGUAGE_LABEL) as Language[]).map((l) => (
              <option key={l} value={l}>{LANGUAGE_LABEL[l]}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {runtimeLoading && (
              <span className="hidden items-center gap-1.5 text-xs font-bold text-muted sm:flex">
                <Loader2 className="size-3.5 animate-spin" /> Loading Python…
              </span>
            )}
            <button
              onClick={() => {
                if (confirm("Reset your code to the starter template?")) setCode(problem.starter[language]);
              }}
              className="grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"
              title="Reset code"
              aria-label="Reset code"
            >
              <RotateCcw className="size-4" />
            </button>
            <button onClick={run} disabled={!!busy} className="btn btn-ghost btn-sm" title="Run (Ctrl/⌘ + Enter)">
              {busy === "run" ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />} Run
            </button>
            <button onClick={submit} disabled={!!busy} className="btn btn-success btn-sm">
              {busy === "submit" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />} Submit
            </button>
          </div>
        </div>
        <div className="min-h-[320px] flex-1 overflow-hidden lg:min-h-0">
          <CodeEditor value={code} onChange={setCode} language={language} onRun={run} height="100%" minHeight="320px" />
        </div>

        {/* Console */}
        <div className="flex h-[300px] shrink-0 flex-col border-t-2 border-line">
          <div className="flex items-center gap-1 border-b-2 border-line px-3 py-1.5">
            {([
              ["tests", "Sample tests"],
              ["custom", "Custom input"],
              ["result", "Result"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setPanel(k)}
                className={clsx("rounded-lg px-3 py-1 text-xs font-extrabold transition", panel === k ? "bg-surface-3 text-fg" : "text-muted hover:text-fg")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
            {panel === "tests" &&
              (sampleResults ? (
                <div className="space-y-2">
                  {sampleResults.map((r, i) => (
                    <TestResultView key={i} index={i} r={r} />
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-sm font-bold text-muted">
                  {busy === "run" ? "Running…" : <>Press <span className="kbd">Run</span> to test your code against the examples.</>}
                </p>
              ))}
            {panel === "custom" && (
              <div className="grid h-full gap-3 sm:grid-cols-2">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  spellCheck={false}
                  className="h-full min-h-28 resize-none rounded-xl border-2 border-line bg-code p-2 font-mono text-sm outline-none focus:border-brand"
                  placeholder="stdin"
                  aria-label="Custom input"
                />
                <pre className="min-h-28 overflow-auto rounded-xl border-2 border-line bg-code p-2 font-mono text-sm whitespace-pre-wrap">
                  {customOut ? (
                    <>
                      {customOut.stdout}
                      {customOut.error && <span className="text-danger">{customOut.error}</span>}
                    </>
                  ) : (
                    <span className="text-muted">Output appears here. Press Run.</span>
                  )}
                </pre>
              </div>
            )}
            {panel === "result" && (
              <div>
                {progress && (
                  <div className="flex items-center gap-3 p-4 font-bold text-muted">
                    <Loader2 className="size-5 animate-spin" /> Judging… test {Math.min(progress.done + 1, progress.total)} of {progress.total}
                  </div>
                )}
                {submitResult && (
                  <div className="animate-pop">
                    <div className={clsx("flex items-center gap-3 text-2xl font-black", submitResult.verdict === "accepted" ? "text-success" : "text-danger")}>
                      {submitResult.verdict === "accepted" ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
                      {VERDICT_LABEL[submitResult.verdict]}
                    </div>
                    <div className="mt-1 flex gap-4 text-sm font-bold text-muted">
                      <span>{submitResult.passed}/{submitResult.total} tests passed</span>
                      <span className="flex items-center gap-1"><Clock className="size-3.5" /> {submitResult.ms} ms</span>
                    </div>
                    {submitResult.failed && submitResult.failedIndex !== undefined && (
                      <div className="mt-3">
                        {submitResult.failedIndex < problem.samples.length ? (
                          <TestResultView index={submitResult.failedIndex} r={submitResult.failed} />
                        ) : (
                          <p className="rounded-xl bg-danger-soft p-3 text-sm font-bold text-danger">
                            Failed on hidden test #{submitResult.failedIndex - problem.samples.length + 1}.
                            {submitResult.failed.error ? ` ${submitResult.failed.error.split("\n").slice(-1)[0]}` : " Think about edge cases: smallest/largest inputs, negatives, duplicates."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {!progress && !submitResult && <p className="p-4 text-center text-sm font-bold text-muted">Submit to judge your code against all tests.</p>}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TestResultView({ r, index }: { r: TestResult; index: number }) {
  const outputLines = normalizeOutput(r.stdout).split("\n").length;
  return (
    <details open={!r.passed} className={clsx("rounded-xl border-2 p-2.5", r.passed ? "border-success/50" : "border-danger/60")}>
      <summary className={clsx("cursor-pointer text-sm font-black", r.passed ? "text-success" : "text-danger")}>
        {r.passed ? "✓" : "✗"} Example {index + 1} — {VERDICT_LABEL[r.verdict]} <span className="font-bold text-muted">· {r.ms} ms</span>
      </summary>
      <div className="mt-2 grid gap-2 font-mono text-xs sm:grid-cols-3">
        <Block label="Input" text={r.input} />
        <Block label="Expected" text={r.expected} />
        <Block label={`Your output${outputLines > 1 ? ` (${outputLines} lines)` : ""}`} text={r.error ?? r.stdout} error={!!r.error} />
      </div>
    </details>
  );
}

function Block({ label, text, error }: { label: string; text: string; error?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 font-sans font-extrabold text-muted uppercase">{label}</div>
      <pre className={clsx("max-h-32 overflow-auto rounded-lg bg-code p-2 whitespace-pre-wrap", error && "text-danger")}>{text || " "}</pre>
    </div>
  );
}

function Submissions({ subs, onLoad }: { subs: SubmissionRow[]; onLoad: (s: SubmissionRow) => void }) {
  if (!subs.length) return <p className="py-16 text-center font-bold text-muted">No submissions yet. Your attempts will show up here.</p>;
  return (
    <ul className="space-y-2">
      {subs.map((s) => (
        <li key={s.id} className="card flex items-center gap-3 p-3">
          {s.verdict === "accepted" ? <CheckCircle2 className="size-6 shrink-0 text-success" /> : <XCircle className="size-6 shrink-0 text-danger" />}
          <div className="min-w-0 flex-1">
            <div className={clsx("font-black", s.verdict === "accepted" ? "text-success" : "text-danger")}>{VERDICT_LABEL[s.verdict as Verdict] ?? s.verdict}</div>
            <div className="text-xs font-bold text-muted">
              {LANGUAGE_LABEL[s.language as Language] ?? s.language} · {s.passed}/{s.total} tests · {s.runtimeMs} ms · {new Date(s.createdAt).toLocaleString()}
            </div>
          </div>
          <button onClick={() => onLoad(s)} className="btn btn-ghost btn-sm">Load code</button>
        </li>
      ))}
    </ul>
  );
}
