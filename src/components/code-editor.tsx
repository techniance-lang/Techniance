"use client";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror, { EditorView, keymap, Prec } from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";
import type { Language } from "@/content/types";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setTheme(el.dataset.theme === "light" ? "light" : "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// Highest precedence so the app palette wins over the light/oneDark themes.
const baseTheme = Prec.highest(
  EditorView.theme({
    "&": { fontSize: "14px", height: "100%", backgroundColor: "var(--code-bg)" },
    ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
    ".cm-content": { padding: "12px 0" },
    ".cm-gutters": { border: "none", backgroundColor: "var(--code-bg)", color: "var(--muted)" },
    ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "color-mix(in srgb, var(--brand) 8%, transparent)" },
    "&.cm-focused": { outline: "none" },
  }),
);

export default function CodeEditor({
  value,
  onChange,
  language,
  onRun,
  minHeight = "220px",
  height,
}: {
  value: string;
  onChange: (v: string) => void;
  language: Language;
  onRun?: () => void;
  minHeight?: string;
  height?: string;
}) {
  const theme = useTheme();
  const extensions = useMemo(
    () => [
      language === "python" ? python() : javascript(),
      baseTheme,
      EditorView.lineWrapping,
      keymap.of([{ key: "Mod-Enter", run: () => (onRun?.(), true) }]),
    ],
    [language, onRun],
  );
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={theme === "dark" ? oneDark : "light"}
      basicSetup={{ foldGutter: false, highlightActiveLineGutter: true, autocompletion: true, tabSize: 4 }}
      indentWithTab
      minHeight={minHeight}
      height={height}
      className="h-full"
    />
  );
}
