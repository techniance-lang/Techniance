import type { Language } from "./languages";

export { LANGUAGE_LABEL, LANGUAGES, type Language } from "./languages";

/**
 * A test for a coding step or problem: feed `input` on stdin, compare stdout to `expected`.
 * SQL: `input` is setup SQL run before the learner's query; stdout is the formatted result set.
 * HTML/CSS: `input` is a list of DOM probes (see public/workers/web-runner.js); stdout is their answers.
 */
export interface TestCase {
  input?: string;
  expected: string;
}

export type Step =
  | {
      type: "learn";
      title: string;
      /** Light markdown: paragraphs, **bold**, `code`, and "- " bullet lists. */
      body: string;
      code?: string;
    }
  | {
      type: "choice";
      prompt: string;
      code?: string;
      options: string[];
      answer: number;
      explain: string;
    }
  | {
      /** Tap words from the bank into the blanks (`___`) of `template`, in order. */
      type: "fill";
      prompt: string;
      template: string;
      answers: string[];
      bank: string[];
      explain: string;
    }
  | {
      /** Parsons problem: put the shuffled lines in the right order. */
      type: "order";
      prompt: string;
      lines: string[];
      explain: string;
    }
  | {
      type: "code";
      prompt: string;
      starter: string;
      tests: TestCase[];
      hint: string;
      solution: string;
    };

export interface Lesson {
  id: string;
  title: string;
  steps: Step[];
}

export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Unit {
  id: string;
  title: string;
  description: string;
  level: Level;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  language: Language;
  tagline: string;
  description: string;
  /** Accent color for the course (hex). */
  color: string;
  emoji: string;
  /** Range shown on course cards, e.g. "Beginner → Advanced". */
  level: string;
  units: Unit[];
}

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** Light markdown. */
  statement: string;
  input: string;
  output: string;
  constraints: string[];
  samples: (TestCase & { explain?: string })[];
  hidden: TestCase[];
  /** Starter code per practice language; languages without an entry use a generic template. */
  starter: Partial<Record<Language, string>>;
  hint?: string;
}
