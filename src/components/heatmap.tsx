import { addDays } from "@/lib/game/dates";

const WEEKS = 26;

/** GitHub-style activity grid of daily XP; frozen days show as ice. */
export function Heatmap({ today, xp, frozen }: { today: string; xp: Record<string, number>; frozen: string[] }) {
  const frozenSet = new Set(frozen);
  // Align columns to weeks ending on today's weekday column.
  const dow = new Date(`${today}T00:00:00Z`).getUTCDay();
  const start = addDays(today, -(WEEKS - 1) * 7 - dow);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
  const level = (n: number) => (n <= 0 ? 0 : n < 15 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4);
  const colors = ["var(--surface-3)", "color-mix(in srgb, var(--success) 35%, var(--surface-3))", "color-mix(in srgb, var(--success) 60%, var(--surface-3))", "color-mix(in srgb, var(--success) 85%, var(--surface-3))", "var(--success)"];

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="grid w-max grid-flow-col grid-rows-7 gap-[4px]">
          {days.map((d) => {
            const future = d > today;
            const v = xp[d] ?? 0;
            return (
              <div
                key={d}
                title={future ? "" : `${d}: ${v} XP${frozenSet.has(d) ? " (streak freeze)" : ""}`}
                className="size-[15px] rounded-[4px]"
                style={{
                  background: future ? "transparent" : frozenSet.has(d) && !v ? "#5ac8fa" : colors[level(v)],
                  outline: d === today ? "2px solid var(--brand)" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-xs font-bold text-muted">
        Less {colors.map((c, i) => <span key={i} className="size-3 rounded-[3px]" style={{ background: c }} />)} More
        <span className="ml-3 size-3 rounded-[3px] bg-[#5ac8fa]" /> Freeze
      </div>
    </div>
  );
}

export const HEATMAP_DAYS = WEEKS * 7 + 7;
