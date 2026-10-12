import Link from "next/link";
import { courseLessons, nextLessonId } from "@/content/courses";
import type { Course } from "@/content/types";
import type { User } from "@/lib/db/schema";
import { lessonProgressFor } from "@/lib/progress";
import { getShellData } from "@/lib/shell";
import { CoursePath } from "./course-path";
import { RightRail } from "./shell";
import { ProgressBar } from "./ui";

export async function CoursePage({ user, course }: { user: User; course: Course }) {
  const [shell, progress] = await Promise.all([getShellData(user), lessonProgressFor(user.id)]);
  const lessons = courseLessons(course);
  const done = lessons.filter((l) => progress.completed.has(l.id)).length;
  const next = nextLessonId(course, progress.completed);

  return (
    <div className="mx-auto flex max-w-[1100px] gap-10 px-4 pt-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <div className="sticky top-[62px] z-20 -mx-4 mb-8 border-b-2 border-line bg-bg/90 px-4 py-3 backdrop-blur md:top-0">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <span className="text-3xl">{course.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h1 className="truncate font-black">{course.title}</h1>
                <Link href="/courses" className="shrink-0 text-xs font-extrabold text-brand uppercase hover:underline">Switch</Link>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <ProgressBar value={done / lessons.length} height={10} color={course.color} />
                <span className="text-xs font-extrabold whitespace-nowrap text-muted">
                  {done}/{lessons.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!next && (
          <div className="mx-auto mb-10 max-w-xl rounded-2xl border-2 border-gold bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] p-5 text-center">
            <div className="text-4xl">🏆</div>
            <h2 className="mt-2 text-xl font-black">Course complete!</h2>
            <p className="mt-1 font-semibold text-muted">Replay lessons for practice XP, or test yourself in the practice arena.</p>
            <Link href="/practice" className="btn btn-gold mt-4">Go to practice</Link>
          </div>
        )}

        <div className="mx-auto max-w-xl pb-16">
          <CoursePath course={course} completed={progress.completed} perfect={progress.perfect} hearts={user.hearts} />
        </div>
      </div>
      <RightRail user={user} shell={shell} />
    </div>
  );
}
