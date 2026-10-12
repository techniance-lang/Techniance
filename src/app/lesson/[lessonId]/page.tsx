import { Lock } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProLockedPage } from "@/components/billing/pro-upsell";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { getLesson, isLessonUnlocked } from "@/content/courses";
import { requireUser } from "@/lib/auth";
import { accessOf } from "@/lib/billing/access";
import { canAccessLevel, hasUnlimitedHearts } from "@/lib/billing/entitlements";
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
  const access = accessOf(user);
  if (!canAccessLevel(access, ref.unit.level)) {
    return (
      <ProLockedPage
        title={`${ref.unit.level} lessons are part of Pro`}
        reason={`"${ref.lesson.title}" is in ${ref.unit.title}, an ${ref.unit.level.toLowerCase()} unit of ${ref.course.title}. Upgrade to keep going — Beginner units in every course stay free.`}
        backHref={exitHref}
        backLabel="Back to course"
      />
    );
  }
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
      unlimitedHearts={hasUnlimitedHearts(access)}
      exitHref={exitHref}
    />
  );
}
