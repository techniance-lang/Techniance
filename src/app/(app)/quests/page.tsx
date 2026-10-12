import { Clock } from "lucide-react";
import { GemIcon } from "@/components/icons";
import { RightRail } from "@/components/shell";
import { ProgressBar } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { GEMS } from "@/lib/game/rules";
import { formatDuration, getShellData } from "@/lib/shell";

export const metadata = { title: "Quests" };

function msUntilLocalMidnight(timeZone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return ((23 - h) * 60 + (60 - m)) * 60_000;
}

export default async function QuestsPage() {
  const user = await requireUser();
  const shell = await getShellData(user);
  const doneCount = shell.quests.filter((q) => q.done).length;

  return (
    <div className="mx-auto flex max-w-[1100px] gap-10 px-4 pt-8 lg:px-8">
      <div className="min-w-0 flex-1 pb-12">
        <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: "linear-gradient(135deg,#ff9600,#ff4b6e)", boxShadow: "0 6px 0 #c2410c" }}>
          <div className="text-xs font-extrabold tracking-wider uppercase opacity-90">Daily quests</div>
          <h1 className="mt-1 text-3xl font-black">
            {doneCount === shell.quests.length ? "All quests complete!" : `${doneCount} of ${shell.quests.length} complete`}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 font-bold opacity-90">
            <Clock className="size-4" /> New quests in {formatDuration(msUntilLocalMidnight(user.timezone))}
          </p>
          <span className="pointer-events-none absolute -right-4 -bottom-6 text-[120px] leading-none opacity-25">🎯</span>
        </div>

        <ul className="mt-8 space-y-4">
          {shell.quests.map((q) => (
            <li key={q.key} className="card flex items-center gap-5 p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface-2 text-3xl">{q.icon}</span>
              <div className="flex-1">
                <div className="font-black">{q.title}</div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={q.current / q.target} color={q.done ? "var(--success)" : "var(--gold)"} />
                  <span className="w-12 text-right text-sm font-extrabold text-muted">
                    {q.current}/{q.target}
                  </span>
                </div>
              </div>
              <div className={`flex flex-col items-center ${q.claimed ? "" : "opacity-60 grayscale"}`} title={q.claimed ? "Reward collected" : `Complete to earn ${GEMS.quest} gems`}>
                <GemIcon className="size-8" />
                <span className="text-xs font-black text-gem">{q.claimed ? "✓" : `+${GEMS.quest}`}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="card mt-8 p-5">
          <h2 className="font-black">How quests work</h2>
          <p className="mt-1 text-sm font-semibold text-muted">
            You get three quests every day. Finish one and its gems land in your wallet automatically. Hitting your daily goal earns a bonus too.
          </p>
        </div>
      </div>
      <RightRail user={user} shell={shell} />
    </div>
  );
}
