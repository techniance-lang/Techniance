// Runs every browser-executed lesson solution (Python, JavaScript, TypeScript,
// SQL, HTML/CSS) through the real in-browser runners in headless Chromium —
// exactly what learners' code goes through.
//
// Usage: npm run verify:browser                  (all browser languages)
//        npm run verify:browser -- --course sql  (one course)
// Needs `npm install` (copies Pyodide + sql.js into public/) and a Playwright Chromium.
import { chromium } from "@playwright/test";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { transform } from "sucrase";
import { LANGUAGES } from "../src/content/languages";
import type { Course } from "../src/content/types";

const arg = (name: string) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const onlyCourse = arg("--course");
const onlyFile = arg("--file");
const isCourse = (v: unknown): v is Course => !!v && typeof v === "object" && "slug" in v && "units" in v;
const COURSES: Course[] = onlyFile
  ? Object.values(await import(resolve(onlyFile))).filter(isCourse)
  : (await import("../src/content/courses")).COURSES;
const PUBLIC = join(process.cwd(), "public");
const TYPES: Record<string, string> = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".zip": "application/zip",
  ".html": "text/html",
};

const steps: { id: string; lang: string; code: string; tests: { input?: string; expected: string }[] }[] = [];
for (const c of COURSES) {
  if (onlyCourse && c.slug !== onlyCourse) continue;
  if (LANGUAGES[c.language].runtime !== "browser") continue;
  for (const u of c.units)
    for (const l of u.lessons)
      for (const s of l.steps)
        if (s.type === "code") {
          const code = c.language === "typescript" ? transform(s.solution, { transforms: ["typescript"], disableESTransforms: true }).code : s.solution;
          steps.push({ id: l.id, lang: c.language === "typescript" ? "javascript" : c.language, code, tests: s.tests });
        }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end('<!doctype html><html><body><script src="/workers/web-runner.js"></script></body></html>');
    return;
  }
  const file = normalize(join(PUBLIC, url.pathname));
  if (!file.startsWith(PUBLIC) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});
await new Promise<void>((r) => server.listen(0, r));
const port = (server.address() as { port: number }).port;

const browser = await chromium.launch();
const page = await browser.newPage();
// tsx/esbuild wraps named functions in a __name() helper; give the page a no-op one.
await page.addInitScript({ content: "window.__name = (f) => f;" });
await page.goto(`http://127.0.0.1:${port}/`);

const result = await page.evaluate(async (steps) => {
  const norm = (s: string) => s.replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");
  const workers: Record<string, Worker> = {};
  const URLS: Record<string, string> = { python: "/workers/py-runner.js", javascript: "/workers/js-runner.js", sql: "/workers/sql-runner.js" };
  const getWorker = async (lang: string) => {
    if (workers[lang]) return workers[lang];
    const w = new Worker(URLS[lang]);
    if (lang !== "javascript") {
      await new Promise<void>((resolve, reject) =>
        w.addEventListener("message", (e) => (e.data?.type === "ready" ? resolve() : e.data?.type === "load-error" ? reject(new Error(e.data.error)) : null)),
      );
    }
    return (workers[lang] = w);
  };
  let next = 0;
  const run = async (lang: string, code: string, input: string): Promise<{ stdout: string; error: string | null; timeout?: boolean }> => {
    if (lang === "web") return (window as unknown as { TechnianceWebRunner: { run: (c: string, i: string) => Promise<{ stdout: string; error: string | null }> } }).TechnianceWebRunner.run(code, input);
    const w = await getWorker(lang);
    const id = ++next;
    return new Promise((resolve) => {
      const t = setTimeout(() => resolve({ stdout: "", error: null, timeout: true }), 20000);
      const on = (e: MessageEvent) => {
        if (e.data?.id !== id) return;
        clearTimeout(t);
        w.removeEventListener("message", on);
        resolve(e.data);
      };
      w.addEventListener("message", on);
      w.postMessage({ id, code, input });
    });
  };
  const failures: { id: string; test: number; got: string; expected: string }[] = [];
  let ran = 0;
  for (const s of steps) {
    for (const [i, t] of s.tests.entries()) {
      const r = await run(s.lang, s.code, t.input ?? "");
      ran++;
      if (r.timeout || r.error || norm(r.stdout) !== norm(t.expected)) {
        failures.push({ id: s.id, test: i + 1, got: r.timeout ? "TIMEOUT" : r.error || r.stdout, expected: t.expected });
      }
    }
  }
  return { ran, failures };
}, steps);

await browser.close();
server.close();

if (result.failures.length) {
  for (const f of result.failures) console.error(`✗ ${f.id} test ${f.test}: expected ${JSON.stringify(f.expected)} got ${JSON.stringify(f.got)}`);
  console.error(`\n${result.failures.length} of ${result.ran} browser tests failed`);
  process.exit(1);
}
console.log(`✓ ${result.ran} browser tests passed (${steps.length} code steps)`);
