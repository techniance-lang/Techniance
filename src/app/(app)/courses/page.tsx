import { Lock } from "lucide-react";
import Link from "next/link";
import { RightRail } from "@/components/shell";
import { CourseBadge } from "@/components/course-badge";
import { ProgressBar } from "@/components/ui";
import { COURSES, UPCOMING_COURSES, courseLessons } from "@/content/courses";
import { requireUser } from "@/lib/auth";
import { lessonProgressFor } from "@/lib/progress";
import { getShellData } from "@/lib/shell";

export const metadata = { title: "Courses" };

export default async function CoursesPage() {
  const user = await requireUser();
  const [shell, progress] = await Promise.all([getShellData(user), lessonProgressFor(user.id)]);

  return (
    <div className="mx-auto flex max-w-[1100px] gap-10 px-4 pt-8 lg:px-8">
      <div className="min-w-0 flex-1 pb-12">
        <h1 className="text-3xl font-black">Courses</h1>
        <p className="mt-1 font-semibold text-muted">Pick up where you left off, or start something new.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {COURSES.map((c) => {
            const lessons = courseLessons(c);
            const done = lessons.filter((l) => progress.completed.has(l.id)).length;
            const current = user.currentCourse === c.slug;
            return (
              <Link key={c.slug} href={`/courses/${c.slug}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1" style={current ? { borderColor: c.color } : undefined}>
                <div className="relative flex h-28 items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg, ${c.color}, color-mix(in srgb, ${c.color} 50%, #000))` }}>
                  <CourseBadge course={c} size={72} className="transition group-hover:scale-110" />
                  {current && <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-black text-black">CURRENT</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="text-xs font-extrabold tracking-wider text-muted uppercase">
                    {c.level} · {c.units.length} units · {lessons.length} lessons
                  </div>
                  <h2 className="mt-1 text-xl font-black">{c.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted">{c.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <ProgressBar value={done / lessons.length} height={10} color={c.color} />
                    <span className="text-xs font-extrabold whitespace-nowrap text-muted">{Math.round((done / lessons.length) * 100)}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <h2 className="mt-12 text-xl font-black">Coming soon</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {UPCOMING_COURSES.map((c) => (
            <div key={c.title} className="card flex items-center gap-4 p-4 opacity-75">
              <span className="grid size-12 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, ${c.color} 25%, transparent)` }}>
                {c.emoji}
              </span>
              <span className="flex-1 font-black">{c.title}</span>
              <Lock className="size-5 text-muted" />
            </div>
          ))}
        </div>
      </div>
      <RightRail user={user} shell={shell} />
    </div>
  );
}
