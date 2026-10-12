import { redirect } from "next/navigation";
import { CoursePage } from "@/components/course-page";
import { getCourse } from "@/content/courses";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Learn" };

export default async function LearnPage() {
  const user = await requireUser();
  const course = user.currentCourse ? getCourse(user.currentCourse) : undefined;
  if (!course) redirect("/courses");
  return <CoursePage user={user} course={course} />;
}
