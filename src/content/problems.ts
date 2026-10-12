import tests from "./problem-tests.json";
import type { Difficulty, Language, Problem, TestCase } from "./types";

type Meta = Omit<Problem, "samples" | "hidden" | "starter"> & {
  sampleNotes?: string[];
  starter?: Partial<Record<Language, string>>;
};

const PY_ONE_LINE = "s = input()\n\n# your code here\n";
const JS_ONE_LINE = "const s = readline();\n\n// your code here\n";

const META: Meta[] = [
  {
    slug: "sum-of-two",
    title: "A + B",
    difficulty: "easy",
    tags: ["math", "input/output"],
    statement: "The classic warm-up. Read two integers **A** and **B** and print their sum.",
    input: "A single line with two integers A and B.",
    output: "Print A + B.",
    constraints: ["-10⁹ ≤ A, B ≤ 10⁹"],
    starter: {
      python: "a, b = map(int, input().split())\n\n# print the sum\n",
      javascript: 'const [a, b] = readline().split(" ").map(Number);\n\n// print the sum\n',
    },
  },
  {
    slug: "even-or-odd",
    title: "Even or Odd",
    difficulty: "easy",
    tags: ["math", "multiple test cases"],
    statement:
      "Many contest problems have **T test cases** in one input. For each integer N, print `EVEN` if it is even and `ODD` otherwise.",
    input: "The first line contains T. Each of the next T lines contains an integer N.",
    output: "For each test case print EVEN or ODD on its own line.",
    constraints: ["1 ≤ T ≤ 100", "-10⁹ ≤ N ≤ 10⁹"],
    starter: {
      python: "t = int(input())\nfor _ in range(t):\n    n = int(input())\n    # your code here\n",
      javascript: "const t = Number(readline());\nfor (let i = 0; i < t; i++) {\n  const n = Number(readline());\n  // your code here\n}\n",
    },
    hint: "Remember that -3 % 2 is 1 in Python but -1 in JavaScript. Compare against 0 to be safe.",
  },
  {
    slug: "reverse-string",
    title: "Mirror Word",
    difficulty: "easy",
    tags: ["strings"],
    statement: "Print the given word backwards.",
    input: "A single line containing a word S of lowercase letters.",
    output: "Print S reversed.",
    constraints: ["1 ≤ |S| ≤ 1000"],
  },
  {
    slug: "count-vowels",
    title: "Vowel Counter",
    difficulty: "easy",
    tags: ["strings", "counting"],
    statement: "Count how many vowels (`a e i o u`, upper or lower case) appear in the given line of text.",
    input: "A single line of text containing letters and spaces.",
    output: "Print the number of vowels.",
    constraints: ["1 ≤ length ≤ 1000"],
  },
  {
    slug: "longest-streak",
    title: "Longest Streak",
    difficulty: "easy",
    tags: ["strings", "greedy"],
    statement:
      "Your coding history for N days is a binary string — `1` means you practiced that day, `0` means you didn't. What is your **longest streak** of consecutive practice days?",
    input: "The first line contains N. The second line contains a binary string of length N.",
    output: "Print the length of the longest run of consecutive 1s.",
    constraints: ["1 ≤ N ≤ 10⁵"],
    sampleNotes: ["The runs of 1s have lengths 2, 3 and 2. The longest is 3.", "No practice days at all, so the answer is 0."],
    starter: {
      python: "n = int(input())\ns = input()\n\n# your code here\n",
      javascript: "const n = Number(readline());\nconst s = readline();\n\n// your code here\n",
    },
  },
  {
    slug: "palindrome-check",
    title: "Palindrome Sentence",
    difficulty: "easy",
    tags: ["strings", "two pointers"],
    statement:
      "A sentence is a palindrome if, after **removing everything except letters and digits** and ignoring case, it reads the same forwards and backwards. Print `YES` or `NO`.",
    input: "A single line of text.",
    output: "YES if the line is a palindrome, otherwise NO.",
    constraints: ["1 ≤ length ≤ 10⁴"],
  },
  {
    slug: "xp-leaderboard",
    title: "League Standings",
    difficulty: "easy",
    tags: ["sorting"],
    statement:
      "Given each learner's weekly XP, print the league table. Sort by XP **descending**; break ties by name **alphabetically**. Each line is `rank. name xp`.",
    input: "The first line contains N. Each of the next N lines has a name (lowercase letters) and an integer XP.",
    output: "N lines in the format `rank. name xp`.",
    constraints: ["1 ≤ N ≤ 1000", "0 ≤ XP ≤ 10⁶", "Names are distinct."],
    sampleNotes: ["ana and cy tie on 120 XP, so they're ordered alphabetically."],
    starter: {
      python: "n = int(input())\npeople = []\nfor _ in range(n):\n    name, xp = input().split()\n    people.append((name, int(xp)))\n\n# your code here\n",
      javascript:
        'const n = Number(readline());\nconst people = [];\nfor (let i = 0; i < n; i++) {\n  const [name, xp] = readline().split(" ");\n  people.push({ name, xp: Number(xp) });\n}\n\n// your code here\n',
    },
  },
  {
    slug: "second-largest",
    title: "Runner-up",
    difficulty: "medium",
    tags: ["arrays"],
    statement: "Find the second largest **distinct** value in the array. If it doesn't exist, print `-1`.",
    input: "The first line contains N. The second line contains N integers.",
    output: "The second largest distinct value, or -1.",
    constraints: ["1 ≤ N ≤ 10⁵", "-10⁹ ≤ Aᵢ ≤ 10⁹", "The answer -1 is only used when fewer than 2 distinct values exist."],
    sampleNotes: ["The distinct values are 2, 4, 7, 9 — the runner-up is 7.", "Only one distinct value exists."],
    starter: {
      python: "n = int(input())\na = list(map(int, input().split()))\n\n# your code here\n",
      javascript: 'const n = Number(readline());\nconst a = readline().split(" ").map(Number);\n\n// your code here\n',
    },
  },
  {
    slug: "anagram-check",
    title: "Anagram Detector",
    difficulty: "medium",
    tags: ["strings", "hashing", "sorting"],
    statement: "Two words are **anagrams** if one is a rearrangement of the other's letters. Print `YES` if they are, otherwise `NO`.",
    input: "Two lines, each containing a lowercase word.",
    output: "YES or NO.",
    constraints: ["1 ≤ length ≤ 10⁵"],
    starter: {
      python: "a = input()\nb = input()\n\n# your code here\n",
      javascript: "const a = readline();\nconst b = readline();\n\n// your code here\n",
    },
  },
  {
    slug: "balanced-brackets",
    title: "Balanced Brackets",
    difficulty: "medium",
    tags: ["stack", "strings"],
    statement:
      "A bracket string is **balanced** if every opening bracket `( [ {` is closed by the matching bracket in the correct order. For each string print `YES` or `NO`.",
    input: "The first line contains T. Each of the next T lines contains a non-empty bracket string.",
    output: "T lines with YES or NO.",
    constraints: ["1 ≤ T ≤ 100", "1 ≤ length ≤ 10⁴"],
    sampleNotes: ["Balanced.", "The `)` closes `[` — wrong order.", "Never closed."],
    hint: "Push opening brackets on a stack. On a closing bracket, the top of the stack must be its partner.",
    starter: {
      python: "t = int(input())\nfor _ in range(t):\n    s = input()\n    # your code here\n",
      javascript: "const t = Number(readline());\nfor (let i = 0; i < t; i++) {\n  const s = readline();\n  // your code here\n}\n",
    },
  },
  {
    slug: "pair-count",
    title: "Pair Up",
    difficulty: "medium",
    tags: ["hashing", "arrays"],
    statement: "Count the pairs of indices **i < j** with **Aᵢ + Aⱼ = K**.",
    input: "The first line contains N and K. The second line contains N integers.",
    output: "The number of pairs.",
    constraints: ["1 ≤ N ≤ 10⁵", "-10⁹ ≤ Aᵢ, K ≤ 10⁹"],
    sampleNotes: ["(1, 5) and (3, 3) — the two 3s form a pair."],
    hint: "Checking every pair is O(N²) — too slow. Walk the array once and keep a count of values seen so far.",
    starter: {
      python: "n, k = map(int, input().split())\na = list(map(int, input().split()))\n\n# your code here\n",
      javascript: 'const [n, k] = readline().split(" ").map(Number);\nconst a = readline().split(" ").map(Number);\n\n// your code here\n',
    },
  },
  {
    slug: "max-subarray",
    title: "Best Winning Run",
    difficulty: "medium",
    tags: ["dynamic programming", "greedy"],
    statement:
      "Find the largest possible sum of a **non-empty contiguous** subarray.",
    input: "The first line contains N. The second line contains N integers.",
    output: "The maximum subarray sum.",
    constraints: ["1 ≤ N ≤ 10⁵", "-10⁴ ≤ Aᵢ ≤ 10⁴"],
    sampleNotes: ["The subarray 4 -1 2 1 sums to 6.", "All negative: the best is the single element -1."],
    hint: "Kadane's algorithm: the best sum ending here is either this element alone, or this element plus the best sum ending at the previous position.",
    starter: {
      python: "n = int(input())\na = list(map(int, input().split()))\n\n# your code here\n",
      javascript: 'const n = Number(readline());\nconst a = readline().split(" ").map(Number);\n\n// your code here\n',
    },
  },
  {
    slug: "count-primes",
    title: "Prime Count",
    difficulty: "medium",
    tags: ["math", "sieve"],
    statement: "Count the prime numbers less than or equal to **N**.",
    input: "A single integer N.",
    output: "The number of primes ≤ N.",
    constraints: ["1 ≤ N ≤ 10⁶"],
    sampleNotes: ["2, 3, 5 and 7.", "There are no primes ≤ 1."],
    hint: "The Sieve of Eratosthenes marks multiples of each prime as composite in O(N log log N).",
    starter: {
      python: "n = int(input())\n\n# your code here\n",
      javascript: "const n = Number(readline());\n\n// your code here\n",
    },
  },
  {
    slug: "run-length",
    title: "Compress It",
    difficulty: "medium",
    tags: ["strings"],
    statement:
      "Run-length encode the string: replace each maximal group of equal consecutive characters with the character followed by the group length.",
    input: "A single line containing a string S of lowercase letters.",
    output: "The encoded string.",
    constraints: ["1 ≤ |S| ≤ 10⁵"],
    sampleNotes: ["aaa → a3, b → b1, cc → c2, dddd → d4."],
  },
  {
    slug: "longest-increasing-subsequence",
    title: "Climbing Ranks",
    difficulty: "hard",
    tags: ["dynamic programming", "binary search"],
    statement:
      "Find the length of the longest **strictly increasing** subsequence. A subsequence keeps the original order but may skip elements.",
    input: "The first line contains N. The second line contains N integers.",
    output: "The length of the longest strictly increasing subsequence.",
    constraints: ["1 ≤ N ≤ 10⁵", "1 ≤ Aᵢ ≤ 10⁹"],
    sampleNotes: ["One answer is 2 3 7 18.", "Equal values don't count as increasing."],
    hint: "Keep `tails[k]` = smallest possible tail of an increasing subsequence of length k + 1. Binary search where each element goes. O(N log N).",
    starter: {
      python: "n = int(input())\na = list(map(int, input().split()))\n\n# your code here\n",
      javascript: 'const n = Number(readline());\nconst a = readline().split(" ").map(Number);\n\n// your code here\n',
    },
  },
  {
    slug: "coin-change-ways",
    title: "Gem Combinations",
    difficulty: "hard",
    tags: ["dynamic programming"],
    statement:
      "You have unlimited gems of N different values. In how many ways can you make exactly **T**? Order doesn't matter (1+2 is the same as 2+1). Print the answer modulo **10⁹ + 7**.",
    input: "The first line contains N and T. The second line contains the N distinct gem values.",
    output: "The number of ways modulo 1000000007.",
    constraints: ["1 ≤ N ≤ 100", "0 ≤ T ≤ 10⁴", "1 ≤ value ≤ 10⁴"],
    sampleNotes: ["5 = 5 = 2+2+1 = 2+1+1+1 = 1+1+1+1+1.", "You can't make an odd total from 2s."],
    hint: "ways[0] = 1. For each coin c, for v from c to T: ways[v] += ways[v - c]. Looping over coins on the outside avoids counting orderings.",
    starter: {
      python: "n, t = map(int, input().split())\ncoins = list(map(int, input().split()))\nMOD = 10**9 + 7\n\n# your code here\n",
      javascript:
        'const [n, t] = readline().split(" ").map(Number);\nconst coins = readline().split(" ").map(Number);\nconst MOD = 1_000_000_007;\n\n// your code here\n',
    },
  },
  {
    slug: "grid-escape",
    title: "Maze Escape",
    difficulty: "hard",
    tags: ["graphs", "bfs"],
    statement:
      "You are at the top-left cell of an R × C maze and want to reach the bottom-right cell. `.` is open, `#` is a wall. Each move goes up, down, left or right. Print the **minimum number of moves**, or `-1` if it's impossible.",
    input: "The first line contains R and C. The next R lines contain C characters each.",
    output: "The minimum number of moves, or -1.",
    constraints: ["1 ≤ R, C ≤ 500"],
    sampleNotes: ["One shortest route goes right, down, right, right, down."],
    hint: "Breadth-first search explores cells in order of distance, so the first time you reach the exit is the shortest path.",
    starter: {
      python: "r, c = map(int, input().split())\ngrid = [input() for _ in range(r)]\n\n# your code here\n",
      javascript:
        'const [r, c] = readline().split(" ").map(Number);\nconst grid = [];\nfor (let i = 0; i < r; i++) grid.push(readline());\n\n// your code here\n',
    },
  },
  {
    slug: "edit-distance",
    title: "Typo Fixer",
    difficulty: "hard",
    tags: ["dynamic programming", "strings"],
    statement:
      "The **edit distance** between two words is the minimum number of single-character insertions, deletions or substitutions needed to turn one into the other. Compute it.",
    input: "Two lines, each containing a lowercase word.",
    output: "The edit distance.",
    constraints: ["1 ≤ length ≤ 2000"],
    sampleNotes: ["kitten → sitten → sittin → sitting.", "flaw → law → lawn (delete f, insert n)."],
    hint: "dp[i][j] = distance between the first i letters of a and the first j letters of b. Each cell depends on its left, top and top-left neighbours.",
    starter: {
      python: "a = input()\nb = input()\n\n# your code here\n",
      javascript: "const a = readline();\nconst b = readline();\n\n// your code here\n",
    },
  },
];

const TESTS = tests as Record<string, { samples: TestCase[]; hidden: TestCase[] }>;

export const PROBLEMS: Problem[] = META.map(({ sampleNotes, starter, ...meta }) => {
  const t = TESTS[meta.slug];
  if (!t) throw new Error(`Missing tests for problem ${meta.slug}`);
  return {
    ...meta,
    samples: t.samples.map((s, i) => ({ ...s, explain: sampleNotes?.[i] })),
    hidden: t.hidden,
    starter: {
      python: starter?.python ?? PY_ONE_LINE,
      javascript: starter?.javascript ?? JS_ONE_LINE,
    },
  };
});

export function getProblem(slug: string): Problem | undefined {
  return PROBLEMS.find((p) => p.slug === slug);
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };

/** Problem of the day — the same for everyone on a given UTC date. */
export function problemOfTheDay(dateKey: string): Problem {
  let h = 0;
  for (const ch of dateKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PROBLEMS[h % PROBLEMS.length];
}
