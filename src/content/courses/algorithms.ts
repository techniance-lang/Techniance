import type { Course } from "../types";
import { algorithmsMoreUnits } from "./algorithms-more";

export const algorithms: Course = {
  slug: "algorithms",
  title: "Algorithms & Problem Solving",
  language: "python",
  tagline: "Think like a competitive programmer.",
  description:
    "The toolkit behind every contest problem: Big-O, searching, sorting, recursion, stacks and heaps, graphs with BFS/DFS, dynamic programming, sliding windows, greedy algorithms and bit tricks. Taught in Python — finish the first units of Python Fundamentals first.",
  color: "#a26bff",
  emoji: "🧠",
  level: "Intermediate → Advanced",
  units: [
    {
      id: "algo-u1",
      title: "Efficiency",
      description: "Measure and speed up your code.",
      level: "Intermediate",
      lessons: [
        {
          id: "algo-1-1",
          title: "Big-O notation",
          steps: [
            {
              type: "learn",
              title: "How does it scale?",
              body: "**Big-O** describes how the work grows as the input size `n` grows.\n\n- `O(1)` — constant: indexing a list\n- `O(n)` — linear: one loop over the data\n- `O(n²)` — quadratic: a loop inside a loop\n- `O(log n)` — halving the problem each step",
              code: "# O(n)\nfor x in nums:\n    total += x\n\n# O(n^2)\nfor a in nums:\n    for b in nums:\n        pairs += 1",
            },
            {
              type: "choice",
              prompt: "What is the time complexity?",
              code: "for i in range(n):\n    for j in range(10):\n        work()",
              options: ["O(n²)", "O(n)", "O(10ⁿ)", "O(log n)"],
              answer: 1,
              explain: "The inner loop is a constant 10 iterations, so the total is 10·n → O(n).",
            },
            {
              type: "choice",
              prompt: "A judge allows about 10⁸ simple operations per second. With n = 10⁵, which complexity is too slow?",
              options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
              answer: 2,
              explain: "n² = 10¹⁰ operations — about 100 seconds. n log n is roughly 1.7·10⁶ — instant.",
            },
            {
              type: "fill",
              prompt: "Halving the search space every step gives this complexity:",
              template: "O(___)",
              answers: ["log n"],
              bank: ["log n", "n", "n²", "2ⁿ"],
              explain: "You can halve n only about log₂(n) times before reaching 1.",
            },
          ],
        },
        {
          id: "algo-1-2",
          title: "Prefix sums",
          steps: [
            {
              type: "learn",
              title: "Precompute once, answer fast",
              body: "Build `pre` where `pre[i]` is the sum of the first `i` items. Then the sum of `a[l..r]` is `pre[r+1] - pre[l]` — **O(1)** per query instead of O(n).",
              code: "a = [3, 1, 4, 1, 5]\npre = [0]\nfor x in a:\n    pre.append(pre[-1] + x)\n# pre = [0, 3, 4, 8, 9, 14]\nprint(pre[4] - pre[1])  # 1+4+1 = 6",
            },
            {
              type: "choice",
              prompt: "With pre = [0, 2, 5, 9, 14], what is the sum of a[1..3] (inclusive)?",
              options: ["12", "9", "14", "7"],
              answer: 0,
              explain: "pre[4] - pre[1] = 14 - 2 = 12.",
            },
            {
              type: "order",
              prompt: "Arrange the lines to build a prefix-sum array.",
              lines: ["pre = [0]", "for x in a:", "    pre.append(pre[-1] + x)"],
              explain: "Start with 0, then each entry adds the next element to the previous total.",
            },
            {
              type: "code",
              prompt:
                "Line 1: n and q. Line 2: n integers. Then q lines each with l r (1-indexed, inclusive). Print the sum of each range on its own line.",
              starter: "n, q = map(int, input().split())\na = list(map(int, input().split()))\n",
              tests: [
                { input: "5 3\n3 1 4 1 5\n1 3\n2 5\n4 4", expected: "8\n11\n1" },
                { input: "1 1\n-7\n1 1", expected: "-7" },
              ],
              hint: "Build pre, then each answer is pre[r] - pre[l - 1].",
              solution:
                "n, q = map(int, input().split())\na = list(map(int, input().split()))\npre = [0]\nfor x in a:\n    pre.append(pre[-1] + x)\nfor _ in range(q):\n    l, r = map(int, input().split())\n    print(pre[r] - pre[l - 1])",
            },
          ],
        },
        {
          id: "algo-1-3",
          title: "Two pointers",
          steps: [
            {
              type: "learn",
              title: "Squeeze from both ends",
              body: "On a **sorted** list, put one pointer at each end. If the pair sum is too small, move the left pointer right; too big, move the right pointer left. That's **O(n)** instead of checking every pair.",
              code: "def has_pair(a, target):\n    i, j = 0, len(a) - 1\n    while i < j:\n        s = a[i] + a[j]\n        if s == target:\n            return True\n        if s < target:\n            i += 1\n        else:\n            j -= 1\n    return False",
            },
            {
              type: "choice",
              prompt: "a = [1, 3, 6, 9], target = 12. The first sum is 1 + 9 = 10. What moves?",
              options: ["Left pointer moves right", "Right pointer moves left", "Both move", "Stop: not found"],
              answer: 0,
              explain: "10 < 12, so we need a bigger sum — move the left pointer to a larger number.",
            },
            {
              type: "choice",
              prompt: "Why must the list be sorted?",
              options: [
                "So moving a pointer predictably increases or decreases the sum",
                "Because Python requires it",
                "To remove duplicates",
                "It doesn't need to be",
              ],
              answer: 0,
              explain: "Sorting guarantees that moving left→right increases values and right→left decreases them.",
            },
            {
              type: "code",
              prompt: "Line 1: n and target. Line 2: n sorted integers. Print YES if two different elements sum to target, else NO.",
              starter: "n, target = map(int, input().split())\na = list(map(int, input().split()))\n",
              tests: [
                { input: "4 12\n1 3 6 9", expected: "YES" },
                { input: "4 100\n1 3 6 9", expected: "NO" },
                { input: "2 4\n2 2", expected: "YES" },
              ],
              hint: "Use the two-pointer loop from the lesson.",
              solution:
                'n, target = map(int, input().split())\na = list(map(int, input().split()))\ni, j = 0, n - 1\nfound = False\nwhile i < j:\n    s = a[i] + a[j]\n    if s == target:\n        found = True\n        break\n    if s < target:\n        i += 1\n    else:\n        j -= 1\nprint("YES" if found else "NO")',
            },
          ],
        },
      ],
    },
    {
      id: "algo-u2",
      title: "Search & Recursion",
      description: "Binary search, sorting and recursive thinking.",
      level: "Intermediate",
      lessons: [
        {
          id: "algo-2-1",
          title: "Binary search",
          steps: [
            {
              type: "learn",
              title: "Guess the middle",
              body: "To find a value in a sorted list, look at the middle. If it's too small, discard the left half; too big, discard the right half. Each step halves the range: **O(log n)**.",
              code: "def search(a, x):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == x:\n            return mid\n        if a[mid] < x:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1",
            },
            {
              type: "choice",
              prompt: "About how many steps does binary search need for 1,000,000 items?",
              options: ["~20", "~1000", "~500,000", "~1,000,000"],
              answer: 0,
              explain: "2²⁰ ≈ 1,048,576, so about 20 halvings.",
            },
            {
              type: "fill",
              prompt: "If a[mid] is smaller than x, the answer is to the right:",
              template: "if a[mid] < x:\n    lo = ___",
              answers: ["mid + 1"],
              bank: ["mid + 1", "mid", "mid - 1", "hi"],
              explain: "a[mid] itself is too small, so we can skip it as well.",
            },
            {
              type: "code",
              prompt: "Line 1: n and x. Line 2: n sorted distinct integers. Print the 0-based index of x, or -1 if it is missing.",
              starter: "n, x = map(int, input().split())\na = list(map(int, input().split()))\n",
              tests: [
                { input: "6 9\n1 3 5 7 9 11", expected: "4" },
                { input: "6 4\n1 3 5 7 9 11", expected: "-1" },
                { input: "1 5\n5", expected: "0" },
              ],
              hint: "Use lo/hi pointers and mid = (lo + hi) // 2.",
              solution:
                "n, x = map(int, input().split())\na = list(map(int, input().split()))\nlo, hi = 0, n - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == x:\n        ans = mid\n        break\n    if a[mid] < x:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(ans)",
            },
          ],
        },
        {
          id: "algo-2-2",
          title: "Sorting",
          steps: [
            {
              type: "learn",
              title: "Let Python sort",
              body: "`sorted(a)` returns a new sorted list; `a.sort()` sorts in place. Both run in **O(n log n)**.\n\nUse `key=` to sort by something custom and `reverse=True` for descending.",
              code: 'words = ["kiwi", "fig", "banana"]\nprint(sorted(words, key=len))  # [\'fig\', \'kiwi\', \'banana\']\nprint(sorted([3, 1, 2], reverse=True))  # [3, 2, 1]',
            },
            {
              type: "choice",
              prompt: "What is printed?",
              code: "pts = [(2, 'b'), (1, 'z'), (2, 'a')]\nprint(sorted(pts)[0])",
              options: ["(2, 'b')", "(1, 'z')", "(2, 'a')", "Error"],
              answer: 1,
              explain: "Tuples compare element by element, so the smallest first number wins: (1, 'z').",
            },
            {
              type: "choice",
              prompt: "Sorting first, then scanning once, makes a solution:",
              options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
              answer: 1,
              explain: "O(n log n) + O(n) is dominated by the sort.",
            },
            {
              type: "code",
              prompt: "Line 1: n. Line 2: n integers. Print the numbers sorted in descending order, space-separated.",
              starter: "n = int(input())\na = list(map(int, input().split()))\n",
              tests: [
                { input: "5\n4 1 9 3 7", expected: "9 7 4 3 1" },
                { input: "3\n-1 -5 0", expected: "0 -1 -5" },
              ],
              hint: 'print(*sorted(a, reverse=True)) — the * spreads the list into separate arguments.',
              solution: "n = int(input())\na = list(map(int, input().split()))\nprint(*sorted(a, reverse=True))",
            },
          ],
        },
        {
          id: "algo-2-3",
          title: "Recursion",
          steps: [
            {
              type: "learn",
              title: "Functions that call themselves",
              body: "A recursive function solves a problem by solving a **smaller version** of the same problem.\n\nEvery recursion needs a **base case** that stops it.",
              code: "def countdown(n):\n    if n == 0:        # base case\n        print(\"Go!\")\n        return\n    print(n)\n    countdown(n - 1)  # smaller problem",
            },
            {
              type: "choice",
              prompt: "What does f(4) return?",
              code: "def f(n):\n    if n <= 1:\n        return 1\n    return n * f(n - 1)",
              options: ["4", "10", "24", "Infinite loop"],
              answer: 2,
              explain: "f(4) = 4 · 3 · 2 · 1 = 24 — it's factorial.",
            },
            {
              type: "choice",
              prompt: "What happens without a base case?",
              options: ["It returns 0", "RecursionError: maximum recursion depth exceeded", "It runs once", "Python adds one automatically"],
              answer: 1,
              explain: "The function keeps calling itself until Python's call stack limit is hit.",
            },
            {
              type: "order",
              prompt: "Arrange a recursive function that sums a list.",
              lines: ["def total(a):", "    if not a:", "        return 0", "    return a[0] + total(a[1:])"],
              explain: "Empty list is the base case; otherwise first item + sum of the rest.",
            },
            {
              type: "code",
              prompt: "Read n (0 ≤ n ≤ 30) and print the n-th Fibonacci number, where fib(0) = 0 and fib(1) = 1.",
              starter: "def fib(n):\n    # your code\n    pass\n\nprint(fib(int(input())))\n",
              tests: [
                { input: "0", expected: "0" },
                { input: "10", expected: "55" },
                { input: "30", expected: "832040" },
              ],
              hint: "Plain recursion recomputes a lot. A loop with two variables (a, b) is instant.",
              solution: "def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint(fib(int(input())))",
            },
          ],
        },
      ],
    },
    ...algorithmsMoreUnits,
  ],
};
