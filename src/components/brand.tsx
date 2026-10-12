import clsx from "clsx";
import Link from "next/link";
import { useId } from "react";

/*
 * Techniance brand: a code prompt (">") whose cursor is a streak flame —
 * "write code, keep the streak". The wordmark swaps the dot of the "i" for
 * the same flame, and Byte the mascot carries it on its antenna.
 */

export const BRAND = {
  violet: "#7c5cff",
  violetDeep: "#5a3ddc",
  violetEdge: "#4128b8",
  flame: "#ff9600",
  gold: "#ffc800",
  ink: "#191b31",
};

function FlamePath({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M12 2c.6 3.2 2.6 5 4.4 6.9C18.2 10.8 20 12.9 20 16a8 8 0 0 1-16 0c0-2.6 1.2-4.5 2.6-5.9.3 1.7 1.2 2.9 2.4 3.4C8.6 9.6 10 5.4 12 2Z"
        fill={BRAND.flame}
      />
      <path d="M12 12c.4 1.6 1.4 2.4 2.2 3.3.8.9 1.3 1.6 1.3 2.7a3.5 3.5 0 0 1-7 0c0-1.9 1.4-3 2.4-3.9.6-.6 1-1.2 1.1-2.1Z" fill={BRAND.gold} />
    </g>
  );
}

/** The app-icon mark: a pressable violet tile with a prompt and a flame cursor. */
export function LogoMark({ size = 40, className, flat }: { size?: number; className?: string; flat?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={clsx("shrink-0", className)} role="img" aria-label="Techniance">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9b7dff" />
          <stop offset="1" stopColor={BRAND.violetDeep} />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!flat && <rect x="2" y="6" width="60" height="56" rx="17" fill={BRAND.violetEdge} />}
      <rect x="2" y="2" width="60" height={flat ? 60 : 56} rx="17" fill={`url(#${id}-bg)`} />
      <rect x="7" y="5" width="50" height="22" rx="11" fill={`url(#${id}-gloss)`} />
      <path d="M16 19.5 29.5 31 16 42.5" fill="none" stroke="#fff" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      <FlamePath x={29} y={17} s={1.18} />
    </svg>
  );
}

/** "techniance" with a flame for the dot of the i. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-baseline font-black tracking-[-0.035em] text-fg", className)} aria-label="techniance">
      <span aria-hidden>techn</span>
      <span aria-hidden className="relative inline-block">
        ı
        <svg viewBox="0 0 24 24" className="absolute top-[-0.02em] left-1/2 h-[0.44em] w-[0.44em] -translate-x-1/2" aria-hidden>
          <FlamePath />
        </svg>
      </span>
      <span aria-hidden>ance</span>
    </span>
  );
}

export function Logo({ className, compact, href = "/" }: { className?: string; compact?: boolean; href?: string }) {
  return (
    <Link href={href} className={clsx("group flex items-center gap-2.5", className)} aria-label="Techniance home">
      <LogoMark size={38} className="transition-transform duration-200 group-hover:-rotate-6 group-active:translate-y-0.5" />
      {!compact && <Wordmark className="text-[1.6rem] leading-none" />}
    </Link>
  );
}

export type Mood = "happy" | "cheer" | "sad" | "think" | "wave";

/** Byte — the Techniance mascot. A friendly little program with a streak flame for an antenna. */
export function Mascot({ mood = "happy", size = 120, className, bob }: { mood?: Mood; size?: number; className?: string; bob?: boolean }) {
  const id = useId().replace(/:/g, "");
  const armsUp = mood === "cheer";
  return (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} className={clsx("shrink-0 overflow-visible", bob && "animate-float", className)} role="img" aria-label={`Byte the mascot (${mood})`}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9b7dff" />
          <stop offset="1" stopColor={BRAND.violetDeep} />
        </linearGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="60" cy="124" rx="30" ry="5" fill="#000" opacity=".15" />
      {/* antenna + flame */}
      <path d="M60 34V20" stroke={BRAND.violetEdge} strokeWidth="4" strokeLinecap="round" />
      <g className={mood === "sad" ? undefined : "animate-flicker"} style={{ transformOrigin: "60px 22px", transformBox: "view-box" }}>
        <FlamePath x={49} y={mood === "sad" ? 4 : 0} s={mood === "sad" ? 0.8 : 0.95} />
      </g>
      {/* arms */}
      {armsUp ? (
        <>
          <path d="M24 70 10 46" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
          <path d="M96 70 110 46" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
        </>
      ) : mood === "wave" ? (
        <>
          <path d="M23 78 13 92" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
          <path d="M97 72 112 54" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M23 76 14 94" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
          <path d="M97 76 106 94" stroke={BRAND.violetDeep} strokeWidth="11" strokeLinecap="round" />
        </>
      )}
      {/* feet */}
      <ellipse cx="44" cy="116" rx="11" ry="7" fill={BRAND.violetEdge} />
      <ellipse cx="76" cy="116" rx="11" ry="7" fill={BRAND.violetEdge} />
      {/* body */}
      <rect x="18" y="32" width="84" height="84" rx="34" fill={BRAND.violetEdge} />
      <rect x="18" y="30" width="84" height="80" rx="34" fill={`url(#${id}-body)`} />
      <ellipse cx="60" cy="44" rx="28" ry="8" fill="#fff" opacity=".18" />
      {/* belly with code brackets */}
      <ellipse cx="60" cy="92" rx="22" ry="13" fill="#fff" opacity=".16" />
      <text x="60" y="97" textAnchor="middle" fontFamily="var(--font-mono), monospace" fontWeight="800" fontSize="13" fill="#fff" opacity=".85">
        {"</>"}
      </text>
      {/* eyes */}
      {mood === "cheer" ? (
        <>
          <path d="M37 64q7-9 14 0" fill="none" stroke={BRAND.ink} strokeWidth="5" strokeLinecap="round" />
          <path d="M69 64q7-9 14 0" fill="none" stroke={BRAND.ink} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="44" cy="62" rx="11" ry="12" fill="#fff" />
          <ellipse cx="76" cy="62" rx="11" ry="12" fill="#fff" />
          {(() => {
            const [dx, dy] = mood === "think" ? [3, -4] : mood === "sad" ? [0, 4] : [1, 1];
            return (
              <>
                <circle cx={44 + dx} cy={62 + dy} r="6" fill={BRAND.ink} />
                <circle cx={76 + dx} cy={62 + dy} r="6" fill={BRAND.ink} />
                <circle cx={46 + dx} cy={59 + dy} r="2" fill="#fff" />
                <circle cx={78 + dx} cy={59 + dy} r="2" fill="#fff" />
              </>
            );
          })()}
          {mood === "sad" && (
            <>
              {/* worried brows: inner ends raised */}
              <path d="M34 51l13-5" stroke={BRAND.ink} strokeWidth="4" strokeLinecap="round" />
              <path d="M86 51l-13-5" stroke={BRAND.ink} strokeWidth="4" strokeLinecap="round" />
            </>
          )}
          {mood === "think" && <path d="M68 46q8-5 16 0" fill="none" stroke={BRAND.ink} strokeWidth="4" strokeLinecap="round" />}
        </>
      )}
      {/* cheeks */}
      <ellipse cx="32" cy="77" rx="6" ry="4" fill="#ff7eb6" opacity=".55" />
      <ellipse cx="88" cy="77" rx="6" ry="4" fill="#ff7eb6" opacity=".55" />
      {/* mouth */}
      {mood === "cheer" ? (
        <>
          <path d="M48 74h24a12 12 0 0 1-24 0Z" fill={BRAND.ink} />
          <path d="M53 81a7 4 0 0 0 14 0 12 12 0 0 1-14 0Z" fill="#ff6b8b" />
        </>
      ) : mood === "sad" ? (
        <path d="M51 82q9-7 18 0" fill="none" stroke={BRAND.ink} strokeWidth="4.5" strokeLinecap="round" />
      ) : mood === "think" ? (
        <path d="M53 79h12" stroke={BRAND.ink} strokeWidth="4.5" strokeLinecap="round" />
      ) : (
        <path d="M50 76q10 9 20 0" fill="none" stroke={BRAND.ink} strokeWidth="4.5" strokeLinecap="round" />
      )}
      {mood === "sad" && <path d="M86 70q3 6 0 8-3-2 0-8Z" fill="#5ac8fa" />}
    </svg>
  );
}

/** Mascot with a speech bubble, for onboarding and empty states. */
export function MascotSays({ mood = "happy", children, size = 96, className }: { mood?: Mood; children: React.ReactNode; size?: number; className?: string }) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <Mascot mood={mood} size={size} bob />
      <div className="relative rounded-2xl border-2 border-line bg-surface px-4 py-3 font-bold">
        <span className="absolute top-1/2 -left-[9px] size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-line bg-surface" />
        <span className="relative">{children}</span>
      </div>
    </div>
  );
}
