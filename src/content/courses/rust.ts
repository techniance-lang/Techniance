import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full Rust course.
export const rust: Course = {
  slug: "rust",
  title: "Rust",
  language: "rust",
  tagline: "Fearless, fast and memory-safe.",
  description: "Fearless, fast and memory-safe.",
  color: "#b7410e",
  emoji: "🦀",
  level: "Beginner → Advanced",
  units: [
    {
      id: "rust-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "rust-1-1",
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
              solution: "fn main() {\n    println!(\"{}\", 42);\n}",
            },
          ],
        },
      ],
    },
  ],
};
