import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={clsx("flex items-center gap-2 font-black tracking-tight", className)}>
      <svg viewBox="0 0 64 64" className="size-9 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="16" fill="var(--brand)" />
        <path d="M22 22 12 32l10 10M42 22l10 10-10 10" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 14 29 50" stroke="#ffc800" strokeWidth="6" strokeLinecap="round" />
      </svg>
      {!compact && <span className="text-2xl text-brand">techniance</span>}
    </Link>
  );
}

export function Avatar({ name, color, size = 40, className }: { name: string; color: string; size?: number; className?: string }) {
  return (
    <span
      className={clsx("inline-grid shrink-0 place-items-center rounded-full font-black text-white uppercase", className)}
      style={{ width: size, height: size, background: color, fontSize: size * 0.42, boxShadow: `inset 0 -${size / 14}px 0 rgba(0,0,0,.18)` }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </span>
  );
}

export function ProgressBar({ value, className, color = "var(--success)", height = 16 }: { value: number; className?: string; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={clsx("relative w-full overflow-hidden rounded-full bg-surface-3", className)} style={{ height }}>
      <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, background: color }}>
        <div className="mx-2 mt-[3px] h-[30%] rounded-full bg-white/30" />
      </div>
    </div>
  );
}

/** Renders the tiny markdown subset used in course content. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className={clsx("prose-lite", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.map((l, j) => [j > 0 && <br key={`br${j}`} />, ...inline(l)])}</p>;
      })}
    </div>
  );
}

function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const tok = m[0];
    out.push(tok.startsWith("**") ? <strong key={m.index}>{tok.slice(2, -2)}</strong> : <code key={m.index}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export function DifficultyBadge({ difficulty }: { difficulty: "easy" | "medium" | "hard" }) {
  const styles = {
    easy: "bg-success-soft text-success-strong dark:text-success",
    medium: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[#b58300] dark:text-gold",
    hard: "bg-danger-soft text-danger-strong dark:text-danger",
  }[difficulty];
  return <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize", styles)}>{difficulty}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="text-lg font-black">{children}</h2>
      {action}
    </div>
  );
}
