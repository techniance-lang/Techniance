import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full C++ for Competitive Programming course.
export const cpp: Course = {
  slug: "cpp",
  title: "C++ for Competitive Programming",
  language: "cpp",
  tagline: "Fast code for hard problems.",
  description: "Fast code for hard problems.",
  color: "#00599c",
  emoji: "🚀",
  level: "Beginner → Advanced",
  units: [
    {
      id: "cpp-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "cpp-1-1",
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
              solution: "#include <iostream>\nint main() {\n    std::cout << 42 << \"\\n\";\n}",
            },
          ],
        },
      ],
    },
  ],
};
