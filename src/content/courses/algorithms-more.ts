import type { Unit } from "../types";

/** Algorithms units 3–6: data structures, graphs, DP and advanced techniques. */
export const algorithmsMoreUnits: Unit[] = [
  {
    id: "algo-u3",
    title: "Core Data Structures",
    description: "Stacks, queues, hash maps and heaps.",
    level: "Intermediate",
    lessons: [
      {
        id: "algo-3-1",
        title: "Stacks & queues",
        steps: [
          {
            type: "learn",
            title: "LIFO and FIFO",
            body: "A **stack** is last-in, first-out (like a pile of plates): a Python list's `append` and `pop` are O(1).\n\nA **queue** is first-in, first-out (like a line at a shop). Use `collections.deque` — `popleft()` is O(1), while `list.pop(0)` is O(n).",
            code: "from collections import deque\n\nstack = [1, 2, 3]\nprint(stack.pop())      # 3\n\nq = deque([1, 2, 3])\nq.append(4)\nprint(q.popleft())      # 1",
          },
          {
            type: "choice",
            prompt: "Undo history in an editor is best modelled as a…",
            options: ["Queue", "Stack", "Set", "Heap"],
            answer: 1,
            explain: "The most recent action is undone first — last in, first out.",
          },
          {
            type: "choice",
            prompt: "Why prefer `deque.popleft()` over `list.pop(0)`?",
            options: ["It returns a copy", "It's O(1); list.pop(0) shifts every element (O(n))", "Lists can't pop", "No difference"],
            answer: 1,
            explain: "Removing from the front of a list moves all remaining items one slot left.",
          },
          {
            type: "learn",
            title: "Rotating a deque",
            body: "`dq.rotate(-k)` moves the first k items to the back — perfect for circular simulations.",
            code: "from collections import deque\nd = deque([1, 2, 3, 4])\nd.rotate(-1)\nprint(list(d))  # [2, 3, 4, 1]",
          },
          {
            type: "code",
            prompt:
              "**Josephus game.** N people (1..N) stand in a circle. Counting starts at person 1; every K-th person is removed. Print the order in which people are removed, space-separated.",
            starter: "from collections import deque\n\nn, k = map(int, input().split())\n",
            tests: [
              { input: "7 3", expected: "3 6 2 7 5 1 4" },
              { input: "5 1", expected: "1 2 3 4 5" },
              { input: "1 4", expected: "1" },
            ],
            hint: "people = deque(range(1, n + 1)); repeatedly rotate(-(k - 1)) then popleft().",
            solution:
              "from collections import deque\n\nn, k = map(int, input().split())\npeople = deque(range(1, n + 1))\norder = []\nwhile people:\n    people.rotate(-(k - 1))\n    order.append(people.popleft())\nprint(*order)",
          },
        ],
      },
      {
        id: "algo-3-2",
        title: "Hash maps for speed",
        steps: [
          {
            type: "learn",
            title: "Trade memory for time",
            body: "Dictionaries and sets give **O(1)** average lookups. Remembering what you've already seen often turns an O(n²) double loop into a single O(n) pass.",
            code: "# O(n^2): check every pair\n# O(n):  remember what we've seen\nseen = set()\nfor x in nums:\n    if target - x in seen:\n        print(\"found a pair\")\n    seen.add(x)",
          },
          {
            type: "choice",
            prompt: "Finding duplicates with a set instead of comparing every pair changes the time from…",
            options: ["O(n) to O(1)", "O(n²) to O(n)", "O(log n) to O(n)", "It doesn't change"],
            answer: 1,
            explain: "One pass with O(1) set lookups replaces the nested loop.",
          },
          {
            type: "choice",
            prompt: "What's the worst case for a hash lookup when many keys collide?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            answer: 1,
            explain: "With heavy collisions a bucket can hold many keys. Good hash functions make that rare, so we say O(1) on average.",
          },
          {
            type: "order",
            prompt: "Arrange the one-pass algorithm that finds the first repeated value.",
            lines: ["seen = set()", "for x in nums:", "    if x in seen:", "        print(x)", "        break", "    seen.add(x)"],
            explain: "Check before adding, so the first repeat is caught immediately.",
          },
          {
            type: "code",
            prompt:
              "**Two Sum.** Line 1: N and T. Line 2: N integers. Find indices i < j with A[i] + A[j] = T, choosing the pair whose **j is smallest** (and for that j, the smallest i). Print `i j` (0-based) or `-1` if none.",
            starter: "n, t = map(int, input().split())\na = list(map(int, input().split()))\n",
            tests: [
              { input: "5 9\n2 7 11 15 1", expected: "0 1" },
              { input: "4 6\n3 1 3 5", expected: "0 2" },
              { input: "3 100\n1 2 3", expected: "-1" },
            ],
            hint: "Store the first index of each value in a dict; for each j check whether t - a[j] is already there.",
            solution:
              "n, t = map(int, input().split())\na = list(map(int, input().split()))\nfirst = {}\nans = None\nfor j, x in enumerate(a):\n    if t - x in first:\n        ans = (first[t - x], j)\n        break\n    first.setdefault(x, j)\nprint(*ans if ans else [-1])",
          },
        ],
      },
      {
        id: "algo-3-3",
        title: "Heaps & priority queues",
        steps: [
          {
            type: "learn",
            title: "Always grab the smallest",
            body: "A **heap** keeps the smallest item at the front. `heapq.heappush` and `heapq.heappop` are **O(log n)** — much faster than re-sorting a list each time.",
            code: "import heapq\n\nh = []\nfor x in [5, 1, 8, 3]:\n    heapq.heappush(h, x)\nprint(heapq.heappop(h))  # 1\nprint(heapq.heappop(h))  # 3",
          },
          {
            type: "learn",
            title: "Priorities and max-heaps",
            body: "Push **tuples** to order by priority (ties fall back to the next field). Python only has min-heaps — negate values to simulate a max-heap.",
            code: 'import heapq\ntasks = []\nheapq.heappush(tasks, (2, "email"))\nheapq.heappush(tasks, (1, "bugfix"))\nprint(heapq.heappop(tasks)[1])  # bugfix\n\nprint(heapq.nlargest(2, [4, 9, 1, 7]))  # [9, 7]',
          },
          {
            type: "choice",
            prompt: "What's the time complexity of pushing n items and popping them all from a heap?",
            options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
            answer: 1,
            explain: "n operations × O(log n) each.",
          },
          {
            type: "choice",
            prompt: "How do you pop the **largest** number using heapq?",
            options: ["heapq.heappop_max", "Push -x and negate what you pop", "Use reverse=True", "It's impossible"],
            answer: 1,
            explain: "The smallest of the negated values is the largest original value.",
          },
          {
            type: "code",
            prompt:
              "Process commands until `end`: `add NAME P` adds a task with priority P; `next` prints and removes the task with the **lowest** P (ties: alphabetically smallest name), or prints `empty`.",
            starter: "import heapq\n\nheap = []\n",
            tests: [
              { input: "add email 2\nadd bugfix 1\nadd deploy 2\nnext\nnext\nnext\nnext\nend", expected: "bugfix\ndeploy\nemail\nempty" },
            ],
            hint: "heapq.heappush(heap, (p, name)) — tuples compare priority first, then name.",
            solution:
              'import heapq\n\nheap = []\nwhile True:\n    parts = input().split()\n    if parts[0] == "end":\n        break\n    if parts[0] == "add":\n        heapq.heappush(heap, (int(parts[2]), parts[1]))\n    else:\n        print(heapq.heappop(heap)[1] if heap else "empty")',
          },
        ],
      },
    ],
  },
  {
    id: "algo-u4",
    title: "Graphs",
    description: "Model connections and explore them with BFS and DFS.",
    level: "Advanced",
    lessons: [
      {
        id: "algo-4-1",
        title: "Representing graphs",
        steps: [
          {
            type: "learn",
            title: "Nodes and edges",
            body: "A **graph** is a set of nodes connected by edges — cities and roads, users and friendships, pages and links. Edges can be **undirected** (two-way) or **directed** (one-way).",
            code: "# Undirected edges between nodes 1..4\nedges = [(1, 2), (1, 3), (3, 4)]",
          },
          {
            type: "learn",
            title: "Adjacency lists",
            body: "Store, for each node, the list of its neighbours. It uses O(V + E) memory and makes \"visit all neighbours\" fast.",
            code: "n = 4\nadj = [[] for _ in range(n + 1)]\nfor u, v in edges:\n    adj[u].append(v)\n    adj[v].append(u)  # omit for directed graphs\nprint(adj[1])  # [2, 3]",
          },
          {
            type: "choice",
            prompt: "In an undirected graph with E edges, what is the sum of all node degrees?",
            options: ["E", "2E", "E²", "V + E"],
            answer: 1,
            explain: "Every edge adds 1 to the degree of both of its endpoints.",
          },
          {
            type: "choice",
            prompt: "When is an adjacency **matrix** (V×V grid) a poor choice?",
            options: ["Small dense graphs", "Huge sparse graphs, like a social network", "When you need O(1) edge checks", "Never"],
            answer: 1,
            explain: "A matrix needs V² memory even if most entries are zero.",
          },
          {
            type: "code",
            prompt: "Line 1: N and M. Next M lines: undirected edges `u v` (1-indexed). Print the degree of every node 1..N, space-separated, then on a second line the node with the highest degree (smallest id on ties).",
            starter: "n, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\n",
            tests: [
              { input: "4 3\n1 2\n1 3\n3 4", expected: "2 1 2 1\n1" },
              { input: "3 0", expected: "0 0 0\n1" },
            ],
            hint: "deg = [len(adj[v]) for v in range(1, n + 1)]; best = deg.index(max(deg)) + 1",
            solution:
              "n, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    adj[u].append(v)\n    adj[v].append(u)\ndeg = [len(adj[v]) for v in range(1, n + 1)]\nprint(*deg)\nprint(deg.index(max(deg)) + 1)",
          },
        ],
      },
      {
        id: "algo-4-2",
        title: "Breadth-first search",
        steps: [
          {
            type: "learn",
            title: "Explore in rings",
            body: "**BFS** visits the start, then all nodes 1 edge away, then 2 edges away, and so on, using a queue. In an unweighted graph, the first time BFS reaches a node is along a **shortest path**.",
            code: "from collections import deque\n\ndist = [-1] * (n + 1)\ndist[start] = 0\nq = deque([start])\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if dist[v] == -1:\n            dist[v] = dist[u] + 1\n            q.append(v)",
          },
          {
            type: "choice",
            prompt: "Which data structure drives BFS?",
            options: ["Stack", "Queue", "Heap", "Set only"],
            answer: 1,
            explain: "A FIFO queue processes nodes in order of distance.",
          },
          {
            type: "choice",
            prompt: "What is BFS's time complexity with an adjacency list?",
            options: ["O(V)", "O(V + E)", "O(V²)", "O(E log V)"],
            answer: 1,
            explain: "Each node is dequeued once and each edge is examined a constant number of times.",
          },
          {
            type: "order",
            prompt: "Arrange the core BFS loop.",
            lines: ["while q:", "    u = q.popleft()", "    for v in adj[u]:", "        if dist[v] == -1:", "            dist[v] = dist[u] + 1", "            q.append(v)"],
            explain: "Mark distance when a node is first discovered so it's never queued twice.",
          },
          {
            type: "code",
            prompt: "Line 1: N and M. Next M lines: undirected edges. Print the fewest edges on a path from node 1 to node N, or `-1` if N is unreachable.",
            starter: "from collections import deque\n\nn, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    adj[u].append(v)\n    adj[v].append(u)\n",
            tests: [
              { input: "5 5\n1 2\n2 3\n3 5\n1 4\n4 3", expected: "3" },
              { input: "4 2\n1 2\n3 4", expected: "-1" },
              { input: "1 0", expected: "0" },
            ],
            hint: "Run BFS from 1 and print dist[n].",
            solution:
              "from collections import deque\n\nn, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    adj[u].append(v)\n    adj[v].append(u)\ndist = [-1] * (n + 1)\ndist[1] = 0\nq = deque([1])\nwhile q:\n    u = q.popleft()\n    for v in adj[u]:\n        if dist[v] == -1:\n            dist[v] = dist[u] + 1\n            q.append(v)\nprint(dist[n])",
          },
        ],
      },
      {
        id: "algo-4-3",
        title: "Depth-first search & components",
        steps: [
          {
            type: "learn",
            title: "Go deep first",
            body: "**DFS** follows one path as far as possible before backtracking. Use recursion or an explicit **stack**. It's ideal for exploring everything reachable, detecting cycles and topological sorting.",
            code: "def dfs(u):\n    seen[u] = True\n    for v in adj[u]:\n        if not seen[v]:\n            dfs(v)",
          },
          {
            type: "learn",
            title: "Connected components",
            body: "Start a DFS from every unvisited node. Each new start discovers one **connected component** — a group of nodes that can all reach each other.",
            code: "components = 0\nfor u in range(1, n + 1):\n    if not seen[u]:\n        components += 1\n        dfs(u)",
          },
          {
            type: "choice",
            prompt: "Why might recursive DFS crash in Python on a 100,000-node path?",
            options: ["DFS is O(n²)", "Python's recursion limit (~1000 frames)", "Lists are too small", "It can't — DFS never crashes"],
            answer: 1,
            explain: "Deep recursion overflows the call stack. Use an explicit stack for big graphs.",
          },
          {
            type: "choice",
            prompt: "Which finds the shortest path (fewest edges) in an unweighted graph?",
            options: ["DFS", "BFS", "Both always", "Neither"],
            answer: 1,
            explain: "DFS may wander down a long path first; BFS explores in order of distance.",
          },
          {
            type: "code",
            prompt: "Line 1: N and M. Next M lines: undirected edges. Print the number of connected components, then the size of the largest one. Use an **iterative** DFS (explicit stack).",
            starter: "n, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    adj[u].append(v)\n    adj[v].append(u)\n",
            tests: [
              { input: "6 3\n1 2\n2 3\n4 5", expected: "3\n3" },
              { input: "3 0", expected: "3\n1" },
            ],
            hint: "stack = [start]; while stack: u = stack.pop(); for v in adj[u]: if not seen[v]: seen[v] = True; stack.append(v)",
            solution:
              "n, m = map(int, input().split())\nadj = [[] for _ in range(n + 1)]\nfor _ in range(m):\n    u, v = map(int, input().split())\n    adj[u].append(v)\n    adj[v].append(u)\nseen = [False] * (n + 1)\ncount = 0\nbiggest = 0\nfor s in range(1, n + 1):\n    if seen[s]:\n        continue\n    count += 1\n    seen[s] = True\n    stack = [s]\n    size = 0\n    while stack:\n        u = stack.pop()\n        size += 1\n        for v in adj[u]:\n            if not seen[v]:\n                seen[v] = True\n                stack.append(v)\n    biggest = max(biggest, size)\nprint(count)\nprint(biggest)",
          },
        ],
      },
    ],
  },
  {
    id: "algo-u5",
    title: "Dynamic Programming",
    description: "Solve big problems by remembering small answers.",
    level: "Advanced",
    lessons: [
      {
        id: "algo-5-1",
        title: "Memoization",
        steps: [
          {
            type: "learn",
            title: "Don't solve the same thing twice",
            body: "Naive recursive Fibonacci recomputes the same values exponentially many times. **Memoization** caches each answer the first time it's computed, so every subproblem is solved once.",
            code: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(80))  # instant",
          },
          {
            type: "choice",
            prompt: "Roughly how many calls does *un*-memoized fib(n) make?",
            options: ["n", "n²", "Exponential (~1.6ⁿ)", "log n"],
            answer: 2,
            explain: "Each call branches into two, re-solving the same subproblems over and over.",
          },
          {
            type: "choice",
            prompt: "Dynamic programming applies when a problem has…",
            options: [
              "Only one input",
              "Overlapping subproblems and optimal substructure",
              "Sorted input",
              "No recursion",
            ],
            answer: 1,
            explain: "The same smaller problems repeat, and the best answer is built from best sub-answers.",
          },
          {
            type: "fill",
            prompt: "Cache results automatically.",
            template: "from functools import lru_cache\n\n@___(maxsize=None)\ndef ways(n):\n    ...",
            answers: ["lru_cache"],
            bank: ["lru_cache", "cache_it", "memo", "static"],
            explain: "`functools.lru_cache` (or `functools.cache`) memoizes a function.",
          },
          {
            type: "code",
            prompt: "You can climb 1, 2 or 3 stairs at a time. In how many ways can you climb exactly N stairs? (0 ≤ N ≤ 60)",
            starter: "from functools import lru_cache\n\nn = int(input())\n",
            tests: [
              { input: "4", expected: "7" },
              { input: "0", expected: "1" },
              { input: "60", expected: "4680045560037375" },
            ],
            hint: "ways(n) = ways(n-1) + ways(n-2) + ways(n-3), with ways(0) = 1 and ways(negative) = 0.",
            solution:
              "from functools import lru_cache\n\nn = int(input())\n\n@lru_cache(maxsize=None)\ndef ways(k):\n    if k < 0:\n        return 0\n    if k == 0:\n        return 1\n    return ways(k - 1) + ways(k - 2) + ways(k - 3)\n\nprint(ways(n))",
          },
        ],
      },
      {
        id: "algo-5-2",
        title: "1-D DP tables",
        steps: [
          {
            type: "learn",
            title: "Bottom-up",
            body: "Instead of recursing, fill a table from the smallest subproblem upward. Define what `dp[i]` means, find the **recurrence**, set the **base cases**, and loop.",
            code: "# dp[i] = number of ways to climb i stairs with steps of 1 or 2\ndp = [0] * (n + 1)\ndp[0] = 1\nfor i in range(1, n + 1):\n    dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)",
          },
          {
            type: "learn",
            title: "Take it or leave it",
            body: "**House robber:** you can't rob two adjacent houses. For each house, either skip it (`dp[i-1]`) or rob it (`dp[i-2] + value`) — take the better one.",
            code: "best = [0] * (n + 1)\nfor i in range(1, n + 1):\n    rob = (best[i - 2] if i >= 2 else 0) + a[i - 1]\n    best[i] = max(best[i - 1], rob)",
          },
          {
            type: "choice",
            prompt: "Houses hold [2, 7, 9, 3, 1]. What's the most you can take without robbing neighbours?",
            options: ["11", "12", "10", "22"],
            answer: 1,
            explain: "2 + 9 + 1 = 12.",
          },
          {
            type: "choice",
            prompt: "If dp[i] only depends on dp[i-1] and dp[i-2], how much memory do you really need?",
            options: ["O(n)", "O(1) — just two variables", "O(n²)", "O(log n)"],
            answer: 1,
            explain: "Roll the two previous values forward instead of storing the whole table.",
          },
          {
            type: "code",
            prompt: "**House robber.** Line 1: N. Line 2: N non-negative integers. Print the maximum sum you can take without taking two adjacent values.",
            starter: "n = int(input())\na = list(map(int, input().split()))\n",
            tests: [
              { input: "5\n2 7 9 3 1", expected: "12" },
              { input: "4\n1 2 3 1", expected: "4" },
              { input: "1\n5", expected: "5" },
            ],
            hint: "Keep prev2 and prev1; for each x: cur = max(prev1, prev2 + x).",
            solution:
              "n = int(input())\na = list(map(int, input().split()))\nprev2 = prev1 = 0\nfor x in a:\n    prev2, prev1 = prev1, max(prev1, prev2 + x)\nprint(prev1)",
          },
        ],
      },
      {
        id: "algo-5-3",
        title: "2-D DP tables",
        steps: [
          {
            type: "learn",
            title: "Two indices",
            body: "Some problems need a grid of subproblems. **Longest common subsequence**: `dp[i][j]` is the LCS length of the first i letters of `a` and the first j letters of `b`.",
            code: "for i in range(1, len(a) + 1):\n    for j in range(1, len(b) + 1):\n        if a[i - 1] == b[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1] + 1\n        else:\n            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])",
          },
          {
            type: "choice",
            prompt: "What is the LCS of \"ABCBDAB\" and \"BDCABA\"?",
            options: ["3", "4", "5", "6"],
            answer: 1,
            explain: "For example \"BCBA\" — length 4.",
          },
          {
            type: "learn",
            title: "Grid paths",
            body: "Counting paths in a grid that only moves right or down: `dp[r][c] = dp[r-1][c] + dp[r][c-1]`, with blocked cells set to 0.",
            code: "for r in range(rows):\n    for c in range(cols):\n        if grid[r][c] == \"#\":\n            dp[r][c] = 0\n        elif r or c:\n            dp[r][c] = (dp[r - 1][c] if r else 0) + (dp[r][c - 1] if c else 0)",
          },
          {
            type: "choice",
            prompt: "What's the time complexity of the LCS table for strings of length n and m?",
            options: ["O(n + m)", "O(n · m)", "O(2ⁿ)", "O(n log m)"],
            answer: 1,
            explain: "One constant-time cell per (i, j) pair.",
          },
          {
            type: "code",
            prompt: "Read two strings (one per line). Print the length of their longest common subsequence.",
            starter: "a = input()\nb = input()\n",
            tests: [
              { input: "ABCBDAB\nBDCABA", expected: "4" },
              { input: "abc\nxyz", expected: "0" },
              { input: "streak\nsteak", expected: "5" },
            ],
            hint: "dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)], then fill with the recurrence.",
            solution:
              "a = input()\nb = input()\ndp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\nfor i in range(1, len(a) + 1):\n    for j in range(1, len(b) + 1):\n        if a[i - 1] == b[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1] + 1\n        else:\n            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\nprint(dp[len(a)][len(b)])",
          },
        ],
      },
    ],
  },
  {
    id: "algo-u6",
    title: "Advanced Techniques",
    description: "Sliding windows, greedy choices, binary search on answers and bits.",
    level: "Advanced",
    lessons: [
      {
        id: "algo-6-1",
        title: "Sliding window",
        steps: [
          {
            type: "learn",
            title: "Move a window, don't restart",
            body: "For problems about **contiguous** ranges, keep a window `[left, right]`. Expand right one step at a time and shrink left only when the window breaks a rule. Each pointer moves at most n times: **O(n)**.",
            code: "# max sum of any k consecutive numbers\nwindow = sum(a[:k])\nbest = window\nfor i in range(k, len(a)):\n    window += a[i] - a[i - k]\n    best = max(best, window)",
          },
          {
            type: "choice",
            prompt: "a = [1, 4, 2, 10, 2, 3], k = 3. What's the best window sum?",
            options: ["15", "16", "17", "14"],
            answer: 1,
            explain: "4 + 2 + 10 = 16.",
          },
          {
            type: "choice",
            prompt: "Why is the sliding window O(n) even though it has a nested while loop?",
            options: [
              "The inner loop runs once",
              "left only moves forward, so across the whole run it moves at most n times",
              "Python optimises it",
              "It's actually O(n²)",
            ],
            answer: 1,
            explain: "Amortised analysis: total pointer moves are bounded by 2n.",
          },
          {
            type: "order",
            prompt: "Arrange the variable-size window that shrinks while the window has a duplicate.",
            lines: ["for right, ch in enumerate(s):", "    while ch in window:", "        window.remove(s[left])", "        left += 1", "    window.add(ch)", "    best = max(best, right - left + 1)"],
            explain: "Shrink until the new character fits, then add it and record the size.",
          },
          {
            type: "code",
            prompt: "Read a string. Print the length of the longest substring with **no repeated characters**.",
            starter: "s = input()\n",
            tests: [
              { input: "abcabcbb", expected: "3" },
              { input: "bbbbb", expected: "1" },
              { input: "pwwkew", expected: "3" },
              { input: "techniance", expected: "7" },
            ],
            hint: "Track the last index of each character; when it repeats inside the window, jump left past it.",
            solution:
              "s = input()\nlast = {}\nleft = 0\nbest = 0\nfor right, ch in enumerate(s):\n    if ch in last and last[ch] >= left:\n        left = last[ch] + 1\n    last[ch] = right\n    best = max(best, right - left + 1)\nprint(best)",
          },
        ],
      },
      {
        id: "algo-6-2",
        title: "Greedy algorithms",
        steps: [
          {
            type: "learn",
            title: "Best choice now",
            body: "A **greedy** algorithm makes the locally best choice at each step and never looks back. It's fast and simple — but only correct when you can prove the local choice is safe.",
            code: "# Make change with the fewest coins (works for 25/10/5/1)\nfor coin in [25, 10, 5, 1]:\n    count += amount // coin\n    amount %= coin",
          },
          {
            type: "choice",
            prompt: "Coins are [1, 3, 4] and you need 6. Greedy takes 4 + 1 + 1. What's optimal?",
            options: ["4 + 1 + 1 (3 coins)", "3 + 3 (2 coins)", "6 coins of 1", "Impossible"],
            answer: 1,
            explain: "Greedy isn't always optimal — this coin system needs dynamic programming.",
          },
          {
            type: "learn",
            title: "Interval scheduling",
            body: "To attend the most non-overlapping events, **always pick the one that ends earliest** among those that start after your last pick. Finishing early leaves the most room for the rest.",
            code: "events.sort(key=lambda e: e[1])  # by end time\nend = -1\nfor s, e in events:\n    if s >= end:\n        count += 1\n        end = e",
          },
          {
            type: "choice",
            prompt: "Why sort by end time instead of start time?",
            options: [
              "It's alphabetical",
              "An event that starts early could last all day and block everything else",
              "Start times can be negative",
              "No reason",
            ],
            answer: 1,
            explain: "Earliest finish leaves the most remaining time — that's the provably safe choice.",
          },
          {
            type: "code",
            prompt: "Line 1: N. Next N lines: `start end` of an event (an event can begin exactly when another ends). Print the maximum number of non-overlapping events you can attend.",
            starter: "n = int(input())\nevents = [tuple(map(int, input().split())) for _ in range(n)]\n",
            tests: [
              { input: "4\n1 3\n2 5\n3 6\n6 7", expected: "3" },
              { input: "3\n1 10\n2 3\n4 5", expected: "2" },
            ],
            hint: "Sort by end, take an event when its start >= the last chosen end.",
            solution:
              "n = int(input())\nevents = [tuple(map(int, input().split())) for _ in range(n)]\nevents.sort(key=lambda e: e[1])\ncount = 0\nend = float(\"-inf\")\nfor s, e in events:\n    if s >= end:\n        count += 1\n        end = e\nprint(count)",
          },
        ],
      },
      {
        id: "algo-6-3",
        title: "Binary search on the answer",
        steps: [
          {
            type: "learn",
            title: "Search the answer space",
            body: "Sometimes you can't compute the answer directly, but you can quickly **check** whether a candidate works — and if X works, everything bigger works too. Then binary search over the candidates.",
            code: "lo, hi = 1, max_possible\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if works(mid):\n        hi = mid       # mid might be the answer\n    else:\n        lo = mid + 1   # need something bigger\nprint(lo)",
          },
          {
            type: "choice",
            prompt: "What property must `works(x)` have for this to be correct?",
            options: [
              "It must be O(1)",
              "Monotonic: once it's true, it stays true for every larger x",
              "It must use recursion",
              "It must be random",
            ],
            answer: 1,
            explain: "Binary search needs a false…false, true…true boundary to find.",
          },
          {
            type: "choice",
            prompt: "Checking costs O(n) and answers range up to 10⁹. Total time?",
            options: ["O(n · 10⁹)", "O(n log 10⁹) ≈ 30n", "O(log n)", "O(n²)"],
            answer: 1,
            explain: "About 30 halvings, each with one O(n) check.",
          },
          {
            type: "fill",
            prompt: "When mid works, keep it as a candidate and search left.",
            template: "if works(mid):\n    hi = ___\nelse:\n    lo = ___",
            answers: ["mid", "mid + 1"],
            bank: ["mid", "mid + 1", "mid - 1", "lo"],
            explain: "mid might be the smallest answer, so hi doesn't skip it; a failing mid can be skipped.",
          },
          {
            type: "code",
            prompt:
              "**Study speed.** You have N chapters with page counts and H hours. Each hour you read up to K pages of a single chapter (leftover time in that hour is wasted). Find the minimum integer K that lets you finish within H hours. Line 1: N H. Line 2: pages.",
            starter: "n, h = map(int, input().split())\npages = list(map(int, input().split()))\n",
            tests: [
              { input: "4 8\n3 6 7 11", expected: "4" },
              { input: "5 5\n30 11 23 4 20", expected: "30" },
              { input: "5 6\n30 11 23 4 20", expected: "23" },
            ],
            hint: "works(k) = sum(ceil(p / k)) <= h. Use (p + k - 1) // k for the ceiling.",
            solution:
              "n, h = map(int, input().split())\npages = list(map(int, input().split()))\n\ndef works(k):\n    return sum((p + k - 1) // k for p in pages) <= h\n\nlo, hi = 1, max(pages)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if works(mid):\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo)",
          },
        ],
      },
      {
        id: "algo-6-4",
        title: "Bit manipulation",
        steps: [
          {
            type: "learn",
            title: "Thinking in binary",
            body: "Integers are stored as bits. Bitwise operators work on every bit at once:\n\n- `&` AND, `|` OR, `^` XOR\n- `<<` shift left (×2), `>>` shift right (÷2)\n- `bin(x)` shows the bits",
            code: "print(bin(13))     # 0b1101\nprint(13 & 1)      # 1 → odd\nprint(1 << 4)      # 16\nprint(5 ^ 3)       # 6  (101 ^ 011 = 110)",
          },
          {
            type: "choice",
            prompt: "What is `x & (x - 1)` for x = 12 (1100)?",
            options: ["11", "8", "4", "0"],
            answer: 1,
            explain: "It clears the lowest set bit: 1100 → 1000 = 8. If the result is 0, x was a power of two.",
          },
          {
            type: "learn",
            title: "XOR tricks",
            body: "`x ^ x = 0` and `x ^ 0 = x`, and XOR is order-independent. So XOR-ing a list where every value appears twice except one leaves exactly that one.",
            code: "result = 0\nfor x in [4, 1, 2, 1, 2]:\n    result ^= x\nprint(result)  # 4",
          },
          {
            type: "choice",
            prompt: "Which expression checks whether x is a power of two (x > 0)?",
            options: ["x % 2 == 0", "x & (x - 1) == 0", "x ^ 1 == 0", "x >> 1 == 0"],
            answer: 1,
            explain: "Powers of two have exactly one set bit, which x - 1 removes.",
          },
          {
            type: "code",
            prompt:
              "Line 1: N. Line 2: N integers where every value appears **exactly twice** except one. Print that unique value, then on a second line the number of 1-bits in its binary representation.",
            starter: "n = int(input())\na = list(map(int, input().split()))\n",
            tests: [
              { input: "5\n4 1 2 1 2", expected: "4\n1" },
              { input: "7\n9 3 7 3 9 5 5", expected: "7\n3" },
            ],
            hint: "XOR everything together; bin(x).count('1') counts set bits.",
            solution: "n = int(input())\na = list(map(int, input().split()))\nx = 0\nfor v in a:\n    x ^= v\nprint(x)\nprint(bin(x).count(\"1\"))",
          },
        ],
      },
    ],
  },
];
