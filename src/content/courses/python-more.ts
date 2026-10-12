import type { Unit } from "../types";

/** Python units 5–9: intermediate and advanced material. */
export const pythonMoreUnits: Unit[] = [
  {
    id: "py-u5",
    title: "Tuples, Sets & Comprehensions",
    description: "More collections and the most Pythonic one-liners.",
    level: "Intermediate",
    lessons: [
      {
        id: "py-5-1",
        title: "Tuples & unpacking",
        steps: [
          {
            type: "learn",
            title: "Fixed-size groups",
            body: "A **tuple** is like a list that can't change. Use parentheses (or just commas).\n\nTuples are perfect for values that belong together: a point, a date, a name and a score.",
            code: 'point = (3, 4)\nprint(point[0])  # 3\n\nplayer = "ada", 120   # parentheses are optional\nprint(player)        # (\'ada\', 120)',
          },
          {
            type: "learn",
            title: "Unpacking",
            body: "Assign a tuple to several names at once. It's how Python swaps two variables without a temporary one.",
            code: "x, y = (3, 4)\nprint(x + y)  # 7\n\na, b = 1, 2\na, b = b, a   # swap!\nprint(a, b)   # 2 1",
          },
          {
            type: "choice",
            prompt: "What happens?",
            code: "t = (1, 2, 3)\nt[0] = 99",
            options: ["t becomes (99, 2, 3)", "TypeError: 'tuple' object does not support item assignment", "A new tuple is created", "Nothing"],
            answer: 1,
            explain: "Tuples are immutable — once created, their items can't be replaced.",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "first, *rest = [10, 20, 30, 40]\nprint(rest)",
            options: ["10", "[20, 30, 40]", "(20, 30, 40)", "Error"],
            answer: 1,
            explain: "The starred name collects every remaining item into a list.",
          },
          {
            type: "fill",
            prompt: "Swap the values of a and b in one line.",
            template: "a, b = ___, ___",
            answers: ["b", "a"],
            bank: ["a", "b", "tmp", "None"],
            explain: "The right side is evaluated first, then unpacked into the left side.",
          },
          {
            type: "code",
            prompt: "Write `min_max(nums)` that returns a tuple `(smallest, largest)`. Read a line of integers, unpack the result into two variables and print them on separate lines.",
            starter: "def min_max(nums):\n    # return a tuple\n    pass\n\nnums = list(map(int, input().split()))\n",
            tests: [
              { input: "4 9 1 7", expected: "1\n9" },
              { input: "-5 -2", expected: "-5\n-2" },
            ],
            hint: "return min(nums), max(nums) — then lo, hi = min_max(nums).",
            solution: "def min_max(nums):\n    return min(nums), max(nums)\n\nnums = list(map(int, input().split()))\nlo, hi = min_max(nums)\nprint(lo)\nprint(hi)",
          },
        ],
      },
      {
        id: "py-5-2",
        title: "Sets",
        steps: [
          {
            type: "learn",
            title: "Unique items only",
            body: "A **set** stores each value at most once and checks membership super fast. Duplicates simply disappear.",
            code: 'tags = {"python", "loops", "python"}\nprint(len(tags))          # 2\nprint("loops" in tags)    # True\ntags.add("sets")',
          },
          {
            type: "learn",
            title: "Set math",
            body: "- `a | b` union (in either)\n- `a & b` intersection (in both)\n- `a - b` difference (in a, not b)",
            code: "a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a & b))  # [2, 3]\nprint(sorted(a - b))  # [1]",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "print(len(set([1, 1, 2, 3, 3, 3])))",
            options: ["6", "3", "1", "2"],
            answer: 1,
            explain: "The set keeps {1, 2, 3}.",
          },
          {
            type: "choice",
            prompt: "Why is `x in my_set` usually faster than `x in my_list`?",
            options: [
              "Sets are sorted",
              "Sets use hashing, so lookup doesn't scan every item",
              "Lists can't contain numbers",
              "It isn't faster",
            ],
            answer: 1,
            explain: "Sets (and dict keys) are hash tables: membership is O(1) on average versus O(n) for lists.",
          },
          {
            type: "fill",
            prompt: "Find the languages both friends know.",
            template: 'ana = {"py", "js", "go"}\nben = {"js", "rust", "py"}\nprint(sorted(ana ___ ben))',
            answers: ["&"],
            bank: ["&", "|", "-", "+"],
            explain: "`&` keeps only items present in both sets.",
          },
          {
            type: "code",
            prompt: "Two lines of words are given. Print the words that appear in **both** lines, sorted alphabetically and separated by spaces. If there are none, print `none`.",
            starter: "a = set(input().split())\nb = set(input().split())\n",
            tests: [
              { input: "apple kiwi mango\nkiwi pear apple", expected: "apple kiwi" },
              { input: "a b\nc d", expected: "none" },
            ],
            hint: "common = a & b, then ' '.join(sorted(common)).",
            solution: 'a = set(input().split())\nb = set(input().split())\ncommon = sorted(a & b)\nprint(" ".join(common) if common else "none")',
          },
        ],
      },
      {
        id: "py-5-3",
        title: "Comprehensions",
        steps: [
          {
            type: "learn",
            title: "Build a list in one line",
            body: "A **list comprehension** transforms and filters in a single expression:\n\n`[expression for item in iterable if condition]`",
            code: "squares = [n * n for n in range(5)]\nprint(squares)  # [0, 1, 4, 9, 16]\n\nevens = [n for n in range(10) if n % 2 == 0]\nprint(evens)    # [0, 2, 4, 6, 8]",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'words = ["hi", "hello", "hey"]\nprint([len(w) for w in words if w.startswith("he")])',
            options: ["[2, 5, 3]", "[5, 3]", "[2]", "['hello', 'hey']"],
            answer: 1,
            explain: "Only 'hello' and 'hey' pass the filter, and we keep their lengths.",
          },
          {
            type: "learn",
            title: "Dict and set comprehensions",
            body: "The same idea works with braces: `{k: v for ...}` builds a dict and `{x for ...}` builds a set.",
            code: 'names = ["ada", "linus"]\nlengths = {n: len(n) for n in names}\nprint(lengths)  # {\'ada\': 3, \'linus\': 5}',
          },
          {
            type: "order",
            prompt: "Arrange the pieces of a comprehension that keeps the positive numbers, doubled.",
            lines: ["[", "x * 2", "for x in nums", "if x > 0", "]"],
            explain: "Expression first, then the loop, then the filter.",
          },
          {
            type: "code",
            prompt: "Read a line of integers. Using a comprehension, print the squares of the **odd** numbers, space-separated.",
            starter: "nums = list(map(int, input().split()))\n",
            tests: [
              { input: "1 2 3 4 5", expected: "1 9 25" },
              { input: "7 -3 8", expected: "49 9" },
            ],
            hint: "[n * n for n in nums if n % 2 != 0], then print(*result).",
            solution: "nums = list(map(int, input().split()))\nprint(*[n * n for n in nums if n % 2 != 0])",
          },
        ],
      },
    ],
  },
  {
    id: "py-u6",
    title: "Functions in Depth",
    description: "Flexible parameters, scope and functions as values.",
    level: "Intermediate",
    lessons: [
      {
        id: "py-6-1",
        title: "Default & keyword arguments",
        steps: [
          {
            type: "learn",
            title: "Defaults",
            body: "Give a parameter a **default value** and callers can leave it out. Pass arguments **by name** to make calls readable and order-independent.",
            code: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Ada"))                 # Hello, Ada!\nprint(greet("Ada", greeting="Hey"))  # Hey, Ada!',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "def power(base, exp=2):\n    return base ** exp\n\nprint(power(exp=3, base=2))",
            options: ["9", "8", "6", "Error"],
            answer: 1,
            explain: "Keyword arguments can come in any order: base=2, exp=3 → 2³ = 8.",
          },
          {
            type: "learn",
            title: "A classic trap",
            body: "Default values are created **once**, when the function is defined. A mutable default like `[]` is shared between calls! Use `None` instead.",
            code: "def add(item, bag=None):\n    if bag is None:\n        bag = []\n    bag.append(item)\n    return bag",
          },
          {
            type: "choice",
            prompt: "Which definition is valid?",
            options: ["def f(a=1, b):", "def f(a, b=1):", "def f(=1, b):", "def f(a=1 b=2):"],
            answer: 1,
            explain: "Parameters with defaults must come after the ones without.",
          },
          {
            type: "code",
            prompt: "Write `format_price(amount, currency=\"$\", decimals=2)` returning e.g. `$3.50`. Read a number and print it three ways:\n\n1. with the defaults\n2. with currency `€`\n3. with `decimals=0`",
            starter: 'def format_price(amount, currency="$", decimals=2):\n    pass\n\nx = float(input())\n',
            tests: [
              { input: "3.5", expected: "$3.50\n€3.50\n$4" },
              { input: "10", expected: "$10.00\n€10.00\n$10" },
            ],
            hint: 'f"{currency}{amount:.{decimals}f}" formats with a variable number of decimals.',
            solution:
              'def format_price(amount, currency="$", decimals=2):\n    return f"{currency}{amount:.{decimals}f}"\n\nx = float(input())\nprint(format_price(x))\nprint(format_price(x, currency="€"))\nprint(format_price(x, decimals=0))',
          },
        ],
      },
      {
        id: "py-6-2",
        title: "*args, **kwargs & scope",
        steps: [
          {
            type: "learn",
            title: "Any number of arguments",
            body: "`*args` gathers extra positional arguments into a **tuple**. `**kwargs` gathers extra keyword arguments into a **dict**.",
            code: 'def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))  # 6\n\ndef show(**info):\n    for key, value in info.items():\n        print(key, "=", value)\n\nshow(lang="py", level=3)',
          },
          {
            type: "choice",
            prompt: "Inside `def f(*args)`, what type is `args` when you call `f(1, 2)`?",
            options: ["list", "tuple", "dict", "int"],
            answer: 1,
            explain: "Positional extras are packed into a tuple: (1, 2).",
          },
          {
            type: "learn",
            title: "Scope",
            body: "Variables assigned inside a function are **local** — they vanish when it returns and don't affect outer variables with the same name. Reading an outer variable is fine; reassigning it needs `global` (best avoided).",
            code: "count = 10\n\ndef bump():\n    count = 99   # a new local variable\n    return count\n\nbump()\nprint(count)  # still 10",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "x = 5\n\ndef f():\n    return x * 2\n\nprint(f())",
            options: ["10", "Error: x is not defined", "5", "None"],
            answer: 0,
            explain: "Functions can read variables from the enclosing (global) scope.",
          },
          {
            type: "code",
            prompt: "Write `average(*nums)` that returns the average of any number of arguments, or `0` if none are given. Print `average(2, 4, 9)`, then `average()`, then `average(*values)` where `values` is read from input.",
            starter: "def average(*nums):\n    pass\n\nvalues = list(map(int, input().split()))\n",
            tests: [{ input: "10 20", expected: "5.0\n0\n15.0" }],
            hint: "if not nums: return 0 — otherwise sum(nums) / len(nums).",
            solution:
              "def average(*nums):\n    if not nums:\n        return 0\n    return sum(nums) / len(nums)\n\nvalues = list(map(int, input().split()))\nprint(average(2, 4, 9))\nprint(average())\nprint(average(*values))",
          },
        ],
      },
      {
        id: "py-6-3",
        title: "Lambdas & sorting with key",
        steps: [
          {
            type: "learn",
            title: "Functions are values",
            body: "You can store a function in a variable or pass it to another function. A **lambda** is a tiny unnamed function: `lambda args: expression`.",
            code: "double = lambda x: x * 2\nprint(double(21))  # 42\n\ndef apply(f, value):\n    return f(value)\n\nprint(apply(len, \"streak\"))  # 6",
          },
          {
            type: "learn",
            title: "Custom sort order",
            body: "`sorted(items, key=...)` sorts by whatever the key function returns. Return a **tuple** to sort by several things.",
            code: 'players = [("ana", 120), ("ben", 300), ("cy", 120)]\n# by score descending, then name\nranked = sorted(players, key=lambda p: (-p[1], p[0]))\nprint(ranked)',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'words = ["banana", "fig", "apple"]\nprint(sorted(words, key=len)[0])',
            options: ["apple", "fig", "banana", "Error"],
            answer: 1,
            explain: "Sorting by length puts 'fig' (3 letters) first.",
          },
          {
            type: "fill",
            prompt: "Sort the numbers by their distance from 10.",
            template: "nums.sort(key=___ n: abs(n - 10))",
            answers: ["lambda"],
            bank: ["lambda", "def", "fn", "=>"],
            explain: "`lambda n: abs(n - 10)` is a function returning each number's distance from 10.",
          },
          {
            type: "code",
            prompt: "Read N, then N lines of `name score`. Print the names ordered by score **descending**; break ties alphabetically. One name per line.",
            starter: "n = int(input())\npeople = []\nfor _ in range(n):\n    name, score = input().split()\n    people.append((name, int(score)))\n",
            tests: [
              { input: "4\nana 120\nben 300\ncy 120\ndee 95", expected: "ben\nana\ncy\ndee" },
              { input: "2\nzed 5\namy 5", expected: "amy\nzed" },
            ],
            hint: "sorted(people, key=lambda p: (-p[1], p[0])).",
            solution:
              "n = int(input())\npeople = []\nfor _ in range(n):\n    name, score = input().split()\n    people.append((name, int(score)))\nfor name, score in sorted(people, key=lambda p: (-p[1], p[0])):\n    print(name)",
          },
        ],
      },
    ],
  },
  {
    id: "py-u7",
    title: "Errors & Files",
    description: "Handle the unexpected and work with files.",
    level: "Intermediate",
    lessons: [
      {
        id: "py-7-1",
        title: "try / except",
        steps: [
          {
            type: "learn",
            title: "Catching errors",
            body: "When something goes wrong Python **raises an exception**. Wrap risky code in `try` and handle specific exceptions in `except` so your program keeps running.",
            code: 'try:\n    n = int("abc")\nexcept ValueError:\n    print("That is not a number")',
          },
          {
            type: "choice",
            prompt: "Which exception does `10 / 0` raise?",
            options: ["ValueError", "ZeroDivisionError", "TypeError", "MathError"],
            answer: 1,
            explain: "Dividing by zero raises ZeroDivisionError.",
          },
          {
            type: "learn",
            title: "else and finally",
            body: "- `else` runs only if **no** exception happened\n- `finally` **always** runs — great for cleanup",
            code: 'try:\n    x = int("42")\nexcept ValueError:\n    print("bad")\nelse:\n    print("parsed", x)\nfinally:\n    print("done")',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'try:\n    print("A")\n    [1, 2][5]\n    print("B")\nexcept IndexError:\n    print("C")\nfinally:\n    print("D")',
            options: ["A B D", "A C D", "A C", "C D"],
            answer: 1,
            explain: "The bad index jumps straight to except (B is skipped), and finally always runs.",
          },
          {
            type: "code",
            prompt: "Read N, then N lines. Each line should be an integer, but some are junk. Print the sum of the valid integers, then on a second line the number of invalid lines.",
            starter: "n = int(input())\n",
            tests: [
              { input: "4\n10\nabc\n-3\n4.5", expected: "7\n2" },
              { input: "2\n1\n2", expected: "3\n0" },
            ],
            hint: "Inside the loop: try: total += int(line) except ValueError: bad += 1.",
            solution:
              "n = int(input())\ntotal = 0\nbad = 0\nfor _ in range(n):\n    line = input()\n    try:\n        total += int(line)\n    except ValueError:\n        bad += 1\nprint(total)\nprint(bad)",
          },
        ],
      },
      {
        id: "py-7-2",
        title: "raise & custom exceptions",
        steps: [
          {
            type: "learn",
            title: "Raising your own",
            body: "Use `raise` to signal that something is wrong — for example, invalid input to your function. The caller decides how to handle it.",
            code: 'def set_goal(xp):\n    if xp <= 0:\n        raise ValueError("goal must be positive")\n    return xp\n\ntry:\n    set_goal(-5)\nexcept ValueError as e:\n    print("Error:", e)',
          },
          {
            type: "learn",
            title: "Custom exception classes",
            body: "Create your own exception by subclassing `Exception`. Callers can catch exactly the problem they care about.",
            code: 'class OutOfHearts(Exception):\n    pass\n\ndef play(hearts):\n    if hearts == 0:\n        raise OutOfHearts("refill to continue")',
          },
          {
            type: "choice",
            prompt: "What does `except ValueError as e:` give you in `e`?",
            options: ["The line number", "The exception object, whose str() is its message", "True or False", "The function that failed"],
            answer: 1,
            explain: "`e` is the exception instance; printing it shows the message.",
          },
          {
            type: "fill",
            prompt: "Signal an error when age is negative.",
            template: 'if age < 0:\n    ___ ValueError("age can\'t be negative")',
            answers: ["raise"],
            bank: ["raise", "throw", "return", "except"],
            explain: "Python uses `raise` (JavaScript uses `throw`).",
          },
          {
            type: "code",
            prompt:
              "Write `withdraw(balance, amount)` that raises `ValueError(\"insufficient funds\")` if amount > balance, otherwise returns the new balance. Read balance and amount; print the new balance or `Error: insufficient funds`.",
            starter: "def withdraw(balance, amount):\n    pass\n\nbalance, amount = map(int, input().split())\n",
            tests: [
              { input: "100 30", expected: "70" },
              { input: "20 50", expected: "Error: insufficient funds" },
            ],
            hint: "Call it inside try and print f\"Error: {e}\" in the except block.",
            solution:
              'def withdraw(balance, amount):\n    if amount > balance:\n        raise ValueError("insufficient funds")\n    return balance - amount\n\nbalance, amount = map(int, input().split())\ntry:\n    print(withdraw(balance, amount))\nexcept ValueError as e:\n    print(f"Error: {e}")',
          },
        ],
      },
      {
        id: "py-7-3",
        title: "Files & with",
        steps: [
          {
            type: "learn",
            title: "Writing and reading files",
            body: "`open(path, mode)` opens a file: `\"w\"` writes (replacing), `\"a\"` appends, `\"r\"` reads. Use a **`with` block** so the file is closed automatically, even if an error happens.",
            code: 'with open("notes.txt", "w") as f:\n    f.write("day 1\\n")\n    f.write("day 2\\n")\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.strip())',
          },
          {
            type: "choice",
            prompt: "Which mode adds to the end of an existing file?",
            options: ['"w"', '"r"', '"a"', '"x"'],
            answer: 2,
            explain: '"a" (append) keeps the old content; "w" would erase it first.',
          },
          {
            type: "choice",
            prompt: "Why use `with open(...) as f:`?",
            options: ["It's faster", "The file is closed automatically when the block ends", "It reads the file twice", "It's required to read files"],
            answer: 1,
            explain: "`with` is a context manager: cleanup happens even if an exception is raised inside.",
          },
          {
            type: "order",
            prompt: "Arrange the lines to count the lines in log.txt.",
            lines: ["count = 0", 'with open("log.txt") as f:', "    for line in f:", "        count += 1", "print(count)"],
            explain: "Iterating over a file object yields one line at a time.",
          },
          {
            type: "code",
            prompt:
              "Read N, then N words. Write each word to `words.txt` on its own line. Then **read the file back** and print how many lines it has and the longest word.",
            starter: "n = int(input())\nwords = [input() for _ in range(n)]\n",
            tests: [{ input: "3\nstreak\nxp\nleaderboard", expected: "3\nleaderboard" }],
            hint: 'Write with "w", then read with f.read().split() or by looping over lines.',
            solution:
              'n = int(input())\nwords = [input() for _ in range(n)]\nwith open("words.txt", "w") as f:\n    for w in words:\n        f.write(w + "\\n")\nwith open("words.txt") as f:\n    lines = [line.strip() for line in f]\nprint(len(lines))\nprint(max(lines, key=len))',
          },
        ],
      },
    ],
  },
  {
    id: "py-u8",
    title: "Object-Oriented Python",
    description: "Model the world with classes and objects.",
    level: "Advanced",
    lessons: [
      {
        id: "py-8-1",
        title: "Classes & objects",
        steps: [
          {
            type: "learn",
            title: "Your own types",
            body: "A **class** is a blueprint; each **object** made from it has its own data (**attributes**) and behaviour (**methods**). `__init__` sets up a new object, and `self` is the object itself.",
            code: 'class Learner:\n    def __init__(self, name):\n        self.name = name\n        self.xp = 0\n\n    def earn(self, amount):\n        self.xp += amount\n\nada = Learner("Ada")\nada.earn(15)\nprint(ada.name, ada.xp)  # Ada 15',
          },
          {
            type: "choice",
            prompt: "What is `self` inside a method?",
            options: ["The class itself", "The object the method was called on", "A reserved global", "The parent class"],
            answer: 1,
            explain: "`ada.earn(15)` is really `Learner.earn(ada, 15)` — self is ada.",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "class Counter:\n    def __init__(self):\n        self.n = 0\n    def tick(self):\n        self.n += 1\n\na = Counter()\nb = Counter()\na.tick(); a.tick(); b.tick()\nprint(a.n, b.n)",
            options: ["3 3", "2 1", "1 2", "0 0"],
            answer: 1,
            explain: "Each object has its own n.",
          },
          {
            type: "fill",
            prompt: "Complete the constructor.",
            template: "class Point:\n    def ___(self, x, y):\n        ___.x = x\n        self.y = y",
            answers: ["__init__", "self"],
            bank: ["__init__", "init", "self", "this", "constructor"],
            explain: "Python's constructor method is `__init__`, and attributes live on `self`.",
          },
          {
            type: "code",
            prompt:
              "Create a class `Rectangle` with `width` and `height`, a method `area()` and a method `is_square()`. Read width and height, then print the area and whether it is a square (`True`/`False`).",
            starter: "class Rectangle:\n    pass\n\nw, h = map(int, input().split())\n",
            tests: [
              { input: "3 4", expected: "12\nFalse" },
              { input: "5 5", expected: "25\nTrue" },
            ],
            hint: "def area(self): return self.width * self.height",
            solution:
              "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\n    def is_square(self):\n        return self.width == self.height\n\nw, h = map(int, input().split())\nr = Rectangle(w, h)\nprint(r.area())\nprint(r.is_square())",
          },
        ],
      },
      {
        id: "py-8-2",
        title: "Inheritance",
        steps: [
          {
            type: "learn",
            title: "Reuse and specialise",
            body: "A **subclass** inherits everything from its parent and can **override** methods. `super()` calls the parent's version.",
            code: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof"\n\nprint(Dog("Rex").speak())  # Woof',
          },
          {
            type: "learn",
            title: "Extending __init__",
            body: "When a subclass needs extra setup, call `super().__init__(...)` first so the parent's attributes exist too.",
            code: "class Admin(User):\n    def __init__(self, name, level):\n        super().__init__(name)\n        self.level = level",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'class A:\n    def hi(self):\n        return "A"\nclass B(A):\n    pass\n\nprint(B().hi())',
            options: ["B", "A", "Error", "None"],
            answer: 1,
            explain: "B doesn't define hi, so it inherits A's.",
          },
          {
            type: "choice",
            prompt: "What does `isinstance(Dog('Rex'), Animal)` return?",
            options: ["True", "False", "Error", "Dog"],
            answer: 0,
            explain: "A Dog is an Animal, because Dog inherits from Animal.",
          },
          {
            type: "code",
            prompt:
              "Make a base class `Shape` with `name()` returning `\"shape\"` and `area()` returning 0. Subclass `Circle(r)` (area = 3.14 * r * r, name `circle`) and `Square(s)` (name `square`). For each line of input (`circle 2` or `square 3`), print `name: area` with area rounded to 2 decimals.",
            starter: "class Shape:\n    pass\n\nn = int(input())\n",
            tests: [{ input: "2\ncircle 2\nsquare 3", expected: "circle: 12.56\nsquare: 9.00" }],
            hint: 'print(f"{shape.name()}: {shape.area():.2f}")',
            solution:
              'class Shape:\n    def name(self):\n        return "shape"\n    def area(self):\n        return 0\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def name(self):\n        return "circle"\n    def area(self):\n        return 3.14 * self.r * self.r\n\nclass Square(Shape):\n    def __init__(self, s):\n        self.s = s\n    def name(self):\n        return "square"\n    def area(self):\n        return self.s * self.s\n\nn = int(input())\nfor _ in range(n):\n    kind, size = input().split()\n    shape = Circle(float(size)) if kind == "circle" else Square(float(size))\n    print(f"{shape.name()}: {shape.area():.2f}")',
          },
        ],
      },
      {
        id: "py-8-3",
        title: "Magic methods",
        steps: [
          {
            type: "learn",
            title: "Dunder methods",
            body: "Methods with double underscores (\"dunders\") let your objects work with Python's built-in syntax:\n\n- `__str__` → `print(obj)`\n- `__eq__` → `a == b`\n- `__len__` → `len(obj)`\n- `__add__` → `a + b`",
            code: 'class Vec:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __add__(self, other):\n        return Vec(self.x + other.x, self.y + other.y)\n    def __str__(self):\n        return f"Vec({self.x}, {self.y})"\n\nprint(Vec(1, 2) + Vec(3, 4))  # Vec(4, 6)',
          },
          {
            type: "choice",
            prompt: "Which method does `len(playlist)` call?",
            options: ["playlist.length()", "playlist.__len__()", "playlist.size()", "playlist.__count__()"],
            answer: 1,
            explain: "`len(x)` calls `x.__len__()`.",
          },
          {
            type: "choice",
            prompt: "Without `__eq__`, when does `a == b` return True for two objects?",
            options: ["When all attributes match", "Only when a and b are the very same object", "Never", "Always"],
            answer: 1,
            explain: "By default `==` falls back to identity. Define `__eq__` to compare by value.",
          },
          {
            type: "code",
            prompt:
              "Create a class `Money(cents)` with `__add__` (returns a new Money), `__eq__` and `__str__` showing dollars like `$12.05`. Read two amounts in cents. Print their sum, then whether they are equal.",
            starter: "class Money:\n    pass\n\na, b = map(int, input().split())\n",
            tests: [
              { input: "1005 200", expected: "$12.05\nFalse" },
              { input: "50 50", expected: "$1.00\nTrue" },
            ],
            hint: 'f"${self.cents // 100}.{self.cents % 100:02d}"',
            solution:
              'class Money:\n    def __init__(self, cents):\n        self.cents = cents\n    def __add__(self, other):\n        return Money(self.cents + other.cents)\n    def __eq__(self, other):\n        return self.cents == other.cents\n    def __str__(self):\n        return f"${self.cents // 100}.{self.cents % 100:02d}"\n\na, b = map(int, input().split())\nprint(Money(a) + Money(b))\nprint(Money(a) == Money(b))',
          },
        ],
      },
    ],
  },
  {
    id: "py-u9",
    title: "Pythonic Power Tools",
    description: "Generators, decorators, the standard library and type hints.",
    level: "Advanced",
    lessons: [
      {
        id: "py-9-1",
        title: "Iterators & generators",
        steps: [
          {
            type: "learn",
            title: "yield",
            body: "A **generator** function uses `yield` to produce values one at a time, pausing in between. It's lazy: values are computed only when asked for, so it can even be infinite.",
            code: "def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n\nfor x in countdown(3):\n    print(x)  # 3, 2, 1",
          },
          {
            type: "choice",
            prompt: "What does calling `countdown(3)` return before you loop over it?",
            options: ["The list [3, 2, 1]", "3", "A generator object — nothing has run yet", "None"],
            answer: 2,
            explain: "Generator functions return a generator; the body runs as you iterate.",
          },
          {
            type: "learn",
            title: "Generator expressions",
            body: "Swap the square brackets of a comprehension for parentheses and you get a lazy generator — perfect for big data passed straight to `sum()`, `max()` or `any()`.",
            code: "total = sum(n * n for n in range(1_000_000))\nprint(next(iter([7, 8])))  # next() pulls one value: 7",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "def gen():\n    yield 1\n    yield 2\n\ng = gen()\nprint(next(g), next(g))",
            options: ["1 1", "1 2", "2 2", "Error"],
            answer: 1,
            explain: "Each next() resumes the generator until the following yield.",
          },
          {
            type: "code",
            prompt: "Write a generator `fib()` that yields Fibonacci numbers forever (0, 1, 1, 2, …). Read n and print the first n of them, space-separated.",
            starter: "def fib():\n    # yield forever\n    pass\n\nn = int(input())\n",
            tests: [
              { input: "8", expected: "0 1 1 2 3 5 8 13" },
              { input: "1", expected: "0" },
            ],
            hint: "Inside a while True loop: yield a, then a, b = b, a + b. Use next() n times or itertools.islice.",
            solution:
              "def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nn = int(input())\ng = fib()\nprint(*[next(g) for _ in range(n)])",
          },
        ],
      },
      {
        id: "py-9-2",
        title: "Decorators",
        steps: [
          {
            type: "learn",
            title: "Wrapping functions",
            body: "A **decorator** is a function that takes a function and returns a new one that adds behaviour. `@decorator` above a `def` applies it.",
            code: 'def shout(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs).upper()\n    return wrapper\n\n@shout\ndef greet(name):\n    return f"hi {name}"\n\nprint(greet("ada"))  # HI ADA',
          },
          {
            type: "choice",
            prompt: "`@shout` above `def greet` is the same as…",
            options: ["greet = shout", "greet = shout(greet)", "shout = greet(shout)", "greet(shout)"],
            answer: 1,
            explain: "The decorator receives the original function and the name is rebound to whatever it returns.",
          },
          {
            type: "learn",
            title: "A useful one: caching",
            body: "`functools.lru_cache` remembers previous results, turning slow recursive functions into fast ones.",
            code: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib(90))  # instant",
          },
          {
            type: "order",
            prompt: "Arrange a decorator that counts how many times a function is called.",
            lines: ["def counted(func):", "    def wrapper(*args):", "        wrapper.calls += 1", "        return func(*args)", "    wrapper.calls = 0", "    return wrapper"],
            explain: "The wrapper updates a counter stored on itself, then calls the original.",
          },
          {
            type: "code",
            prompt:
              "Write a decorator `bracket` that wraps a function's string result in square brackets. Apply it to `label(word)` which returns the word uppercased. Read words and print `label(word)` for each, one per line.",
            starter: "def bracket(func):\n    pass\n\n@bracket\ndef label(word):\n    return word.upper()\n\nwords = input().split()\n",
            tests: [{ input: "xp gems", expected: "[XP]\n[GEMS]" }],
            hint: 'Inside wrapper: return "[" + func(*args) + "]".',
            solution:
              'def bracket(func):\n    def wrapper(*args, **kwargs):\n        return "[" + func(*args, **kwargs) + "]"\n    return wrapper\n\n@bracket\ndef label(word):\n    return word.upper()\n\nwords = input().split()\nfor w in words:\n    print(label(w))',
          },
        ],
      },
      {
        id: "py-9-3",
        title: "collections & itertools",
        steps: [
          {
            type: "learn",
            title: "Batteries included",
            body: "The standard library saves you from reinventing the wheel:\n\n- `Counter` counts things\n- `defaultdict` creates missing keys automatically\n- `deque` is a fast double-ended queue",
            code: 'from collections import Counter, defaultdict\n\nprint(Counter("banana").most_common(1))  # [(\'a\', 3)]\n\ngroups = defaultdict(list)\nfor w in ["ant", "bee", "ape"]:\n    groups[w[0]].append(w)\nprint(dict(groups))  # {\'a\': [\'ant\', \'ape\'], \'b\': [\'bee\']}',
          },
          {
            type: "learn",
            title: "itertools",
            body: "`itertools` builds efficient loops: `combinations`, `permutations`, `product`, `accumulate`, `groupby`, `islice`…",
            code: "from itertools import combinations, accumulate\n\nprint(list(combinations([1, 2, 3], 2)))  # [(1, 2), (1, 3), (2, 3)]\nprint(list(accumulate([1, 2, 3, 4])))       # [1, 3, 6, 10]",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'from collections import Counter\nc = Counter("mississippi")\nprint(c["s"])',
            options: ["2", "4", "1", "Error"],
            answer: 1,
            explain: "There are four s's in mississippi.",
          },
          {
            type: "choice",
            prompt: "How many items does `combinations(range(5), 2)` produce?",
            options: ["25", "10", "20", "5"],
            answer: 1,
            explain: "5 choose 2 = 10 unordered pairs.",
          },
          {
            type: "code",
            prompt: "Read a line of words. Print the 3 most common words with their counts as `word count`, most common first. Break ties by first appearance.",
            starter: "from collections import Counter\n\nwords = input().split()\n",
            tests: [
              { input: "a b a c b a d", expected: "a 3\nb 2\nc 1" },
              { input: "x y z w", expected: "x 1\ny 1\nz 1" },
            ],
            hint: "Counter(words).most_common(3) keeps first-seen order for ties.",
            solution: "from collections import Counter\n\nwords = input().split()\nfor word, count in Counter(words).most_common(3):\n    print(word, count)",
          },
        ],
      },
      {
        id: "py-9-4",
        title: "Dataclasses & type hints",
        steps: [
          {
            type: "learn",
            title: "Type hints",
            body: "Type hints document what a function expects and returns. Python doesn't enforce them at runtime, but editors and tools like mypy use them to catch bugs early.",
            code: "def average(scores: list[int]) -> float:\n    return sum(scores) / len(scores)",
          },
          {
            type: "learn",
            title: "@dataclass",
            body: "`@dataclass` writes `__init__`, `__repr__` and `__eq__` for you from annotated fields. Add `order=True` to make objects sortable.",
            code: 'from dataclasses import dataclass\n\n@dataclass\nclass Player:\n    name: str\n    xp: int = 0\n\np = Player("Ada", 120)\nprint(p)                        # Player(name=\'Ada\', xp=120)\nprint(p == Player("Ada", 120))  # True',
          },
          {
            type: "choice",
            prompt: "What happens when you call `average(\"oops\")` with the type hint `scores: list[int]`?",
            options: [
              "Python refuses to run the call",
              "Hints aren't enforced at runtime — it runs and fails inside the function",
              "It's converted to a list automatically",
              "It returns 0",
            ],
            answer: 1,
            explain: "Type hints are for humans and checkers; the interpreter ignores them.",
          },
          {
            type: "choice",
            prompt: "Which method does `@dataclass` NOT generate by default?",
            options: ["__init__", "__repr__", "__eq__", "__add__"],
            answer: 3,
            explain: "Arithmetic like __add__ is up to you.",
          },
          {
            type: "code",
            prompt:
              "Define a dataclass `Task` with `title: str` and `priority: int`. Read N tasks (`title priority`), sort them by priority (lowest number first, ties by title) and print each as `priority title`.",
            starter: "from dataclasses import dataclass\n\nn = int(input())\n",
            tests: [{ input: "3\nemail 2\nbugfix 1\ndeploy 2", expected: "1 bugfix\n2 deploy\n2 email" }],
            hint: "sorted(tasks, key=lambda t: (t.priority, t.title))",
            solution:
              'from dataclasses import dataclass\n\n@dataclass\nclass Task:\n    title: str\n    priority: int\n\nn = int(input())\ntasks = []\nfor _ in range(n):\n    title, p = input().split()\n    tasks.append(Task(title, int(p)))\nfor t in sorted(tasks, key=lambda t: (t.priority, t.title)):\n    print(t.priority, t.title)',
          },
        ],
      },
    ],
  },
];
