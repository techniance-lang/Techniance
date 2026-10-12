import type { Course } from "../types";

// PLACEHOLDER — being replaced by the full Java Foundations course.
export const java: Course = {
  slug: "java",
  title: "Java Foundations",
  language: "java",
  tagline: "The language of enterprise and Android.",
  description: "The language of enterprise and Android.",
  color: "#e76f00",
  emoji: "☕",
  level: "Beginner → Advanced",
  units: [
    {
      id: "java-u1",
      title: "Getting started",
      description: "First steps.",
      level: "Beginner",
      lessons: [
        {
          id: "java-1-1",
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
              solution: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(42);\n    }\n}",
            },
          ],
        },
      ],
    },
  ],
};
