"use client";

import { LANGUAGES, type Language } from "@/content/languages";
import type { TestCase } from "@/content/types";

export interface RunOutput {
  stdout: string;
  error: string | null;
  timedOut: boolean;
  ms: number;
}

/** Message the UI shows when a compiled language has no judge service configured. */
export const JUDGE_UNAVAILABLE = "judge_unavailable";

/** Interpreted-in-WebAssembly runtimes get more wall-clock time. */
const TIME_MULTIPLIER: Partial<Record<Language, number>> = { python: 3, sql: 2 };

interface Engine {
  run(code: string, input: string, timeLimitMs: number): Promise<RunOutput>;
  warm(): Promise<void> | undefined;
  onLoading(fn: (loading: boolean) => void): () => void;
}

type Pending = { resolve: (r: RunOutput) => void; timer: ReturnType<typeof setTimeout> };

/** A Web Worker runtime. Workers that load a big runtime first post {type: "ready"}. */
class WorkerEngine implements Engine {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private listeners = new Set<(loading: boolean) => void>();
  private loading = false;

  constructor(
    private url: string,
    private waitsForReady: boolean,
  ) {}

  onLoading(fn: (loading: boolean) => void) {
    this.listeners.add(fn);
    fn(this.loading);
    return () => void this.listeners.delete(fn);
  }

  private setLoading(v: boolean) {
    this.loading = v;
    this.listeners.forEach((fn) => fn(v));
  }

  warm() {
    if (this.worker && this.ready) return this.ready;
    const worker = new Worker(this.url);
    this.worker = worker;
    if (this.waitsForReady) {
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
    this.setLoading(false);
  }

  async run(code: string, input: string, limit: number): Promise<RunOutput> {
    try {
      await this.warm();
    } catch (e) {
      this.reset();
      return { stdout: "", error: `Couldn't load the runtime: ${e instanceof Error ? e.message : e}`, timedOut: false, ms: 0 };
    }
    const worker = this.worker!;
    const id = this.nextId++;
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

/** TypeScript: strip types with sucrase (loaded on demand), then run on the JS worker. */
class TypeScriptEngine implements Engine {
  constructor(private js: WorkerEngine) {}
  private sucrase: Promise<typeof import("sucrase")> | null = null;
  warm() {
    this.sucrase ??= import("sucrase");
    return this.js.warm();
  }
  onLoading(fn: (loading: boolean) => void) {
    return this.js.onLoading(fn);
  }
  async run(code: string, input: string, limit: number): Promise<RunOutput> {
    let js: string;
    try {
      const { transform } = await (this.sucrase ??= import("sucrase"));
      js = transform(code, { transforms: ["typescript"], disableESTransforms: true }).code;
    } catch (e) {
      return { stdout: "", error: `SyntaxError: ${e instanceof Error ? e.message : e}`, timedOut: false, ms: 0 };
    }
    return this.js.run(js, input, limit);
  }
}

type WebRunner = { run: (code: string, input: string) => Promise<{ stdout: string; error: string | null; ms: number }> };

/** HTML/CSS: rendered in a sandboxed, script-less iframe by /workers/web-runner.js. */
class WebEngine implements Engine {
  private script: Promise<WebRunner> | null = null;
  private load() {
    return (this.script ??= new Promise<WebRunner>((resolve, reject) => {
      const w = window as unknown as { TechnianceWebRunner?: WebRunner };
      if (w.TechnianceWebRunner) return resolve(w.TechnianceWebRunner);
      const s = document.createElement("script");
      s.src = "/workers/web-runner.js";
      s.onload = () => (w.TechnianceWebRunner ? resolve(w.TechnianceWebRunner) : reject(new Error("web runner missing")));
      s.onerror = () => {
        this.script = null;
        reject(new Error("Couldn't load the HTML runner"));
      };
      document.head.appendChild(s);
    }));
  }
  warm() {
    return this.load().then(() => undefined);
  }
  onLoading(fn: (loading: boolean) => void) {
    fn(false);
    return () => {};
  }
  async run(code: string, input: string, limit: number): Promise<RunOutput> {
    try {
      const runner = await this.load();
      const timeout = new Promise<RunOutput>((r) => setTimeout(() => r({ stdout: "", error: null, timedOut: true, ms: limit }), limit));
      const result = runner.run(code, input).then((r) => ({ stdout: r.stdout, error: r.error, timedOut: false, ms: r.ms }));
      return await Promise.race([result, timeout]);
    } catch (e) {
      return { stdout: "", error: e instanceof Error ? e.message : String(e), timedOut: false, ms: 0 };
    }
  }
}

/** Compiled languages run on the server-side judge (Judge0) through /api/run. */
class JudgeEngine implements Engine {
  constructor(private language: Language) {}
  warm() {
    return undefined;
  }
  onLoading(fn: (loading: boolean) => void) {
    fn(false);
    return () => {};
  }
  async run(code: string, input: string): Promise<RunOutput> {
    const [r] = await this.runMany(code, [input]);
    return r;
  }
  async runMany(code: string, inputs: string[]): Promise<RunOutput[]> {
    const fail = (error: string) => inputs.map(() => ({ stdout: "", error, timedOut: false, ms: 0 }));
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: this.language, code, inputs }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) return fail(JUDGE_UNAVAILABLE);
      if (!res.ok) return fail(data.error ?? `Run failed (${res.status})`);
      return data.results as RunOutput[];
    } catch {
      return fail("Couldn't reach the code runner. Check your connection.");
    }
  }
}

const engines = new Map<Language, Engine>();

function engineFor(language: Language): Engine {
  let e = engines.get(language);
  if (e) return e;
  switch (language) {
    case "python":
      e = new WorkerEngine("/workers/py-runner.js", true);
      break;
    case "javascript":
      e = new WorkerEngine("/workers/js-runner.js", false);
      break;
    case "typescript":
      e = new TypeScriptEngine(engineFor("javascript") as WorkerEngine);
      break;
    case "sql":
      e = new WorkerEngine("/workers/sql-runner.js", true);
      break;
    case "web":
      e = new WebEngine();
      break;
    default:
      e = new JudgeEngine(language);
  }
  engines.set(language, e);
  return e;
}

/** Public runner handle used by lessons and the practice workspace. */
export function getRunner(language: Language) {
  const engine = engineFor(language);
  const limitFor = (ms: number) => ms * (TIME_MULTIPLIER[language] ?? 1);
  return {
    warm: () => engine.warm(),
    onLoading: (fn: (loading: boolean) => void) => engine.onLoading(fn),
    run: (code: string, input: string, timeLimitMs = 2000) => engine.run(code, input, limitFor(timeLimitMs)),
    /** Runs several inputs; compiled languages do it in one judge round-trip. */
    runMany: (code: string, inputs: string[], timeLimitMs = 2000): Promise<RunOutput[]> =>
      engine instanceof JudgeEngine ? engine.runMany(code, inputs) : sequential(inputs, (i) => engine.run(code, i, limitFor(timeLimitMs))),
    isJudge: LANGUAGES[language].runtime === "judge",
  };
}

async function sequential<T>(inputs: string[], fn: (i: string) => Promise<T>): Promise<T[]> {
  const out: T[] = [];
  for (const i of inputs) out.push(await fn(i));
  return out;
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

function toResult(t: TestCase, out: RunOutput): TestResult {
  const v: Verdict = out.timedOut
    ? "time_limit"
    : out.error
      ? "runtime_error"
      : normalizeOutput(out.stdout) === normalizeOutput(t.expected)
        ? "accepted"
        : "wrong_answer";
  return {
    input: t.input ?? "",
    expected: t.expected,
    stdout: out.stdout,
    error: out.timedOut ? "Time limit exceeded" : out.error,
    passed: v === "accepted",
    verdict: v,
    ms: out.ms,
  };
}

export async function runTests(
  language: Language,
  code: string,
  tests: TestCase[],
  opts: { stopOnFailure?: boolean; timeLimitMs?: number; onResult?: (r: TestResult, i: number) => void } = {},
): Promise<{ results: TestResult[]; verdict: Verdict; passed: number; ms: number; judgeUnavailable?: boolean }> {
  const runner = getRunner(language);
  const results: TestResult[] = [];
  let verdict: Verdict = "accepted";

  if (runner.isJudge) {
    // One round-trip for all tests; the judge runs them server-side.
    const outs = await runner.runMany(code, tests.map((t) => t.input ?? ""), opts.timeLimitMs);
    if (outs.some((o) => o.error === JUDGE_UNAVAILABLE)) {
      return { results: [], verdict: "runtime_error", passed: 0, ms: 0, judgeUnavailable: true };
    }
    for (let i = 0; i < tests.length; i++) {
      const r = toResult(tests[i], outs[i]);
      results.push(r);
      opts.onResult?.(r, i);
      if (!r.passed && verdict === "accepted") verdict = r.verdict;
      if (!r.passed && opts.stopOnFailure) break;
    }
  } else {
    for (let i = 0; i < tests.length; i++) {
      const r = toResult(tests[i], await runner.run(code, tests[i].input ?? "", opts.timeLimitMs));
      results.push(r);
      opts.onResult?.(r, i);
      if (!r.passed && verdict === "accepted") verdict = r.verdict;
      if (!r.passed && opts.stopOnFailure) break;
    }
  }
  return { results, verdict, passed: results.filter((r) => r.passed).length, ms: Math.max(0, ...results.map((r) => r.ms)) };
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  runtime_error: "Runtime Error",
  time_limit: "Time Limit Exceeded",
};
