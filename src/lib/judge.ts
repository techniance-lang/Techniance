import "server-only";

/**
 * Client for a Judge0-compatible code execution service (https://judge0.com).
 * Compiled languages (C++, Java, Go, Rust) can only run here; browser-run
 * languages can also be re-judged here so practice verdicts can't be faked.
 *
 * Configure with:
 *   JUDGE0_URL             e.g. https://judge0.example.com or https://judge0-ce.p.rapidapi.com
 *   JUDGE0_AUTH_TOKEN      (self-hosted, optional) sent as X-Auth-Token
 *   JUDGE0_RAPIDAPI_KEY    (RapidAPI, optional) sent as X-RapidAPI-Key
 *   JUDGE0_LANGUAGE_IDS    (optional) JSON overrides, e.g. {"cpp":105,"java":91}
 */

/** Judge0 CE language ids. Override with JUDGE0_LANGUAGE_IDS for newer images. */
const DEFAULT_LANGUAGE_IDS: Record<string, number> = {
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1) — class must be named Main
  go: 60, // Go (1.13.5)
  rust: 73, // Rust (1.40.0)
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
};

export interface JudgeResult {
  stdout: string;
  error: string | null;
  timedOut: boolean;
  ms: number;
}

export function judgeConfigured(): boolean {
  return Boolean(process.env.JUDGE0_URL);
}

function languageIds(): Record<string, number> {
  try {
    return { ...DEFAULT_LANGUAGE_IDS, ...(JSON.parse(process.env.JUDGE0_LANGUAGE_IDS || "{}") as Record<string, number>) };
  } catch {
    return DEFAULT_LANGUAGE_IDS;
  }
}

export function judgeSupports(language: string): boolean {
  return judgeConfigured() && language in languageIds();
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const unb64 = (s: string | null | undefined) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  status: { id: number; description: string };
}

/** Runs `code` once with `stdin`. Throws only if the judge itself is unreachable or misconfigured. */
export async function runOnJudge(language: string, code: string, stdin: string, timeLimitSec = 2): Promise<JudgeResult> {
  const base = process.env.JUDGE0_URL;
  const id = languageIds()[language];
  if (!base || !id) throw new Error(`Judge not configured for ${language}`);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_AUTH_TOKEN) headers["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
  if (process.env.JUDGE0_RAPIDAPI_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] = new URL(base).host;
  }

  const res = await fetch(`${base.replace(/\/$/, "")}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      language_id: id,
      source_code: b64(code),
      stdin: b64(stdin),
      cpu_time_limit: timeLimitSec,
      wall_time_limit: timeLimitSec * 3,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Judge responded ${res.status}`);
  const r = (await res.json()) as Judge0Response;

  const ms = Math.round(Number(r.time ?? 0) * 1000);
  const statusId = r.status?.id ?? 13;
  if (statusId === 5) return { stdout: unb64(r.stdout), error: null, timedOut: true, ms };
  if (statusId === 6) return { stdout: "", error: `Compilation error:\n${unb64(r.compile_output).trim()}`, timedOut: false, ms };
  if (statusId >= 7 && statusId <= 12) {
    const detail = unb64(r.stderr).trim() || unb64(r.message).trim() || r.status.description;
    return { stdout: unb64(r.stdout), error: `${r.status.description}${detail && detail !== r.status.description ? `\n${detail}` : ""}`, timedOut: false, ms };
  }
  if (statusId === 13 || statusId === 14) throw new Error(`Judge internal error: ${r.status.description}`);
  return { stdout: unb64(r.stdout), error: null, timedOut: false, ms };
}
