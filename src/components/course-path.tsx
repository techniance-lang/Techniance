import { BookOpen } from "lucide-react";
import type { Course } from "@/content/types";
import { TrophyIcon } from "./icons";
import { PathNode, type NodeState } from "./path-node";

const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];

/** Dark text on light banners (e.g. JavaScript yellow), white text otherwise. */
function bannerText(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.7 ? "#3a2a00" : "#fff";
}

export const LEVEL_ICON = { Beginner: "🌱", Intermediate: "🚀", Advanced: "🔥" } as const;

/** Tint a hex color toward another hue per unit so each unit feels distinct. */
const UNIT_COLORS = ["#7c5cff", "#22c06b", "#ff9600", "#1cb0f6", "#ff4b6e", "#ce82ff"];

export function CoursePath({
  course,
  completed,
  perfect,
  hearts,
}: {
  course: Course;
  completed: Set<string>;
  perfect: Set<string>;
  hearts: number;
}) {
  let foundCurrent = false;
  let globalIndex = 0;

  return (
    <div className="space-y-12">
      {course.units.map((unit, ui) => {
        const color = ui === 0 ? course.color : UNIT_COLORS[(ui - 1) % UNIT_COLORS.length];
        const unitDone = unit.lessons.every((l) => completed.has(l.id));
        const doneCount = unit.lessons.filter((l) => completed.has(l.id)).length;
        return (
          <section key={unit.id} id={unit.id} className="scroll-mt-40">
            <div
              className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
              style={{ background: color, color: bannerText(color), boxShadow: `0 5px 0 color-mix(in srgb, ${color} 70%, #000)` }}
            >
              <div>
                <div className="text-xs font-extrabold tracking-wider uppercase opacity-85">
                  Unit {ui + 1} · {doneCount}/{unit.lessons.length} lessons
                  <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-[10px] tracking-wider">{LEVEL_ICON[unit.level]} {unit.level}</span>
                </div>
                <h2 className="text-xl font-black">{unit.title}</h2>
                <p className="text-sm font-semibold opacity-90">{unit.description}</p>
              </div>
              <BookOpen className="hidden size-8 shrink-0 opacity-80 sm:block" />
            </div>

            <div className="mt-16 flex flex-col items-center gap-14">
              {unit.lessons.map((lesson, li) => {
                const done = completed.has(lesson.id);
                let state: NodeState = "locked";
                if (done) state = "done";
                else if (!foundCurrent) {
                  state = "current";
                  foundCurrent = true;
                }
                const offset = OFFSETS[globalIndex++ % OFFSETS.length];
                return (
                  <PathNode
                    key={lesson.id}
                    href={`/lesson/${lesson.id}`}
                    title={lesson.title}
                    subtitle={`Lesson ${li + 1} of ${unit.lessons.length} · ${lesson.steps.length} exercises`}
                    state={state}
                    offset={offset}
                    color={color}
                    perfect={perfect.has(lesson.id)}
                    outOfHearts={hearts <= 0}
                  />
                );
              })}
              <div style={{ transform: `translateX(${OFFSETS[globalIndex++ % OFFSETS.length]}px)` }} title={unitDone ? "Unit complete!" : "Finish the unit to earn this trophy"}>
                <div
                  className="grid size-[72px] place-items-center rounded-full"
                  style={{ background: unitDone ? "var(--gold)" : "var(--locked)", boxShadow: `0 7px 0 ${unitDone ? "var(--gold-strong)" : "var(--locked-strong)"}` }}
                >
                  <TrophyIcon className="size-10" color={unitDone ? "#fff" : "var(--locked-strong)"} />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
