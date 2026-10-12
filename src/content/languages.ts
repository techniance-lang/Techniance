/**
 * Every language Techniance teaches and how its code runs:
 *  - "browser": executed locally in a Web Worker / sandboxed iframe (instant, free, works offline)
 *  - "judge":   compiled languages, executed by the Judge0 service via /api/run
 */
export type Language = "python" | "javascript" | "typescript" | "sql" | "web" | "cpp" | "java" | "go" | "rust";

export type Runtime = "browser" | "judge";

export interface LanguageInfo {
  label: string;
  /** File name shown above the editor. */
  file: string;
  runtime: Runtime;
  /** Offered in the practice arena (stdin/stdout problems). */
  practice: boolean;
}

export const LANGUAGES: Record<Language, LanguageInfo> = {
  python: { label: "Python 3", file: "main.py", runtime: "browser", practice: true },
  javascript: { label: "JavaScript", file: "main.js", runtime: "browser", practice: true },
  typescript: { label: "TypeScript", file: "main.ts", runtime: "browser", practice: true },
  sql: { label: "SQL (SQLite)", file: "query.sql", runtime: "browser", practice: false },
  web: { label: "HTML & CSS", file: "index.html", runtime: "browser", practice: false },
  cpp: { label: "C++17", file: "main.cpp", runtime: "judge", practice: true },
  java: { label: "Java", file: "Main.java", runtime: "judge", practice: true },
  go: { label: "Go", file: "main.go", runtime: "judge", practice: true },
  rust: { label: "Rust", file: "main.rs", runtime: "judge", practice: true },
};

export const LANGUAGE_LABEL = Object.fromEntries(Object.entries(LANGUAGES).map(([k, v]) => [k, v.label])) as Record<Language, string>;

export const PRACTICE_LANGUAGES = (Object.keys(LANGUAGES) as Language[]).filter((l) => LANGUAGES[l].practice);

export const isJudgeLanguage = (l: Language) => LANGUAGES[l].runtime === "judge";
