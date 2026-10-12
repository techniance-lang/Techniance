// Checks the practice arena end to end:
//  1. every problem in src/content/problems.ts has tests in src/content/problem-tests.json and a
//     C++17 reference solution in scripts/problem-solutions/<slug>.cpp (and vice versa);
//  2. each reference solution compiles with `g++ -std=c++17 -O2` and passes every sample + hidden test
//     (output compared after normalising trailing whitespace, like scripts/verify-content.mts).
// With --starters it also checks that every problem's starter code compiles and runs on the samples in
// every practice language (python3, node, sucrase + node, g++, javac --release 11, go, rustc --edition 2018).
//
// Usage: npx tsx scripts/verify-problems.mts                 (reference solutions)
//        npx tsx scripts/verify-problems.mts --starters      (also starter templates; slower)
//        npx tsx scripts/verify-problems.mts --only calculator
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { availableParallelism, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "sucrase";
import type { Language, TestCase } from "../src/content/types";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOLUTIONS = join(ROOT, "scripts", "problem-solutions");
const TESTS = JSON.parse(readFileSync(join(ROOT, "src", "content", "problem-tests.json"), "utf8")) as Record<
  string,
  { samples: TestCase[]; hidden: TestCase[] }
>;
const { PROBLEMS } = await import("../src/content/problems");
const { PRACTICE_LANGUAGES } = await import("../src/content/languages");

const arg = (name: string) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const only = arg("--only");
const checkStarters = process.argv.includes("--starters");
/** Reference solutions slower than this get a warning: the judge's CPU limit is 2 s. */
const SLOW_MS = 1000;

const normalize = (s: string) =>
  s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");

interface Out {
  status: number | null;
  stdout: string;
  stderr: string;
  ms: number;
  timedOut: boolean;
}

function run(cmd: string, args: string[], opts: { cwd: string; input?: string; timeoutMs: number }): Promise<Out> {
  return new Promise((done) => {
    const started = performance.now();
    const child = spawn(cmd, args, { cwd: opts.cwd, env: { ...process.env, JAVA_TOOL_OPTIONS: "" } });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, opts.timeoutMs);
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    child.on("error", (e) => (stderr += String(e)));
    child.on("close", (status) => {
      clearTimeout(timer);
      done({ status, stdout, stderr, ms: Math.round(performance.now() - started), timedOut });
    });
    child.stdin.on("error", () => {}); // the program may exit without reading all of stdin
    child.stdin.end(opts.input ?? "");
  });
}

/** Runs `tasks` with at most `limit` in flight, preserving result order. */
async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

const errors: string[] = [];
const warnings: string[] = [];
const PARALLEL = Math.max(1, availableParallelism());
const scratch = mkdtempSync(join(tmpdir(), "verify-problems-"));

// ---------------------------------------------------------------- 1. bookkeeping

const problemSlugs = PROBLEMS.map((p) => p.slug).filter((s) => !only || s === only);
if (only && !problemSlugs.length) {
  console.error(`No problem with slug "${only}".`);
  process.exit(1);
}
if (!only) {
  const solutionFiles = readdirSync(SOLUTIONS).filter((f) => f.endsWith(".cpp")).map((f) => f.slice(0, -4));
  for (const slug of Object.keys(TESTS)) if (!PROBLEMS.some((p) => p.slug === slug)) errors.push(`${slug}: has tests but no problem in problems.ts`);
  for (const slug of solutionFiles) if (!PROBLEMS.some((p) => p.slug === slug)) errors.push(`${slug}.cpp: solution for an unknown problem`);
  const seen = new Set<string>();
  for (const p of PROBLEMS) {
    if (seen.has(p.slug)) errors.push(`${p.slug}: duplicate slug`);
    seen.add(p.slug);
    for (const lang of PRACTICE_LANGUAGES) if (!p.starter[lang]?.trim()) errors.push(`${p.slug}: no ${lang} starter`);
  }
}

// ---------------------------------------------------------------- 2. reference solutions

interface Report {
  slug: string;
  tests: number;
  passed: number;
  slowestMs: number;
}

async function checkSolution(slug: string): Promise<Report> {
  const report: Report = { slug, tests: 0, passed: 0, slowestMs: 0 };
  const src = join(SOLUTIONS, `${slug}.cpp`);
  const tests = TESTS[slug];
  if (!tests) {
    errors.push(`${slug}: no tests in problem-tests.json (run python3 scripts/gen_tests.py)`);
    return report;
  }
  if (!existsSync(src)) {
    errors.push(`${slug}: missing reference solution scripts/problem-solutions/${slug}.cpp`);
    return report;
  }
  const dir = mkdtempSync(join(scratch, `${slug}-`));
  const bin = join(dir, "main");
  const compiled = await run("g++", ["-std=c++17", "-O2", "-o", bin, src], { cwd: dir, timeoutMs: 120_000 });
  if (compiled.status !== 0) {
    errors.push(`${slug}: reference solution does not compile:\n${(compiled.stderr || compiled.stdout).slice(0, 2000)}`);
    return report;
  }
  const cases = [...tests.samples.map((t, i) => ({ t, name: `sample ${i + 1}` })), ...tests.hidden.map((t, i) => ({ t, name: `hidden ${i + 1}` }))];
  for (const { t, name } of cases) {
    report.tests++;
    const out = await run(bin, [], { cwd: dir, input: t.input ?? "", timeoutMs: 10_000 });
    report.slowestMs = Math.max(report.slowestMs, out.ms);
    if (out.timedOut) errors.push(`${slug} ${name}: timed out`);
    else if (out.status !== 0) errors.push(`${slug} ${name}: exit code ${out.status} ${out.stderr.trim().split("\n").slice(-3).join(" | ")}`);
    else if (normalize(out.stdout) !== normalize(t.expected)) {
      const clip = (s: string) => JSON.stringify(s.length > 200 ? `${s.slice(0, 200)}…` : s);
      errors.push(`${slug} ${name}: expected ${clip(normalize(t.expected))} got ${clip(normalize(out.stdout))}`);
    } else report.passed++;
  }
  if (report.slowestMs > SLOW_MS) warnings.push(`${slug}: slowest test took ${report.slowestMs} ms in the C++ reference solution`);
  return report;
}

const reports = await pool(problemSlugs.map((slug) => () => checkSolution(slug)), PARALLEL);

// ---------------------------------------------------------------- 3. starter templates (optional)

const JS_HARNESS = `
const code = require("fs").readFileSync(process.argv[1], "utf8");
const input = require("fs").readFileSync(0, "utf8");
const lines = input.split("\\n"); let i = 0;
const readline = () => (i < lines.length ? lines[i++] : undefined);
const req = (m) => { if (m === "fs") return { readFileSync: () => input }; throw new Error("no module " + m); };
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
new AsyncFunction("readline", "require", code)(readline, req).catch((e) => { console.error(e); process.exitCode = 1; });
`;

/** Compiles a starter if needed; returns the command that runs it, or a compile error. */
async function prepareStarter(lang: Language, code: string, dir: string): Promise<{ cmd: string; args: string[] } | { error: string }> {
  const compile = async (cmd: string, args: string[]) => {
    const r = await run(cmd, args, { cwd: dir, timeoutMs: 180_000 });
    return r.status === 0 ? null : (r.stderr || r.stdout).slice(0, 2000);
  };
  const write = (file: string, text: string) => writeFileSync(join(dir, file), text);
  let err: string | null = null;
  switch (lang) {
    case "python":
      write("main.py", code);
      return { cmd: "python3", args: ["main.py"] };
    case "javascript":
    case "typescript":
      write("main.js", lang === "typescript" ? transform(code, { transforms: ["typescript"], disableESTransforms: true }).code : code);
      return { cmd: "node", args: ["-e", JS_HARNESS, join(dir, "main.js")] };
    case "cpp":
      write("main.cpp", code);
      err = await compile("g++", ["-std=c++17", "-O2", "-o", "main", "main.cpp"]);
      return err ? { error: err } : { cmd: join(dir, "main"), args: [] };
    case "java":
      write("Main.java", code);
      err = await compile("javac", ["--release", "11", "Main.java"]);
      return err ? { error: err } : { cmd: "java", args: ["-cp", dir, "Main"] };
    case "go":
      write("main.go", code);
      err = await compile("go", ["build", "-o", "main", "main.go"]);
      return err ? { error: err } : { cmd: join(dir, "main"), args: [] };
    case "rust":
      write("main.rs", code);
      err = await compile("rustc", ["--edition", "2018", "-O", "-o", "main", "main.rs"]);
      return err ? { error: err } : { cmd: join(dir, "main"), args: [] };
    default:
      return { error: `${lang} is not a practice language` };
  }
}

let startersChecked = 0;
if (checkStarters) {
  const jobs = PROBLEMS.filter((p) => problemSlugs.includes(p.slug)).flatMap((p) =>
    PRACTICE_LANGUAGES.map((lang) => async () => {
      const code = p.starter[lang];
      if (!code) return;
      const dir = mkdtempSync(join(scratch, `starter-${p.slug}-${lang}-`));
      const prepared = await prepareStarter(lang, code, dir);
      if ("error" in prepared) {
        errors.push(`${p.slug} ${lang} starter does not compile:\n${prepared.error}`);
        return;
      }
      for (const [i, t] of p.samples.entries()) {
        const out = await run(prepared.cmd, prepared.args, { cwd: dir, input: t.input ?? "", timeoutMs: 20_000 });
        if (out.timedOut || out.status !== 0)
          errors.push(`${p.slug} ${lang} starter fails on sample ${i + 1}: ${out.timedOut ? "timed out" : `exit ${out.status}`} ${out.stderr.trim().split("\n").slice(-3).join(" | ")}`);
      }
      startersChecked++;
    }),
  );
  await pool(jobs, PARALLEL);
}

rmSync(scratch, { recursive: true, force: true });

// ---------------------------------------------------------------- summary

const totalTests = reports.reduce((s, r) => s + r.tests, 0);
const totalPassed = reports.reduce((s, r) => s + r.passed, 0);
const width = Math.max(...reports.map((r) => r.slug.length));
for (const r of reports) {
  const mark = r.tests && r.passed === r.tests ? "✓" : "✗";
  console.log(`${mark} ${r.slug.padEnd(width)}  ${String(r.passed).padStart(3)}/${String(r.tests).padEnd(3)} tests  slowest ${r.slowestMs} ms`);
}
for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  console.error(`\n${errors.map((e) => `✗ ${e}`).join("\n")}`);
  console.error(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
console.log(
  `\n✓ ${reports.length} reference solutions passed ${totalPassed}/${totalTests} tests` +
    (checkStarters ? `; ${startersChecked} starter templates compile and run on the samples` : ""),
);
