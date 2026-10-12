// Checks every course and problem for structural mistakes and runs each
// lesson's reference solution against its tests.  Usage: npm run verify
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { COURSES } from "../src/content/courses";
import { PROBLEMS } from "../src/content/problems";
import type { Language, TestCase } from "../src/content/types";

const normalize = (s: string) =>
  s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");

const JS_HARNESS = `
const code = require("fs").readFileSync(process.argv[1], "utf8");
const input = require("fs").readFileSync(0, "utf8");
const lines = input.split("\\n"); let i = 0;
const readline = () => (i < lines.length ? lines[i++] : undefined);
const req = (m) => { if (m === "fs") return { readFileSync: () => input }; throw new Error("no module " + m); };
new Function("readline", "require", code)(readline, req);
`;

function run(language: Language, code: string, input: string) {
  const dir = mkdtempSync(`${tmpdir()}/verify-`);
  const file = `${dir}/main`;
  writeFileSync(file, code);
  const r =
    language === "python"
      ? spawnSync("python3", [file], { input, encoding: "utf8", timeout: 10_000 })
      : spawnSync("node", ["-e", JS_HARNESS, file], { input, encoding: "utf8", timeout: 10_000 });
  return { stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const errors: string[] = [];
const ids = new Set<string>();
let checked = 0;

for (const course of COURSES) {
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      const where = `${course.slug}/${lesson.id}`;
      if (ids.has(lesson.id)) errors.push(`${where}: duplicate lesson id`);
      ids.add(lesson.id);
      lesson.steps.forEach((step, i) => {
        const at = `${where} step ${i + 1} (${step.type})`;
        if (step.type === "choice" && (step.answer < 0 || step.answer >= step.options.length)) errors.push(`${at}: answer out of range`);
        if (step.type === "fill") {
          const blanks = step.template.split("___").length - 1;
          if (blanks !== step.answers.length) errors.push(`${at}: ${blanks} blanks but ${step.answers.length} answers`);
          for (const a of step.answers) if (!step.bank.includes(a)) errors.push(`${at}: answer "${a}" missing from bank`);
        }
        if (step.type === "order" && new Set(step.lines).size !== step.lines.length) errors.push(`${at}: duplicate lines are ambiguous`);
        if (step.type === "code") {
          step.tests.forEach((t: TestCase, ti) => {
            const out = run(course.language, step.solution, t.input ?? "");
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

for (const p of PROBLEMS) {
  if (!p.samples.length) errors.push(`problem ${p.slug}: no samples`);
  if (!p.hidden.length) errors.push(`problem ${p.slug}: no hidden tests`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  console.error(`\n${errors.length} problem(s) found`);
  process.exit(1);
}
console.log(`✓ ${COURSES.length} courses, ${ids.size} lessons, ${PROBLEMS.length} problems OK — ${checked} solution tests passed`);
