export type Language = "python" | "javascript";

export const LANGUAGE_LABEL: Record<Language, string> = {
  python: "Python 3",
  javascript: "JavaScript",
};

/** A test for a coding step or problem: feed `input` on stdin, compare stdout to `expected`. */
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

export interface Unit {
  id: string;
  title: string;
  description: string;
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
  level: "Beginner" | "Intermediate";
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
  starter: Record<Language, string>;
  hint?: string;
}
