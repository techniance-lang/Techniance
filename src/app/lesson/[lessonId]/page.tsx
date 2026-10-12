import { Lock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { getLesson, isLessonUnlocked } from "@/content/courses";
import { requireUser } from "@/lib/auth";
import { completedLessons } from "@/lib/game/engine";

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }) {
  const ref = getLesson((await params).lessonId);
  return { title: ref ? `${ref.lesson.title} · ${ref.course.title}` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const ref = getLesson(lessonId);
  if (!ref) notFound();
  const user = await requireUser();
  if (!user.onboarded) redirect("/welcome");

  const completed = await completedLessons(user.id);
  const exitHref = `/courses/${ref.course.slug}`;
  if (!isLessonUnlocked(lessonId, completed)) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <Lock className="mx-auto size-16 text-muted" />
          <h1 className="mt-4 text-2xl font-black">This lesson is locked</h1>
          <p className="mt-2 font-semibold text-muted">Finish the earlier lessons in {ref.course.title} to unlock it.</p>
          <Link href={exitHref} className="btn mt-6">Back to course</Link>
        </div>
      </div>
    );
  }

  return (
    <LessonPlayer
      lessonId={lessonId}
      lessonTitle={ref.lesson.title}
      steps={ref.lesson.steps}
      language={ref.course.language}
      initialHearts={user.hearts}
      practice={completed.has(lessonId)}
      exitHref={exitHref}
    />
  );
}
