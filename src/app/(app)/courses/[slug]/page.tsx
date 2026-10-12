import { notFound } from "next/navigation";
import { CoursePage } from "@/components/course-page";
import { getCourse } from "@/content/courses";
import { requireUser } from "@/lib/auth";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourse((await params).slug);
  return { title: course?.title ?? "Course" };
}

export default async function CourseRoute({ params }: { params: Promise<{ slug: string }> }) {
  const course = getCourse((await params).slug);
  if (!course) notFound();
  const user = await requireUser();
  return <CoursePage user={user} course={course} />;
}
