// Checks every course and problem for structural mistakes and runs each lesson's
// reference solution against its tests with real toolchains:
//   python → python3, javascript → node, typescript → sucrase + node, sql → sql.js,
//   cpp → g++ -std=c++17, java → javac --release 11, go → go build, rust → rustc --edition 2018.
// HTML/CSS ("web") steps need a real browser: run scripts/verify-browser.mts for those.
//
// Usage: npm run verify                 (everything)
//        npm run verify -- --course sql  (one course)
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import initSqlJs from "sql.js";
import { transform } from "sucrase";
import { resolve } from "node:path";
import type { Course, Language } from "../src/content/types";

const require = createRequire(import.meta.url);
const { formatResults } = require("../public/workers/sql-format.js") as { formatResults: (r: unknown) => string };

const arg = (name: string) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const onlyCourse = arg("--course");
// --file checks a single course module in isolation (used while authoring a course).
const onlyFile = arg("--file");
const isCourse = (v: unknown): v is Course => !!v && typeof v === "object" && "slug" in v && "units" in v;
const COURSES: Course[] = onlyFile
  ? Object.values(await import(resolve(onlyFile))).filter(isCourse)
  : (await import("../src/content/courses")).COURSES;
const PROBLEMS = onlyFile || onlyCourse ? [] : (await import("../src/content/problems")).PROBLEMS;

const normalize = (s: string) =>
  s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");

const JS_HARNESS = `
const code = require("fs").readFileSync(process.argv[1], "utf8");
const input = require("fs").readFileSync(0, "utf8");
const lines = input.split("\\n"); let i = 0;
const readline = () => (i < lines.length ? lines[i++] : undefined);
const req = (m) => { if (m === "fs") return { readFileSync: () => input }; throw new Error("no module " + m); };
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
new AsyncFunction("readline", "require", code)(readline, req).catch((e) => { console.error(e); process.exitCode = 1; });
`;

const stripTypes = (code: string) => transform(code, { transforms: ["typescript"], disableESTransforms: true }).code;

type Out = { stdout: string; stderr: string };
type Runner = (input: string) => Out;

const SQL = await initSqlJs();

/** Prepares a solution once (compiling if needed) and returns a function that runs it on an input. */
function prepare(language: Language, code: string): Runner | { compileError: string } | null {
  const dir = mkdtempSync(join(tmpdir(), "verify-"));
  const exec = (cmd: string, args: string[], input = ""): Out => {
    const r = spawnSync(cmd, args, { input, encoding: "utf8", timeout: 20_000, cwd: dir, env: { ...process.env, JAVA_TOOL_OPTIONS: "" } });
    return { stdout: r.stdout ?? "", stderr: (r.stderr ?? "") + (r.error ? String(r.error) : "") };
  };
  const compile = (cmd: string, args: string[]) => {
    const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 120_000, cwd: dir, env: { ...process.env, JAVA_TOOL_OPTIONS: "" } });
    return r.status === 0 ? null : (r.stderr || r.stdout || String(r.error)).slice(0, 2000);
  };
  switch (language) {
    case "python":
      writeFileSync(join(dir, "main.py"), code);
      return (input) => exec("python3", ["main.py"], input);
    case "javascript":
    case "typescript": {
      writeFileSync(join(dir, "main.js"), language === "typescript" ? stripTypes(code) : code);
      return (input) => exec("node", ["-e", JS_HARNESS, join(dir, "main.js")], input);
    }
    case "sql":
      return (input) => {
        const db = new SQL.Database();
        try {
          if (input.trim()) db.exec(input);
          return { stdout: formatResults(db.exec(code)), stderr: "" };
        } catch (e) {
          return { stdout: "", stderr: String(e) };
        } finally {
          db.close();
        }
      };
    case "cpp": {
      writeFileSync(join(dir, "main.cpp"), code);
      const err = compile("g++", ["-std=c++17", "-O2", "-o", "main", "main.cpp"]);
      return err ? { compileError: err } : (input) => exec(join(dir, "main"), [], input);
    }
    case "java": {
      writeFileSync(join(dir, "Main.java"), code);
      const err = compile("javac", ["--release", "11", "Main.java"]);
      return err ? { compileError: err } : (input) => exec("java", ["-cp", dir, "Main"], input);
    }
    case "go": {
      writeFileSync(join(dir, "main.go"), code);
      const err = compile("go", ["build", "-o", "main", "main.go"]);
      return err ? { compileError: err } : (input) => exec(join(dir, "main"), [], input);
    }
    case "rust": {
      writeFileSync(join(dir, "main.rs"), code);
      const err = compile("rustc", ["--edition", "2018", "-O", "-o", "main", "main.rs"]);
      return err ? { compileError: err } : (input) => exec(join(dir, "main"), [], input);
    }
    case "web":
      return null; // verified in a real browser by scripts/verify-browser.mts
  }
}

const errors: string[] = [];
const ids = new Set<string>();
let checked = 0;
let lessons = 0;
let skippedWeb = 0;

for (const course of COURSES) {
  if (onlyCourse && course.slug !== onlyCourse) continue;
  for (const unit of course.units) {
    if (ids.has(unit.id)) errors.push(`${course.slug}: duplicate unit id ${unit.id}`);
    ids.add(unit.id);
    if (!unit.lessons.length) errors.push(`${course.slug}/${unit.id}: unit has no lessons`);
    for (const lesson of unit.lessons) {
      const where = `${course.slug}/${lesson.id}`;
      if (ids.has(lesson.id)) errors.push(`${where}: duplicate lesson id`);
      ids.add(lesson.id);
      lessons++;
      if (lesson.steps.length < 3) errors.push(`${where}: fewer than 3 steps`);
      lesson.steps.forEach((step, i) => {
        const at = `${where} step ${i + 1} (${step.type})`;
        if (step.type === "choice" && (step.answer < 0 || step.answer >= step.options.length)) errors.push(`${at}: answer out of range`);
        if (step.type === "choice" && new Set(step.options).size !== step.options.length) errors.push(`${at}: duplicate options`);
        if (step.type === "fill") {
          const blanks = step.template.split("___").length - 1;
          if (blanks !== step.answers.length) errors.push(`${at}: ${blanks} blanks but ${step.answers.length} answers`);
          for (const a of step.answers) if (!step.bank.includes(a)) errors.push(`${at}: answer "${a}" missing from bank`);
        }
        if (step.type === "order" && new Set(step.lines).size !== step.lines.length) errors.push(`${at}: duplicate lines are ambiguous`);
        if (step.type === "order" && step.lines.length < 3) errors.push(`${at}: needs at least 3 lines`);
        if (step.type === "code") {
          if (!step.tests.length) errors.push(`${at}: no tests`);
          const runner = prepare(course.language, step.solution);
          if (runner === null) {
            skippedWeb += step.tests.length;
            return;
          }
          if ("compileError" in runner) {
            errors.push(`${at}: solution does not compile:\n${runner.compileError}`);
            return;
          }
          step.tests.forEach((t, ti) => {
            const out = runner(t.input ?? "");
            checked++;
            if (normalize(out.stdout) !== normalize(t.expected)) {
              errors.push(`${at} test ${ti + 1}: expected ${JSON.stringify(t.expected)} got ${JSON.stringify(out.stdout)} ${out.stderr.trim().split("\n").slice(-3).join(" | ")}`);
            }
          });
        }
      });
    }
  }
}

{
  for (const p of PROBLEMS) {
    if (!p.samples.length) errors.push(`problem ${p.slug}: no samples`);
    if (!p.hidden.length) errors.push(`problem ${p.slug}: no hidden tests`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
const courses = onlyCourse ? 1 : COURSES.length;
if (!lessons) {
  console.error("No lessons found — check --course / --file.");
  process.exit(1);
}
console.log(
  `✓ ${courses} course(s), ${lessons} lessons${PROBLEMS.length ? `, ${PROBLEMS.length} problems` : ""} OK — ${checked} solution tests passed` +
    (skippedWeb ? ` (${skippedWeb} HTML/CSS tests need scripts/verify-browser.mts)` : ""),
);
