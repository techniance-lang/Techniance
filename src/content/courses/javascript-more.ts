import type { Lesson, Unit } from "../types";

/** Extra beginner lesson for the Control Flow unit. */
export const jsSwitchLesson: Lesson = {
  id: "js-3-3",
  title: "switch & the ternary",
  steps: [
    {
      type: "learn",
      title: "Pick one of two values",
      body: "The **ternary operator** `condition ? a : b` is a compact if/else that produces a value.",
      code: 'const hearts = 0;\nconst status = hearts > 0 ? "playing" : "out of hearts";\nconsole.log(status);',
    },
    {
      type: "choice",
      prompt: "What is printed?",
      code: 'const xp = 45;\nconsole.log(xp >= 50 ? "goal!" : `${50 - xp} to go`);',
      options: ["goal!", "5 to go", "45 to go", "undefined"],
      answer: 1,
      explain: "45 >= 50 is false, so the second expression is used.",
    },
    {
      type: "learn",
      title: "switch",
      body: "`switch` compares one value against many cases with `===`. End each case with `break`, or execution **falls through** into the next case.",
      code: 'switch (day) {\n  case "sat":\n  case "sun":\n    console.log("weekend");\n    break;\n  default:\n    console.log("weekday");\n}',
    },
    {
      type: "choice",
      prompt: "What is printed?",
      code: 'const n = 1;\nswitch (n) {\n  case 1:\n    console.log("one");\n  case 2:\n    console.log("two");\n    break;\n  default:\n    console.log("other");\n}',
      options: ["one", "one two", "one two other", "two"],
      answer: 1,
      explain: "Case 1 has no break, so it falls through into case 2, which breaks.",
    },
    {
      type: "code",
      prompt: "Read an operator line like `7 * 3` and print the result. Support `+ - * /`; print `unknown` for anything else. Use a switch.",
      starter: 'const [a, op, b] = readline().split(" ");\nconst x = Number(a), y = Number(b);\n',
      tests: [
        { input: "7 * 3", expected: "21" },
        { input: "10 / 4", expected: "2.5" },
        { input: "2 ^ 3", expected: "unknown" },
      ],
      hint: 'case "+": console.log(x + y); break;',
      solution:
        'const [a, op, b] = readline().split(" ");\nconst x = Number(a), y = Number(b);\nswitch (op) {\n  case "+": console.log(x + y); break;\n  case "-": console.log(x - y); break;\n  case "*": console.log(x * y); break;\n  case "/": console.log(x / y); break;\n  default: console.log("unknown");\n}',
    },
  ],
};

/** JavaScript units 5–9: intermediate and advanced material. */
export const javascriptMoreUnits: Unit[] = [
  {
    id: "js-u5",
    title: "Modern JavaScript",
    description: "Destructuring, spread, and safe property access.",
    level: "Intermediate",
    lessons: [
      {
        id: "js-5-1",
        title: "Destructuring",
        steps: [
          {
            type: "learn",
            title: "Unpack arrays and objects",
            body: "**Destructuring** pulls values out of arrays (by position) and objects (by name) into variables.",
            code: 'const [first, second] = ["gold", "silver"];\nconst { name, xp } = { name: "Ada", xp: 120 };\nconsole.log(first, name, xp); // gold Ada 120',
          },
          {
            type: "learn",
            title: "Renaming and defaults",
            body: "Rename with `key: newName` and give a default with `=` for missing properties. It works in function parameters too.",
            code: 'const { league: tier = "Bronze" } = {};\nconsole.log(tier); // Bronze\n\nfunction card({ name, xp = 0 }) {\n  return `${name}: ${xp} XP`;\n}\nconsole.log(card({ name: "Lin" })); // Lin: 0 XP',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "const [a, , c] = [1, 2, 3];\nconsole.log(a + c);",
            options: ["3", "4", "6", "NaN"],
            answer: 1,
            explain: "The empty slot skips the 2, so a = 1 and c = 3.",
          },
          {
            type: "fill",
            prompt: "Pull `city` out of the user object.",
            template: "const ___ city ___ = user;",
            answers: ["{", "}"],
            bank: ["{", "}", "[", "]", "("],
            explain: "Objects are destructured with curly braces, arrays with square brackets.",
          },
          {
            type: "code",
            prompt: "Each input line is `name,score,country`. Destructure each line into variables and print `name (country): score` for every line after the first (the first line is the count).",
            starter: "const n = Number(readline());\n",
            tests: [{ input: "2\nada,120,UK\nlin,95,FI", expected: "ada (UK): 120\nlin (FI): 95" }],
            hint: 'const [name, score, country] = readline().split(",");',
            solution:
              'const n = Number(readline());\nfor (let i = 0; i < n; i++) {\n  const [name, score, country] = readline().split(",");\n  console.log(`${name} (${country}): ${score}`);\n}',
          },
        ],
      },
      {
        id: "js-5-2",
        title: "Spread & rest",
        steps: [
          {
            type: "learn",
            title: "... spreads things out",
            body: "**Spread** (`...`) expands an array or object into another one — handy for copying and merging without mutating the original.",
            code: "const a = [1, 2];\nconst b = [...a, 3];        // [1, 2, 3]\nconst base = { xp: 0, gems: 5 };\nconst user = { ...base, xp: 10 }; // later keys win\nconsole.log(b, user);",
          },
          {
            type: "learn",
            title: "... gathers things up",
            body: "In a parameter list or destructuring, the same `...` is **rest**: it collects the remaining items.",
            code: "function sum(...nums) {\n  return nums.reduce((s, n) => s + n, 0);\n}\nconsole.log(sum(1, 2, 3)); // 6\n\nconst [head, ...tail] = [1, 2, 3];\nconsole.log(tail); // [ 2, 3 ]",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "const nums = [4, 9, 2];\nconsole.log(Math.max(...nums));",
            options: ["NaN", "9", "[4, 9, 2]", "Error"],
            answer: 1,
            explain: "Spread turns the array into separate arguments: Math.max(4, 9, 2).",
          },
          {
            type: "choice",
            prompt: "What is `settings.theme` after this?",
            code: 'const defaults = { theme: "dark", sound: true };\nconst settings = { theme: "light", ...defaults };',
            options: ['"light"', '"dark"', "undefined", "Error"],
            answer: 1,
            explain: "Properties spread later override earlier ones — defaults comes last here.",
          },
          {
            type: "code",
            prompt: "Write `merge(...arrays)` that returns one array with all items from every array, sorted ascending with duplicates removed. Read 3 lines of numbers and print the merged result space-separated.",
            starter: "function merge(...arrays) {\n  // your code\n}\n\nconst lists = [readline(), readline(), readline()].map((l) => l.split(\" \").map(Number));\n",
            tests: [{ input: "3 1 2\n2 5\n9 1", expected: "1 2 3 5 9" }],
            hint: "[...new Set(arrays.flat())].sort((a, b) => a - b)",
            solution:
              'function merge(...arrays) {\n  return [...new Set(arrays.flat())].sort((a, b) => a - b);\n}\n\nconst lists = [readline(), readline(), readline()].map((l) => l.split(" ").map(Number));\nconsole.log(merge(...lists).join(" "));',
          },
        ],
      },
      {
        id: "js-5-3",
        title: "?. and ??",
        steps: [
          {
            type: "learn",
            title: "Optional chaining",
            body: "`a?.b` returns `undefined` instead of throwing when `a` is `null` or `undefined`. It works for calls too: `obj.method?.()`.",
            code: "const user = { profile: null };\nconsole.log(user.profile?.city); // undefined, no crash",
          },
          {
            type: "learn",
            title: "Nullish coalescing",
            body: "`a ?? b` uses `b` only when `a` is `null` or `undefined`. Unlike `||`, it keeps valid falsy values such as `0` and `\"\"`.",
            code: "const streak = 0;\nconsole.log(streak || 1); // 1  (0 is falsy!)\nconsole.log(streak ?? 1); // 0  (0 is a real value)",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'const cfg = { volume: 0 };\nconsole.log(cfg.volume ?? 50, cfg.speed ?? 1);',
            options: ["50 1", "0 1", "0 undefined", "50 undefined"],
            answer: 1,
            explain: "volume is 0 (not nullish) so it's kept; speed is undefined so 1 is used.",
          },
          {
            type: "choice",
            prompt: "Which expression never throws, even if `order` is undefined?",
            options: ["order.items.length", "order?.items?.length", "order.items?.length", "order?.items.length"],
            answer: 1,
            explain: "Every step that might be missing needs its own ?.",
          },
          {
            type: "code",
            prompt:
              "A JSON user record is given on one line. Print the user's city, or `unknown` if any part of `address.city` is missing. On the second line print `nickname` or the name if nickname is null/undefined.",
            starter: "const user = JSON.parse(readline());\n",
            tests: [
              { input: '{"name":"Ada","nickname":"ace","address":{"city":"London"}}', expected: "London\nace" },
              { input: '{"name":"Lin","address":null}', expected: "unknown\nLin" },
            ],
            hint: 'user.address?.city ?? "unknown"',
            solution: 'const user = JSON.parse(readline());\nconsole.log(user.address?.city ?? "unknown");\nconsole.log(user.nickname ?? user.name);',
          },
        ],
      },
    ],
  },
  {
    id: "js-u6",
    title: "Functions in Depth",
    description: "Callbacks, closures and powerful array methods.",
    level: "Intermediate",
    lessons: [
      {
        id: "js-6-1",
        title: "Callbacks & higher-order functions",
        steps: [
          {
            type: "learn",
            title: "Functions as arguments",
            body: "A **higher-order function** takes or returns another function. The function you pass in is a **callback**.",
            code: "function repeat(times, action) {\n  for (let i = 0; i < times; i++) action(i);\n}\nrepeat(3, (i) => console.log(`round ${i}`));",
          },
          {
            type: "learn",
            title: "find, some, every",
            body: "- `.find(fn)` → first matching item (or `undefined`)\n- `.some(fn)` → true if **any** item matches\n- `.every(fn)` → true if **all** items match",
            code: "const scores = [40, 75, 90];\nconsole.log(scores.find((s) => s > 50));   // 75\nconsole.log(scores.some((s) => s === 90)); // true\nconsole.log(scores.every((s) => s >= 50)); // false",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "console.log([3, 8, 12].findIndex((n) => n % 4 === 0));",
            options: ["8", "1", "2", "-1"],
            answer: 1,
            explain: "findIndex returns the position of the first match: 8 is at index 1.",
          },
          {
            type: "fill",
            prompt: "Check whether every word is lowercase.",
            template: "const ok = words.___((w) => w === w.toLowerCase());",
            answers: ["every"],
            bank: ["every", "some", "find", "all"],
            explain: "`every` returns true only if the callback is true for all items.",
          },
          {
            type: "code",
            prompt:
              "Write `applyAll(value, fns)` that passes value through each function in the array in order and returns the result. Read a number and print `applyAll(n, [double, addTen, square])`.",
            starter: "const double = (x) => x * 2;\nconst addTen = (x) => x + 10;\nconst square = (x) => x * x;\n\nfunction applyAll(value, fns) {\n  // your code\n}\n\nconst n = Number(readline());\n",
            tests: [
              { input: "1", expected: "144" },
              { input: "0", expected: "100" },
            ],
            hint: "return fns.reduce((acc, fn) => fn(acc), value);",
            solution:
              "const double = (x) => x * 2;\nconst addTen = (x) => x + 10;\nconst square = (x) => x * x;\n\nfunction applyAll(value, fns) {\n  return fns.reduce((acc, fn) => fn(acc), value);\n}\n\nconst n = Number(readline());\nconsole.log(applyAll(n, [double, addTen, square]));",
          },
        ],
      },
      {
        id: "js-6-2",
        title: "Closures",
        steps: [
          {
            type: "learn",
            title: "Functions remember",
            body: "A **closure** is a function that keeps access to the variables of the scope where it was created — even after that outer function has returned. It's how JavaScript keeps private state.",
            code: "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = makeCounter();\nconsole.log(next(), next(), next()); // 1 2 3",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "function makeCounter() {\n  let c = 0;\n  return () => ++c;\n}\nconst a = makeCounter();\nconst b = makeCounter();\na(); a();\nconsole.log(a(), b());",
            options: ["3 3", "3 1", "1 1", "4 1"],
            answer: 1,
            explain: "Each call to makeCounter creates a fresh, independent c.",
          },
          {
            type: "learn",
            title: "Function factories",
            body: "Closures let you build specialised functions from a template.",
            code: "const multiplier = (factor) => (x) => x * factor;\nconst triple = multiplier(3);\nconsole.log(triple(5)); // 15",
          },
          {
            type: "choice",
            prompt: "Why does this print 3 3 3 with `var` but 0 1 2 with `let`?",
            code: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
            options: [
              "setTimeout is broken",
              "var creates one shared i; let creates a new binding for each iteration",
              "let runs faster",
              "var can't be used in loops",
            ],
            answer: 1,
            explain: "All three callbacks close over the same var i, which is 3 by the time they run.",
          },
          {
            type: "code",
            prompt:
              "Write `makeBank(start)` returning an object with `deposit(n)`, `withdraw(n)` (ignore if it would go negative) and `balance()`. The balance must be private (a closure variable). Read commands like `deposit 50` until `end`, then print the balance.",
            starter: "function makeBank(start) {\n  // your code\n}\n\nconst bank = makeBank(100);\n",
            tests: [
              { input: "deposit 50\nwithdraw 30\nwithdraw 500\nend", expected: "120" },
              { input: "end", expected: "100" },
            ],
            hint: "let money = start; return { deposit(n) { money += n; }, ... }",
            solution:
              'function makeBank(start) {\n  let money = start;\n  return {\n    deposit(n) { money += n; },\n    withdraw(n) { if (n <= money) money -= n; },\n    balance() { return money; },\n  };\n}\n\nconst bank = makeBank(100);\nlet line;\nwhile ((line = readline()) !== "end") {\n  const [cmd, amount] = line.split(" ");\n  bank[cmd](Number(amount));\n}\nconsole.log(bank.balance());',
          },
        ],
      },
      {
        id: "js-6-3",
        title: "Array power moves",
        steps: [
          {
            type: "learn",
            title: "Sorting numbers correctly",
            body: "`.sort()` compares items **as strings** by default! Pass a comparator: return a negative number to put `a` first.",
            code: "console.log([10, 9, 1].sort());              // [ 1, 10, 9 ]  😬\nconsole.log([10, 9, 1].sort((a, b) => a - b)); // [ 1, 9, 10 ]",
          },
          {
            type: "learn",
            title: "Chaining",
            body: "Array methods return new arrays, so you can chain them into a readable pipeline.",
            code: 'const players = [{ name: "a", xp: 30 }, { name: "b", xp: 90 }, { name: "c", xp: 60 }];\nconst top = players\n  .filter((p) => p.xp > 40)\n  .sort((x, y) => y.xp - x.xp)\n  .map((p) => p.name);\nconsole.log(top); // [ \'b\', \'c\' ]',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "console.log([[1, 2], [3], [4, 5]].flat().length);",
            options: ["3", "5", "2", "Error"],
            answer: 1,
            explain: ".flat() removes one level of nesting: [1, 2, 3, 4, 5].",
          },
          {
            type: "order",
            prompt: "Arrange a pipeline that returns the total XP of active users.",
            lines: ["const total = users", "  .filter((u) => u.active)", "  .map((u) => u.xp)", "  .reduce((sum, xp) => sum + xp, 0);"],
            explain: "Filter first, then extract, then combine.",
          },
          {
            type: "code",
            prompt:
              "Read N, then N lines of `name xp`. Print the names of the top 3 players by XP (highest first, ties alphabetical), joined with `, `.",
            starter: "const n = Number(readline());\nconst players = [];\nfor (let i = 0; i < n; i++) {\n  const [name, xp] = readline().split(\" \");\n  players.push({ name, xp: Number(xp) });\n}\n",
            tests: [
              { input: "5\nana 50\nben 90\ncy 50\ndee 120\neli 10", expected: "dee, ben, ana" },
              { input: "1\nsolo 5", expected: "solo" },
            ],
            hint: "sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name)).slice(0, 3)",
            solution:
              'const n = Number(readline());\nconst players = [];\nfor (let i = 0; i < n; i++) {\n  const [name, xp] = readline().split(" ");\n  players.push({ name, xp: Number(xp) });\n}\nconst top = players\n  .sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name))\n  .slice(0, 3)\n  .map((p) => p.name);\nconsole.log(top.join(", "));',
          },
        ],
      },
    ],
  },
  {
    id: "js-u7",
    title: "Classes & Objects",
    description: "Object-oriented JavaScript and how \"this\" works.",
    level: "Advanced",
    lessons: [
      {
        id: "js-7-1",
        title: "Classes",
        steps: [
          {
            type: "learn",
            title: "Blueprints for objects",
            body: "A `class` bundles data and behaviour. `constructor` runs when you call `new`, and `this` refers to the new object.",
            code: 'class Learner {\n  constructor(name) {\n    this.name = name;\n    this.xp = 0;\n  }\n  earn(amount) {\n    this.xp += amount;\n    return this; // allows chaining\n  }\n}\n\nconst ada = new Learner("Ada").earn(10).earn(5);\nconsole.log(ada.xp); // 15',
          },
          {
            type: "choice",
            prompt: "What happens if you call `Learner(\"Ada\")` without `new`?",
            options: ["It works the same", "TypeError: Class constructor cannot be invoked without 'new'", "It returns undefined", "It creates a global"],
            answer: 1,
            explain: "Classes must be instantiated with new.",
          },
          {
            type: "learn",
            title: "Static and private members",
            body: "`static` members belong to the class itself. Fields starting with `#` are truly **private** — only code inside the class can see them.",
            code: "class Id {\n  static #next = 1;\n  static create() {\n    return Id.#next++;\n  }\n}\nconsole.log(Id.create(), Id.create()); // 1 2",
          },
          {
            type: "fill",
            prompt: "Complete the class.",
            template: "class Point {\n  ___(x, y) {\n    ___.x = x;\n    this.y = y;\n  }\n}",
            answers: ["constructor", "this"],
            bank: ["constructor", "__init__", "this", "self", "init"],
            explain: "JavaScript uses `constructor` and `this`.",
          },
          {
            type: "code",
            prompt:
              "Create a class `Stack` with `push(x)`, `pop()` (returns `undefined` when empty), `peek()` and a `size` getter. Process commands (`push 5`, `pop`, `peek`) until `end`; print the result of each `pop`/`peek`, then the final size.",
            starter: "class Stack {\n  // your code\n}\n\nconst s = new Stack();\n",
            tests: [{ input: "push 1\npush 2\npeek\npop\npop\npop\nend", expected: "2\n2\n1\nundefined\n0" }],
            hint: "Keep a private #items array; get size() { return this.#items.length; }",
            solution:
              'class Stack {\n  #items = [];\n  push(x) { this.#items.push(x); }\n  pop() { return this.#items.pop(); }\n  peek() { return this.#items[this.#items.length - 1]; }\n  get size() { return this.#items.length; }\n}\n\nconst s = new Stack();\nlet line;\nwhile ((line = readline()) !== "end") {\n  const [cmd, arg] = line.split(" ");\n  if (cmd === "push") s.push(Number(arg));\n  else console.log(s[cmd]());\n}\nconsole.log(s.size);',
          },
        ],
      },
      {
        id: "js-7-2",
        title: "Inheritance & getters",
        steps: [
          {
            type: "learn",
            title: "extends and super",
            body: "A class can **extend** another, inheriting its methods. Call `super(...)` in the constructor before using `this`, and `super.method()` to reuse the parent's version.",
            code: 'class Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} makes a sound`; }\n}\nclass Dog extends Animal {\n  speak() { return `${super.speak()}: woof`; }\n}\nconsole.log(new Dog("Rex").speak()); // Rex makes a sound: woof',
          },
          {
            type: "learn",
            title: "Getters and setters",
            body: "`get` and `set` make methods look like properties — great for computed values and validation.",
            code: "class Temp {\n  constructor(c) { this.c = c; }\n  get f() { return this.c * 9 / 5 + 32; }\n  set f(v) { this.c = (v - 32) * 5 / 9; }\n}\nconst t = new Temp(100);\nconsole.log(t.f); // 212",
          },
          {
            type: "choice",
            prompt: "What happens if a subclass constructor uses `this` before calling `super()`?",
            options: ["Nothing special", "ReferenceError", "this is the parent", "It calls super automatically"],
            answer: 1,
            explain: "`this` doesn't exist until the parent constructor has run.",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: "class A { who() { return \"A\"; } }\nclass B extends A {}\nconst b = new B();\nconsole.log(b instanceof A, b.who());",
            options: ["false A", "true A", "true B", "Error"],
            answer: 1,
            explain: "B inherits from A, so b is an A and gets A's method.",
          },
          {
            type: "code",
            prompt:
              "Make a base class `Account(owner, balance)` with a `describe()` returning `owner: balance`. Subclass `SavingsAccount` adding `rate` and a method `addInterest()` that increases balance by balance * rate. Read `owner balance rate`, add interest twice, and print `describe()` with the balance rounded to 2 decimals.",
            starter: "class Account {\n  // your code\n}\n\nconst [owner, balance, rate] = readline().split(\" \");\n",
            tests: [{ input: "ada 100 0.1", expected: "ada: 121.00" }],
            hint: "describe() { return `${this.owner}: ${this.balance.toFixed(2)}`; }",
            solution:
              'class Account {\n  constructor(owner, balance) {\n    this.owner = owner;\n    this.balance = balance;\n  }\n  describe() {\n    return `${this.owner}: ${this.balance.toFixed(2)}`;\n  }\n}\nclass SavingsAccount extends Account {\n  constructor(owner, balance, rate) {\n    super(owner, balance);\n    this.rate = rate;\n  }\n  addInterest() {\n    this.balance += this.balance * this.rate;\n  }\n}\n\nconst [owner, balance, rate] = readline().split(" ");\nconst acct = new SavingsAccount(owner, Number(balance), Number(rate));\nacct.addInterest();\nacct.addInterest();\nconsole.log(acct.describe());',
          },
        ],
      },
      {
        id: "js-7-3",
        title: "this & prototypes",
        steps: [
          {
            type: "learn",
            title: "this depends on the call",
            body: "In a regular function, `this` is whatever is **left of the dot** when it's called. Detach the method and `this` is lost. Arrow functions don't have their own `this` — they use the surrounding one.",
            code: 'const timer = {\n  label: "focus",\n  show() { return this.label; },\n};\nconsole.log(timer.show()); // focus\nconst show = timer.show;\n// show() would lose `this`\nconst bound = timer.show.bind(timer);\nconsole.log(bound()); // focus',
          },
          {
            type: "choice",
            prompt: "Why are arrow functions handy inside methods for callbacks like `setTimeout`?",
            options: ["They're faster", "They keep the method's `this`", "They can be called with new", "They have their own arguments"],
            answer: 1,
            explain: "Arrows capture `this` lexically, so `this` still refers to the object.",
          },
          {
            type: "learn",
            title: "Prototypes",
            body: "Under the hood, classes use **prototypes**: if an object doesn't have a property, JavaScript looks it up on its prototype, then that object's prototype, and so on (the prototype chain).",
            code: 'class Dog { bark() { return "woof"; } }\nconst d = new Dog();\nconsole.log(Object.getPrototypeOf(d) === Dog.prototype); // true\nconsole.log(d.hasOwnProperty("bark")); // false — it lives on the prototype',
          },
          {
            type: "choice",
            prompt: "Where does a method defined in a class body live?",
            options: ["Copied onto every instance", "On the class's prototype, shared by all instances", "On the global object", "In the constructor"],
            answer: 1,
            explain: "Methods are stored once on ClassName.prototype; instances find them through the chain.",
          },
          {
            type: "code",
            prompt:
              "Fix the bug: `ticker.start()` should print `tick 1`, `tick 2`, `tick 3` using setTimeout. The current code loses `this`. Rewrite `start` so it works (hint: arrow functions).",
            starter:
              'const ticker = {\n  count: 0,\n  start() {\n    for (let i = 0; i < 3; i++) {\n      setTimeout(function () {\n        this.count++;\n        console.log("tick " + this.count);\n      }, 10 * i);\n    }\n  },\n};\nticker.start();\n',
            tests: [{ expected: "tick 1\ntick 2\ntick 3" }],
            hint: "Replace `function () {` with `() => {` so `this` stays the ticker.",
            solution:
              'const ticker = {\n  count: 0,\n  start() {\n    for (let i = 0; i < 3; i++) {\n      setTimeout(() => {\n        this.count++;\n        console.log("tick " + this.count);\n      }, 10 * i);\n    }\n  },\n};\nticker.start();',
          },
        ],
      },
    ],
  },
  {
    id: "js-u8",
    title: "Data & Errors",
    description: "Map and Set, error handling and JSON.",
    level: "Advanced",
    lessons: [
      {
        id: "js-8-1",
        title: "Map & Set",
        steps: [
          {
            type: "learn",
            title: "Map: any key, ordered",
            body: "A `Map` stores key → value pairs. Unlike plain objects, keys can be **any type** and insertion order is guaranteed.",
            code: 'const xp = new Map();\nxp.set("ada", 120).set("lin", 90);\nconsole.log(xp.get("ada"), xp.size); // 120 2\nfor (const [name, points] of xp) console.log(name, points);',
          },
          {
            type: "learn",
            title: "Set: unique values",
            body: "A `Set` keeps each value once. Use `.has()` for fast membership checks.",
            code: "const seen = new Set([1, 2, 2, 3]);\nconsole.log(seen.size, seen.has(2)); // 3 true\nconsole.log([...seen]);               // [ 1, 2, 3 ]",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'const m = new Map();\nm.set(1, "number");\nm.set("1", "string");\nconsole.log(m.size);',
            options: ["1", "2", "0", "Error"],
            answer: 1,
            explain: "1 and \"1\" are different keys in a Map (an object would convert both to \"1\").",
          },
          {
            type: "fill",
            prompt: "Count word frequencies with a Map.",
            template: "counts.___(w, (counts.___(w) ?? 0) + 1);",
            answers: ["set", "get"],
            bank: ["set", "get", "add", "has", "put"],
            explain: "Maps use get to read and set to write.",
          },
          {
            type: "code",
            prompt: "Read a line of words. Print each **distinct** word with its count as `word: count`, in the order each word first appeared.",
            starter: 'const words = readline().split(" ");\n',
            tests: [
              { input: "to be or not to be", expected: "to: 2\nbe: 2\nor: 1\nnot: 1" },
              { input: "hi", expected: "hi: 1" },
            ],
            hint: "A Map remembers insertion order, so loop over it at the end.",
            solution:
              'const words = readline().split(" ");\nconst counts = new Map();\nfor (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);\nfor (const [w, c] of counts) console.log(`${w}: ${c}`);',
          },
        ],
      },
      {
        id: "js-8-2",
        title: "Errors: try, catch, throw",
        steps: [
          {
            type: "learn",
            title: "Handling errors",
            body: "Wrap risky code in `try`; if something throws, `catch` receives the error. `finally` always runs.",
            code: 'try {\n  JSON.parse("{oops");\n} catch (err) {\n  console.log("Bad data:", err.name); // SyntaxError\n} finally {\n  console.log("done");\n}',
          },
          {
            type: "learn",
            title: "Throwing your own",
            body: "`throw` an `Error` (or a subclass) to signal a problem. Custom error classes make it easy to tell problems apart.",
            code: 'class ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = "ValidationError";\n  }\n}\nfunction setGoal(xp) {\n  if (xp <= 0) throw new ValidationError("goal must be positive");\n}',
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'try {\n  console.log("A");\n  null.length;\n  console.log("B");\n} catch (e) {\n  console.log("C");\n}',
            options: ["A B", "A C", "A B C", "C"],
            answer: 1,
            explain: "Reading a property of null throws a TypeError, skipping B.",
          },
          {
            type: "choice",
            prompt: "Which check is best for telling your custom error apart from others?",
            options: ['err.message === "..."', "err instanceof ValidationError", "typeof err === \"error\"", "err == true"],
            answer: 1,
            explain: "instanceof checks the error's class, which doesn't break if the message changes.",
          },
          {
            type: "code",
            prompt:
              "Write `parseAge(text)` that throws a `RangeError(\"invalid age\")` unless text is an integer from 0 to 150. Read lines until `end`; for each print the age or `Error: invalid age`.",
            starter: "function parseAge(text) {\n  // your code\n}\n\n",
            tests: [{ input: "42\n-1\nabc\n150\nend", expected: "42\nError: invalid age\nError: invalid age\n150" }],
            hint: "const n = Number(text); if (!Number.isInteger(n) || n < 0 || n > 150) throw new RangeError(...)",
            solution:
              'function parseAge(text) {\n  const n = Number(text);\n  if (!Number.isInteger(n) || n < 0 || n > 150) throw new RangeError("invalid age");\n  return n;\n}\n\nlet line;\nwhile ((line = readline()) !== "end") {\n  try {\n    console.log(parseAge(line));\n  } catch (e) {\n    console.log(`Error: ${e.message}`);\n  }\n}',
          },
        ],
      },
      {
        id: "js-8-3",
        title: "JSON",
        steps: [
          {
            type: "learn",
            title: "The data language of the web",
            body: "**JSON** is text that looks like JavaScript objects. `JSON.stringify` turns values into JSON text; `JSON.parse` turns JSON text back into values. APIs send and receive JSON.",
            code: 'const user = { name: "Ada", tags: ["py", "js"] };\nconst text = JSON.stringify(user);\nconsole.log(text);                   // {"name":"Ada","tags":["py","js"]}\nconsole.log(JSON.parse(text).tags[1]); // js',
          },
          {
            type: "choice",
            prompt: "Which of these is valid JSON?",
            options: ["{name: 'Ada'}", '{"name": "Ada"}', "{'name': 'Ada'}", '{"name": "Ada",}'],
            answer: 1,
            explain: "JSON requires double-quoted keys and strings, and no trailing commas.",
          },
          {
            type: "choice",
            prompt: "What does `JSON.stringify({ a: undefined, b: 1 })` produce?",
            options: ['{"a":undefined,"b":1}', '{"b":1}', '{"a":null,"b":1}', "Error"],
            answer: 1,
            explain: "Properties whose value is undefined (or a function) are skipped.",
          },
          {
            type: "learn",
            title: "Pretty printing",
            body: "Pass a third argument to indent: `JSON.stringify(value, null, 2)`.",
            code: 'console.log(JSON.stringify({ xp: 10, gems: 5 }, null, 2));',
          },
          {
            type: "code",
            prompt:
              "The input is a JSON array of submissions like `[{\"user\":\"ada\",\"ok\":true}, …]`. Output a JSON object mapping each user to their number of accepted (`ok: true`) submissions, with keys in order of first appearance. Users with zero accepted should appear with 0.",
            starter: "const subs = JSON.parse(readline());\n",
            tests: [
              { input: '[{"user":"ada","ok":true},{"user":"lin","ok":false},{"user":"ada","ok":true}]', expected: '{"ada":2,"lin":0}' },
            ],
            hint: "Build an object with result[user] = (result[user] ?? 0) + (ok ? 1 : 0), then JSON.stringify it.",
            solution:
              "const subs = JSON.parse(readline());\nconst result = {};\nfor (const { user, ok } of subs) {\n  result[user] = (result[user] ?? 0) + (ok ? 1 : 0);\n}\nconsole.log(JSON.stringify(result));",
          },
        ],
      },
    ],
  },
  {
    id: "js-u9",
    title: "Asynchronous JavaScript",
    description: "The event loop, Promises and async/await.",
    level: "Advanced",
    lessons: [
      {
        id: "js-9-1",
        title: "The event loop",
        steps: [
          {
            type: "learn",
            title: "One thing at a time",
            body: "JavaScript runs on a single thread. Slow work (timers, network) is handed off, and its **callback is queued** to run once the current code finishes. That's the **event loop**.",
            code: 'console.log("1");\nsetTimeout(() => console.log("3"), 0);\nconsole.log("2");\n// prints 1, 2, 3 — even with a 0 ms delay',
          },
          {
            type: "learn",
            title: "Microtasks first",
            body: "Promise callbacks are **microtasks**: they run right after the current code, **before** any timer callbacks.",
            code: 'setTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("sync");\n// sync, promise, timeout',
          },
          {
            type: "choice",
            prompt: "In what order are the letters printed?",
            code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
            options: ["A B C D", "A D C B", "A C D B", "A D B C"],
            answer: 1,
            explain: "Synchronous code first (A, D), then microtasks (C), then timers (B).",
          },
          {
            type: "choice",
            prompt: "Which timer fires first?",
            code: 'setTimeout(() => console.log("slow"), 50);\nsetTimeout(() => console.log("fast"), 10);',
            options: ["slow", "fast", "Both at once", "Neither"],
            answer: 1,
            explain: "Timers fire in order of their delay, not the order they were created.",
          },
          {
            type: "code",
            prompt:
              "Read a line of numbers. Print each number after a delay equal to its value in milliseconds using `setTimeout` — this \"sleep sort\" prints them in ascending order! (Values are small and distinct.)",
            starter: 'const nums = readline().split(" ").map(Number);\n',
            tests: [{ input: "30 10 50 20", expected: "10\n20\n30\n50" }],
            hint: "nums.forEach((n) => setTimeout(() => console.log(n), n));",
            solution: 'const nums = readline().split(" ").map(Number);\nnums.forEach((n) => setTimeout(() => console.log(n), n));',
          },
        ],
      },
      {
        id: "js-9-2",
        title: "Promises",
        steps: [
          {
            type: "learn",
            title: "A value from the future",
            body: "A **Promise** represents a result that isn't ready yet. It's either pending, **fulfilled** with a value, or **rejected** with an error. React with `.then()` and `.catch()`.",
            code: 'const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nwait(10)\n  .then(() => "done waiting")\n  .then((msg) => console.log(msg))\n  .catch((err) => console.log("failed", err));',
          },
          {
            type: "learn",
            title: "Running in parallel",
            body: "`Promise.all([...])` waits for **all** promises and gives you an array of results (it rejects if any fails). `Promise.race` settles with whichever finishes first.",
            code: "const results = Promise.all([wait(30).then(() => 1), wait(10).then(() => 2)]);\nresults.then((r) => console.log(r)); // [ 1, 2 ] — original order",
          },
          {
            type: "choice",
            prompt: "What does `.then()` return?",
            options: ["undefined", "A new Promise, so calls can be chained", "The resolved value", "The original promise"],
            answer: 1,
            explain: "Each then returns a new promise for the callback's return value.",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'Promise.reject(new Error("nope"))\n  .then(() => console.log("A"))\n  .catch((e) => console.log("B", e.message))\n  .then(() => console.log("C"));',
            options: ["A C", "B nope C", "B nope", "A B nope C"],
            answer: 1,
            explain: "The rejection skips the first then, is handled by catch, and the chain continues.",
          },
          {
            type: "code",
            prompt:
              "`fetchScore(name)` (given) returns a Promise that resolves after a short delay. Read names, fetch all scores **in parallel** with `Promise.all`, then print `name: score` lines in input order and finally `total: N`.",
            starter:
              'const fetchScore = (name) =>\n  new Promise((resolve) => setTimeout(() => resolve(name.length * 10), 50 - name.length * 5));\n\nconst names = readline().split(" ");\n',
            tests: [{ input: "ada linus bo", expected: "ada: 30\nlinus: 50\nbo: 20\ntotal: 100" }],
            hint: "Promise.all(names.map(fetchScore)).then((scores) => { ... })",
            solution:
              'const fetchScore = (name) =>\n  new Promise((resolve) => setTimeout(() => resolve(name.length * 10), 50 - name.length * 5));\n\nconst names = readline().split(" ");\nPromise.all(names.map(fetchScore)).then((scores) => {\n  scores.forEach((s, i) => console.log(`${names[i]}: ${s}`));\n  console.log(`total: ${scores.reduce((a, b) => a + b, 0)}`);\n});',
          },
        ],
      },
      {
        id: "js-9-3",
        title: "async / await",
        steps: [
          {
            type: "learn",
            title: "Async code that reads like sync code",
            body: "An `async` function always returns a Promise. Inside it, `await` pauses until a Promise settles and gives you its value. Use ordinary `try/catch` for errors.",
            code: 'const wait = (ms) => new Promise((r) => setTimeout(r, ms));\n\nasync function countdown() {\n  for (let i = 3; i > 0; i--) {\n    console.log(i);\n    await wait(10);\n  }\n  console.log("go!");\n}\ncountdown();',
          },
          {
            type: "choice",
            prompt: "What does an `async` function return?",
            options: ["Its return value directly", "A Promise of its return value", "undefined", "A callback"],
            answer: 1,
            explain: "`return 5` inside an async function means the caller gets Promise<5>.",
          },
          {
            type: "learn",
            title: "Sequential vs parallel",
            body: "Awaiting in a loop runs tasks **one after another**. Start them all first and `await Promise.all(...)` to run them **in parallel**.",
            code: "// slow: one by one\nfor (const id of ids) results.push(await load(id));\n\n// fast: all at once\nconst results = await Promise.all(ids.map(load));",
          },
          {
            type: "choice",
            prompt: "What is printed?",
            code: 'async function f() {\n  console.log("B");\n  await null;\n  console.log("D");\n}\nconsole.log("A");\nf();\nconsole.log("C");',
            options: ["A B C D", "A B D C", "A C B D", "B A C D"],
            answer: 0,
            explain: "f runs synchronously until its first await, so B prints before C; D comes after the current code finishes.",
          },
          {
            type: "code",
            prompt:
              "`loadLesson(id)` (given) resolves with a title, or rejects with an error for unknown ids. Read ids, load them **one by one** with async/await, printing each title, or `skipped <id>` for failures. Finish by printing `loaded N`.",
            starter:
              'const TITLES = { 1: "Variables", 2: "Loops", 3: "Functions" };\nconst loadLesson = (id) =>\n  new Promise((resolve, reject) =>\n    setTimeout(() => (TITLES[id] ? resolve(TITLES[id]) : reject(new Error("not found"))), 5));\n\nconst ids = readline().split(" ").map(Number);\n',
            tests: [{ input: "1 7 3", expected: "Variables\nskipped 7\nFunctions\nloaded 2" }],
            hint: "async function main() { for (const id of ids) { try { console.log(await loadLesson(id)); } catch { ... } } }",
            solution:
              'const TITLES = { 1: "Variables", 2: "Loops", 3: "Functions" };\nconst loadLesson = (id) =>\n  new Promise((resolve, reject) =>\n    setTimeout(() => (TITLES[id] ? resolve(TITLES[id]) : reject(new Error("not found"))), 5));\n\nconst ids = readline().split(" ").map(Number);\n\nasync function main() {\n  let loaded = 0;\n  for (const id of ids) {\n    try {\n      console.log(await loadLesson(id));\n      loaded++;\n    } catch {\n      console.log(`skipped ${id}`);\n    }\n  }\n  console.log(`loaded ${loaded}`);\n}\nmain();',
          },
        ],
      },
    ],
  },
];
