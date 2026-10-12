/* Runs learner JavaScript in an isolated worker with judge-style stdin/stdout. */

function inspect(value, depth = 0, nested = false) {
  if (typeof value === "string") return nested ? `'${value}'` : value;
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "function") return `[Function: ${value.name || "(anonymous)"}]`;
  if (typeof value === "symbol") return value.toString();
  if (typeof value !== "object") return String(value);
  if (depth > 3) return Array.isArray(value) ? "[Array]" : "[Object]";
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[ ${value.map((v) => inspect(v, depth + 1, true)).join(", ")} ]`;
  }
  if (value instanceof Set) return `Set(${value.size}) { ${[...value].map((v) => inspect(v, depth + 1, true)).join(", ")} }`;
  if (value instanceof Map)
    return `Map(${value.size}) { ${[...value].map(([k, v]) => `${inspect(k, depth + 1, true)} => ${inspect(v, depth + 1, true)}`).join(", ")} }`;
  if (value instanceof Promise) return "Promise { <pending> }";
  const keys = Object.keys(value);
  const ctor = value.constructor && value.constructor !== Object ? `${value.constructor.name} ` : "";
  if (!keys.length) return `${ctor}{}`;
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`);
  return `${ctor}{ ${keys.map((k) => `${key(k)}: ${inspect(value[k], depth + 1, true)}`).join(", ")} }`;
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const realSetTimeout = setTimeout;
const sleep = (ms) => new Promise((r) => realSetTimeout(r, ms));
let current = null; // state of the run in progress (one at a time per worker)

self.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
  if (current && !current.error) current.fail(e.reason);
});

self.onmessage = async (event) => {
  const { id, code, input } = event.data;
  let stdout = "";
  const write = (s) => {
    stdout += s;
    if (stdout.length > 1_000_000) throw new Error("Output limit exceeded (1 MB)");
  };
  const log = (...args) => write(args.map((a) => inspect(a)).join(" ") + "\n");
  const lines = String(input ?? "").replace(/\r\n/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  let cursor = 0;
  const readline = () => (cursor < lines.length ? lines[cursor++] : undefined);
  const fakeConsole = { log, info: log, warn: log, error: log, debug: log, table: log };
  const EXIT = { __exit: true };
  const fakeProcess = {
    stdout: { write: (s) => (write(String(s)), true) },
    argv: [],
    env: {},
    exit: () => {
      throw EXIT;
    },
  };
  const fakeRequire = (name) => {
    if (name === "fs") return { readFileSync: () => String(input ?? "") };
    throw new Error(`Cannot find module '${name}' (only 'fs' stdin reading is available)`);
  };

  const state = {
    error: null,
    exited: false,
    fail(e) {
      if (e === EXIT) {
        state.exited = true;
        return;
      }
      if (state.error) return;
      state.error = e instanceof Error ? `${e.name}: ${e.message}` : `Uncaught ${inspect(e)}`;
    },
  };
  current = state;

  // Timers are tracked so the run only ends once all scheduled callbacks have fired.
  const pending = new Map();
  const schedule = (repeat) => (cb, ms = 0, ...args) => {
    const handle = (repeat ? setInterval : setTimeout)(() => {
      if (!repeat) pending.delete(handle);
      if (state.error || state.exited) return;
      try {
        cb(...args);
      } catch (e) {
        state.fail(e);
      }
    }, ms);
    pending.set(handle, repeat);
    return handle;
  };
  const clear = (handle) => {
    if (!pending.has(handle)) return;
    (pending.get(handle) ? clearInterval : clearTimeout)(handle);
    pending.delete(handle);
  };

  const started = performance.now();
  try {
    const fn = new AsyncFunction(
      "console", "readline", "require", "process", "print", "input",
      "setTimeout", "setInterval", "clearTimeout", "clearInterval",
      code,
    );
    await fn(fakeConsole, readline, fakeRequire, fakeProcess, log, readline, schedule(false), schedule(true), clear, clear);
  } catch (e) {
    state.fail(e);
  }
  // Let promise chains and timers finish (an endless interval hits the time limit).
  await sleep(0);
  while (pending.size && !state.error && !state.exited) await sleep(1);
  await sleep(0);
  for (const [h, repeat] of pending) (repeat ? clearInterval : clearTimeout)(h);
  current = null;
  self.postMessage({ id, stdout, error: state.error, ms: Math.round(performance.now() - started) });
};
