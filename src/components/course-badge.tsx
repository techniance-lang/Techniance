import clsx from "clsx";
import type { Course } from "@/content/types";

/** The visual mark for a course. (Placeholder: emoji tile — replaced by custom SVG badges.) */
export function CourseBadge({ course, size = 40, className }: { course: Pick<Course, "slug" | "emoji" | "color" | "title">; size?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label={course.title}
      className={clsx("inline-grid shrink-0 place-items-center rounded-xl", className)}
      style={{ width: size, height: size, fontSize: size * 0.55, background: `color-mix(in srgb, ${course.color} 22%, transparent)` }}
    >
      {course.emoji}
    </span>
  );
}
