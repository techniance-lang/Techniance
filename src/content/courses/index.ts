import type { Course, Lesson, Unit } from "../types";
import { algorithms } from "./algorithms";
import { javascript } from "./javascript";
import { python } from "./python";

export const COURSES: Course[] = [python, javascript, algorithms];

/** Shown in the catalog so learners can see what's next on the roadmap. */
export const UPCOMING_COURSES = [
  { title: "C++ for Competitive Programming", emoji: "🚀", color: "#00599c" },
  { title: "Java Foundations", emoji: "☕", color: "#e76f00" },
  { title: "SQL & Databases", emoji: "🗄️", color: "#2ed47a" },
  { title: "Rust Basics", emoji: "🦀", color: "#ff6b35" },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export interface LessonRef {
  course: Course;
  unit: Unit;
  lesson: Lesson;
  unitIndex: number;
  lessonIndex: number;
  /** Position within the whole course (0-based). */
  order: number;
}

const lessonIndex = new Map<string, LessonRef>();
for (const course of COURSES) {
  let order = 0;
  course.units.forEach((unit, unitIndex) =>
    unit.lessons.forEach((lesson, li) => {
      lessonIndex.set(lesson.id, { course, unit, lesson, unitIndex, lessonIndex: li, order: order++ });
    }),
  );
}

export function getLesson(lessonId: string): LessonRef | undefined {
  return lessonIndex.get(lessonId);
}

export function courseLessons(course: Course): Lesson[] {
  return course.units.flatMap((u) => u.lessons);
}

export function lessonCount(course: Course): number {
  return courseLessons(course).length;
}

/**
 * Lessons unlock in order: a lesson is playable once every earlier lesson in
 * the course is complete. Returns the id of the next lesson to play.
 */
export function nextLessonId(course: Course, completed: Set<string>): string | null {
  for (const l of courseLessons(course)) if (!completed.has(l.id)) return l.id;
  return null;
}

export function isLessonUnlocked(lessonId: string, completed: Set<string>): boolean {
  const ref = getLesson(lessonId);
  if (!ref) return false;
  if (completed.has(lessonId)) return true;
  return nextLessonId(ref.course, completed) === lessonId;
}
