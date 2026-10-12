import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full Go course.
export const go: Course = {
  slug: "go",
  title: "Go",
  language: "go",
  tagline: "Simple, fast, built for the cloud.",
  description: "Simple, fast, built for the cloud.",
  color: "#00add8",
  emoji: "🐹",
  level: "Beginner → Advanced",
  units: [
    {
      id: "go-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "go-1-1",
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
              solution: "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(42)\n}",
            },
          ],
        },
      ],
    },
  ],
};
