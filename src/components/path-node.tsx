"use client";

import clsx from "clsx";
import { Check, Lock, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NodeState = "done" | "current" | "locked";

export function PathNode({
  href,
  title,
  subtitle,
  state,
  offset,
  color,
  outOfHearts,
  perfect,
}: {
  href: string;
  title: string;
  subtitle: string;
  state: NodeState;
  offset: number;
  color: string;
  outOfHearts: boolean;
  perfect: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const bg = state === "locked" ? "var(--locked)" : state === "done" ? (perfect ? "var(--gold)" : color) : color;
  const edge = state === "locked" ? "var(--locked-strong)" : state === "done" && perfect ? "var(--gold-strong)" : `color-mix(in srgb, ${color} 70%, #000)`;

  return (
    <div ref={ref} className="relative" style={{ transform: `translateX(${offset}px)`, zIndex: open ? 30 : undefined }}>
      {state === "current" && !open && (
        <div className="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 animate-float rounded-xl border-2 border-line bg-surface px-3 py-1 text-sm font-black whitespace-nowrap uppercase" style={{ color }}>
          Start
          <span className="absolute -bottom-[9px] left-1/2 size-4 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-line bg-surface" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`${title} — ${state === "locked" ? "locked" : state === "done" ? "completed" : "start"}`}
        className={clsx(
          "relative grid size-[72px] place-items-center rounded-full text-white transition active:translate-y-1.5",
          state === "current" && "ring-8 ring-[color-mix(in_srgb,var(--node)_25%,transparent)]",
        )}
        style={{ background: bg, boxShadow: `0 7px 0 ${edge}`, ["--node" as string]: color }}
      >
        {state === "done" ? (
          perfect ? <Star className="size-9 fill-white" /> : <Check className="size-9" strokeWidth={4} />
        ) : state === "locked" ? (
          <Lock className="size-7 text-muted opacity-70" strokeWidth={3} />
        ) : (
          <Star className="size-9 fill-white" />
        )}
      </button>

      {open && (
        <div className="animate-pop absolute top-[92px] left-1/2 z-20 w-72 -translate-x-1/2 rounded-2xl p-4 text-white shadow-2xl" style={{ background: state === "locked" ? "var(--surface-3)" : color }}>
          <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45" style={{ background: state === "locked" ? "var(--surface-3)" : color }} />
          <div className={clsx("text-lg font-black", state === "locked" && "text-fg")}>{title}</div>
          <div className={clsx("mt-0.5 text-sm font-bold", state === "locked" ? "text-muted" : "text-white/85")}>{subtitle}</div>
          {state === "locked" ? (
            <div className="btn btn-ghost mt-4 w-full" aria-disabled>
              <Lock className="size-4" /> Locked
            </div>
          ) : outOfHearts && state === "current" ? (
            <Link href="/shop" className="btn btn-ghost mt-4 w-full">
              Out of hearts — refill
            </Link>
          ) : (
            <Link href={href} className="btn mt-4 w-full" style={{ ["--btn-bg" as string]: "#fff", ["--btn-fg" as string]: color, ["--btn-edge" as string]: "rgba(0,0,0,.2)" }}>
              {state === "done" ? "Practice +5 XP" : "Start +10 XP"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
