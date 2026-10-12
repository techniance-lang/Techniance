"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  useEffect(() => setTheme((document.documentElement.dataset.theme as "light" | "dark") ?? "dark"), []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className={`grid size-10 place-items-center rounded-xl border-2 border-line text-muted transition hover:bg-surface-2 hover:text-fg ${className}`}
    >
      {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}
