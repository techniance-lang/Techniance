import { redirect } from "next/navigation";
import { Onboarding } from "@/components/onboarding";
import { COURSES, lessonCount } from "@/content/courses";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const user = await requireUser();
  if (user.onboarded) redirect("/learn");
  return (
    <Onboarding
      name={user.displayName}
      courses={COURSES.map((c) => ({ slug: c.slug, title: c.title, emoji: c.emoji, color: c.color, tagline: c.tagline, level: c.level, lessons: lessonCount(c) }))}
    />
  );
}
