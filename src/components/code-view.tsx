import clsx from "clsx";
import type { ReactNode } from "react";
import type { Language } from "@/content/types";

const KEYWORDS: Record<Language, string[]> = {
  python: "def return if elif else for while in not and or is None True False import from as class pass break continue lambda try except finally with yield global print len range input int str float list dict set map sorted sum max min".split(" "),
  javascript: "const let var function return if else for while of in new class this true false null undefined typeof instanceof break continue switch case default try catch finally throw async await console log readline Math Number String Object Array Set Map".split(" "),
};

const TOKEN = /(#[^\n]*|\/\/[^\n]*|`(?:\\.|[^`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;

/** Tiny tokenizer for read-only snippets — enough for lesson-sized code. */
export function highlight(code: string, language: Language): ReactNode[] {
  const kw = new Set(KEYWORDS[language]);
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(code))) {
    const tok = m[0];
    if (m.index > last) out.push(code.slice(last, m.index));
    let cls: string | null = null;
    if ((language === "python" && tok.startsWith("#")) || (language === "javascript" && tok.startsWith("//"))) cls = "text-muted italic";
    else if (tok.startsWith("#") || tok.startsWith("//")) {
      // Not a comment in this language: emit first char and continue scanning after it.
      out.push(tok[0]);
      last = m.index + 1;
      TOKEN.lastIndex = last;
      continue;
    } else if (/^["'`]/.test(tok)) cls = "text-[#22a35a] dark:text-[#7ee2a8]";
    else if (/^\d/.test(tok)) cls = "text-[#d9730d] dark:text-[#ffb46b]";
    else if (kw.has(tok)) cls = "text-brand font-semibold";
    else if (code[m.index + tok.length] === "(") cls = "text-[#1a7fd4] dark:text-[#6cc4ff]";
    out.push(cls ? <span key={m.index} className={cls}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeView({ code, language, className }: { code: string; language: Language; className?: string }) {
  return <pre className={clsx("code-block", className)}>{highlight(code, language)}</pre>;
}
