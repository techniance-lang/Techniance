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
  const keys = Object.keys(value);
  if (!keys.length) return "{}";
  const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : `'${k}'`);
  return `{ ${keys.map((k) => `${key(k)}: ${inspect(value[k], depth + 1, true)}`).join(", ")} }`;
}

self.onmessage = (event) => {
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
  const fakeProcess = {
    stdout: { write: (s) => (write(String(s)), true) },
    argv: [],
    env: {},
    exit: () => {
      throw { __exit: true };
    },
  };
  const fakeRequire = (name) => {
    if (name === "fs") return { readFileSync: () => String(input ?? "") };
    throw new Error(`Cannot find module '${name}' (only 'fs' stdin reading is available)`);
  };

  const started = performance.now();
  let error = null;
  try {
    const fn = new Function("console", "readline", "require", "process", "print", "input", code);
    fn(fakeConsole, readline, fakeRequire, fakeProcess, log, readline);
  } catch (e) {
    if (!(e && e.__exit)) {
      error = e instanceof Error ? `${e.name}: ${e.message}` : `Uncaught ${inspect(e)}`;
    }
  }
  self.postMessage({ id, stdout, error, ms: Math.round(performance.now() - started) });
};
