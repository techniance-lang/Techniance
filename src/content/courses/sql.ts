import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full SQL & Databases course.
export const sql: Course = {
  slug: "sql",
  title: "SQL & Databases",
  language: "sql",
  tagline: "Query real data with confidence.",
  description: "Query real data with confidence.",
  color: "#14b8a6",
  emoji: "🗄️",
  level: "Beginner → Advanced",
  units: [
    {
      id: "sql-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "sql-1-1",
          title: "Hello",
          steps: [
            { type: "learn", title: "Welcome", body: "Placeholder lesson." },
            { type: "choice", prompt: "Ready?", options: ["Yes", "No"], answer: 0, explain: "Great." },
            {
              type: "code",
              prompt: "Print the answer.",
              starter: "",
              tests: [{"expected": "answer\n1"}],
              hint: "Look at the solution.",
              solution: "SELECT 1 AS answer;",
            },
          ],
        },
      ],
    },
  ],
};
