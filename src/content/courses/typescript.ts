import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full TypeScript course.
export const typescript: Course = {
  slug: "typescript",
  title: "TypeScript",
  language: "typescript",
  tagline: "JavaScript with superpowers.",
  description: "JavaScript with superpowers.",
  color: "#3178c6",
  emoji: "🔷",
  level: "Intermediate → Advanced",
  units: [
    {
      id: "typescript-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "typescript-1-1",
          title: "Hello",
          steps: [
            { type: "learn", title: "Welcome", body: "Placeholder lesson." },
            { type: "choice", prompt: "Ready?", options: ["Yes", "No"], answer: 0, explain: "Great." },
            {
              type: "code",
              prompt: "Print the answer.",
              starter: "",
              tests: [{"expected": "42"}],
              hint: "Look at the solution.",
              solution: "const n: number = 21;\nconsole.log(n * 2);",
            },
          ],
        },
      ],
    },
  ],
};
