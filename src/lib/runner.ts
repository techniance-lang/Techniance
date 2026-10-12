"use client";

import type { Language, TestCase } from "@/content/types";

export interface RunOutput {
  stdout: string;
  error: string | null;
  timedOut: boolean;
  ms: number;
}

const WORKER_URL: Record<Language, string> = {
  javascript: "/workers/js-runner.js",
  python: "/workers/py-runner.js",
};

/** Python is interpreted inside WebAssembly, so it gets more wall-clock time. */
const TIME_MULTIPLIER: Record<Language, number> = { javascript: 1, python: 3 };

type Pending = { resolve: (r: RunOutput) => void; timer: ReturnType<typeof setTimeout> };

class Runner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private listeners = new Set<(loading: boolean) => void>();
  loading = false;

  constructor(private language: Language) {}

  onLoading(fn: (loading: boolean) => void) {
    this.listeners.add(fn);
    fn(this.loading);
    return () => void this.listeners.delete(fn);
  }

  private setLoading(v: boolean) {
    this.loading = v;
    this.listeners.forEach((fn) => fn(v));
  }

  /** Spins up the worker (and for Python, downloads the runtime) ahead of the first run. */
  warm() {
    if (this.worker && this.ready) return this.ready;
    const worker = new Worker(WORKER_URL[this.language]);
    this.worker = worker;
    if (this.language === "python") {
      this.setLoading(true);
      this.ready = new Promise<void>((resolve, reject) => {
        const onMsg = (e: MessageEvent) => {
          if (e.data?.type === "ready") {
            worker.removeEventListener("message", onMsg);
            this.setLoading(false);
            resolve();
          } else if (e.data?.type === "load-error") {
            this.setLoading(false);
            reject(new Error(e.data.error));
          }
        };
        worker.addEventListener("message", onMsg);
      });
    } else {
      this.ready = Promise.resolve();
    }
    worker.addEventListener("message", (e: MessageEvent) => {
      const { id } = e.data ?? {};
      const p = this.pending.get(id);
      if (!p) return;
      clearTimeout(p.timer);
      this.pending.delete(id);
      p.resolve({ stdout: e.data.stdout, error: e.data.error, timedOut: false, ms: e.data.ms });
    });
    worker.addEventListener("error", (e) => {
      for (const [id, p] of this.pending) {
        clearTimeout(p.timer);
        p.resolve({ stdout: "", error: e.message || "Runner crashed", timedOut: false, ms: 0 });
        this.pending.delete(id);
      }
      this.reset();
    });
    return this.ready;
  }

  private reset() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }

  async run(code: string, input: string, timeLimitMs = 2000): Promise<RunOutput> {
    await this.warm();
    const worker = this.worker!;
    const id = this.nextId++;
    const limit = timeLimitMs * TIME_MULTIPLIER[this.language];
    return new Promise<RunOutput>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        // The only way to stop an infinite loop is to kill the worker.
        this.reset();
        resolve({ stdout: "", error: null, timedOut: true, ms: limit });
      }, limit);
      this.pending.set(id, { resolve, timer });
      worker.postMessage({ id, code, input });
    });
  }
}

const runners = new Map<Language, Runner>();

export function getRunner(language: Language): Runner {
  let r = runners.get(language);
  if (!r) runners.set(language, (r = new Runner(language)));
  return r;
}

/** Judge comparison: ignore trailing spaces on each line and trailing blank lines. */
export function normalizeOutput(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

export type Verdict = "accepted" | "wrong_answer" | "runtime_error" | "time_limit";

export interface TestResult {
  input: string;
  expected: string;
  stdout: string;
  error: string | null;
  passed: boolean;
  verdict: Verdict;
  ms: number;
}

export async function runTests(
  language: Language,
  code: string,
  tests: TestCase[],
  opts: { stopOnFailure?: boolean; timeLimitMs?: number; onResult?: (r: TestResult, i: number) => void } = {},
): Promise<{ results: TestResult[]; verdict: Verdict; passed: number; ms: number }> {
  const runner = getRunner(language);
  const results: TestResult[] = [];
  let verdict: Verdict = "accepted";
  let ms = 0;
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const out = await runner.run(code, t.input ?? "", opts.timeLimitMs);
    const v: Verdict = out.timedOut
      ? "time_limit"
      : out.error
        ? "runtime_error"
        : normalizeOutput(out.stdout) === normalizeOutput(t.expected)
          ? "accepted"
          : "wrong_answer";
    const r: TestResult = {
      input: t.input ?? "",
      expected: t.expected,
      stdout: out.stdout,
      error: out.timedOut ? "Time limit exceeded" : out.error,
      passed: v === "accepted",
      verdict: v,
      ms: out.ms,
    };
    ms = Math.max(ms, out.ms);
    results.push(r);
    opts.onResult?.(r, i);
    if (v !== "accepted" && verdict === "accepted") verdict = v;
    if (v !== "accepted" && opts.stopOnFailure) break;
  }
  return { results, verdict, passed: results.filter((r) => r.passed).length, ms };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  runtime_error: "Runtime Error",
  time_limit: "Time Limit Exceeded",
};
