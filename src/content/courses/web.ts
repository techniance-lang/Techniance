import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full HTML & CSS course.
export const htmlCss: Course = {
  slug: "html-css",
  title: "HTML & CSS",
  language: "web",
  tagline: "Build beautiful web pages.",
  description: "Build beautiful web pages.",
  color: "#ff6b35",
  emoji: "🎨",
  level: "Beginner → Advanced",
  units: [
    {
      id: "web-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "web-1-1",
          title: "Hello",
          steps: [
            { type: "learn", title: "Welcome", body: "Placeholder lesson." },
            { type: "choice", prompt: "Ready?", options: ["Yes", "No"], answer: 0, explain: "Great." },
            {
              type: "code",
              prompt: "Print the answer.",
              starter: "",
              tests: [{"input": "text | h1", "expected": "Hello"}],
              hint: "Look at the solution.",
              solution: "<h1>Hello</h1>",
            },
          ],
        },
      ],
    },
  ],
};
