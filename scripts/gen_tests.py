"""Generates src/content/problem-tests.json from reference solutions.

Each problem has hand-picked sample inputs plus seeded random hidden inputs.
Expected outputs are computed by the reference solution, so they are always
consistent. Re-run after editing:  python3 scripts/gen_tests.py
"""

import json
import random
import string
from bisect import bisect_left
from collections import Counter, deque
from pathlib import Path

rng = random.Random(20261012)
OUT = Path(__file__).resolve().parent.parent / "src" / "content" / "problem-tests.json"


def lines(*parts):
    return "\n".join(str(p) for p in parts)


def ints(xs):
    return " ".join(map(str, xs))


# ---------------------------------------------------------------- solutions

def sum_two(inp):
    a, b = map(int, inp.split())
    return str(a + b)


def even_odd(inp):
    data = inp.split()
    t = int(data[0])
    return "\n".join("EVEN" if int(x) % 2 == 0 else "ODD" for x in data[1 : t + 1])


def reverse_string(inp):
    return inp.strip()[::-1]


def count_vowels(inp):
    return str(sum(ch in "aeiouAEIOU" for ch in inp.strip("\n")))


def longest_streak(inp):
    s = inp.split()[1]
    best = cur = 0
    for ch in s:
        cur = cur + 1 if ch == "1" else 0
        best = max(best, cur)
    return str(best)


def palindrome(inp):
    s = "".join(ch.lower() for ch in inp if ch.isalnum())
    return "YES" if s == s[::-1] else "NO"


def xp_leaderboard(inp):
    rows = inp.strip().split("\n")[1:]
    people = []
    for r in rows:
        name, xp = r.split()
        people.append((-int(xp), name))
    people.sort()
    return "\n".join(f"{i + 1}. {n} {-x}" for i, (x, n) in enumerate(people))


def second_largest(inp):
    nums = set(map(int, inp.split("\n")[1].split()))
    if len(nums) < 2:
        return "-1"
    return str(sorted(nums)[-2])


def anagram(inp):
    a, b = inp.strip().split("\n")
    return "YES" if sorted(a) == sorted(b) else "NO"


def brackets(inp):
    out = []
    for s in inp.strip().split("\n")[1:]:
        st = []
        ok = True
        pairs = {")": "(", "]": "[", "}": "{"}
        for ch in s:
            if ch in "([{":
                st.append(ch)
            elif not st or st.pop() != pairs[ch]:
                ok = False
                break
        out.append("YES" if ok and not st else "NO")
    return "\n".join(out)


def pair_count(inp):
    data = inp.split()
    n, k = int(data[0]), int(data[1])
    a = list(map(int, data[2 : 2 + n]))
    seen = Counter()
    total = 0
    for x in a:
        total += seen[k - x]
        seen[x] += 1
    return str(total)


def max_subarray(inp):
    a = list(map(int, inp.split()[1:]))
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return str(best)


def count_primes(inp):
    n = int(inp)
    if n < 2:
        return "0"
    sieve = bytearray([1]) * (n + 1)
    sieve[0] = sieve[1] = 0
    i = 2
    while i * i <= n:
        if sieve[i]:
            sieve[i * i :: i] = bytearray(len(range(i * i, n + 1, i)))
        i += 1
    return str(sum(sieve))


def group_chunks(inp):
    s = inp.strip()
    out = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(f"{s[i]}{j - i}")
        i = j
    return "".join(out)


def lis(inp):
    a = list(map(int, inp.split()[1:]))
    tails = []
    for x in a:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return str(len(tails))


def coin_ways(inp):
    data = list(map(int, inp.split()))
    n, target = data[0], data[1]
    coins = data[2 : 2 + n]
    mod = 10**9 + 7
    ways = [0] * (target + 1)
    ways[0] = 1
    for c in coins:
        for v in range(c, target + 1):
            ways[v] = (ways[v] + ways[v - c]) % mod
    return str(ways[target])


def grid_path(inp):
    rows = inp.strip().split("\n")
    r, c = map(int, rows[0].split())
    g = rows[1 : 1 + r]
    if g[0][0] == "#" or g[r - 1][c - 1] == "#":
        return "-1"
    dist = [[-1] * c for _ in range(r)]
    dist[0][0] = 0
    q = deque([(0, 0)])
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < r and 0 <= nx < c and g[ny][nx] == "." and dist[ny][nx] < 0:
                dist[ny][nx] = dist[y][x] + 1
                q.append((ny, nx))
    return str(dist[r - 1][c - 1])


def edit_distance(inp):
    a, b = inp.strip().split("\n")
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] != b[j - 1]))
        prev = cur
    return str(prev[-1])


# ---------------------------------------------------------------- inputs

def rand_word(n, alphabet=string.ascii_lowercase):
    return "".join(rng.choice(alphabet) for _ in range(n))


def gen_grid(r, c, p):
    g = [["#" if rng.random() < p else "." for _ in range(c)] for _ in range(r)]
    g[0][0] = g[r - 1][c - 1] = "."
    return lines(f"{r} {c}", *("".join(row) for row in g))


NAMES = ["ana", "ben", "cy", "dee", "eli", "fay", "gus", "hana", "ivo", "jo", "kai", "lu", "max", "nia", "oz", "pia"]

PROBLEMS = {
    "sum-of-two": (
        sum_two,
        ["2 3", "-10 25"],
        ["0 0", "1000000000 1000000000", "-999999999 -1", f"{rng.randint(-10**9, 10**9)} {rng.randint(-10**9, 10**9)}"],
    ),
    "even-or-odd": (
        even_odd,
        [lines(3, 4, 7, 0)],
        [lines(5, 1, 2, 3, -8, -11), lines(50, *(rng.randint(-10**9, 10**9) for _ in range(50)))],
    ),
    "reverse-string": (
        reverse_string,
        ["techniance", "racecar"],
        ["a", rand_word(200), "abcdefghij" * 10],
    ),
    "count-vowels": (
        count_vowels,
        ["Hello World", "rhythm"],
        ["AEIOUaeiou", "Programming Is Fun", rand_word(500, string.ascii_letters + " ")],
    ),
    "longest-streak": (
        longest_streak,
        [lines(10, "1101110011"), lines(4, "0000")],
        [lines(1, "1"), lines(7, "1111111"), lines(1000, "".join(rng.choice("0111") for _ in range(1000)))],
    ),
    "palindrome-check": (
        palindrome,
        ["A man, a plan, a canal: Panama", "hello"],
        ["x", "No lemon, no melon", "Was it a car or a cat I saw?", "abcdba", "12321", "ab"],
    ),
    "xp-leaderboard": (
        xp_leaderboard,
        [lines(4, "ana 120", "ben 300", "cy 120", "dee 95")],
        [
            lines(1, "solo 0"),
            lines(len(NAMES), *(f"{n} {rng.randint(0, 50) * 10}" for n in NAMES)),
        ],
    ),
    "second-largest": (
        second_largest,
        [lines(5, "4 9 2 9 7"), lines(3, "5 5 5")],
        [lines(2, "-1 -2"), lines(1, "42"), lines(200, ints(rng.randint(-1000, 1000) for _ in range(200)))],
    ),
    "anagram-check": (
        anagram,
        [lines("listen", "silent"), lines("rat", "car")],
        [lines("a", "a"), lines("aab", "abb"), lines("evil", "vile"), lines(rand_word(300), rand_word(300))],
    ),
    "balanced-brackets": (
        brackets,
        [lines(3, "([]{})", "([)]", "((")],
        [
            lines(6, "()", ")(", "{[()()]}", "[[[]]]]", "{", "[({})](){}"),
            lines(3, "(" * 500 + ")" * 500, "(" * 500 + ")" * 499, "[]" * 300),
        ],
    ),
    "pair-count": (
        pair_count,
        [lines("5 6", "1 5 3 3 2"), lines("4 10", "1 2 3 4")],
        [
            lines("1 2", "1"),
            lines("6 0", "0 0 0 0 0 0"),
            lines("2000 50", ints(rng.randint(0, 50) for _ in range(2000))),
            lines("5000 0", ints(rng.randint(-100, 100) for _ in range(5000))),
        ],
    ),
    "max-subarray": (
        max_subarray,
        [lines(8, "-2 1 -3 4 -1 2 1 -5"), lines(3, "-3 -1 -2")],
        [lines(1, "7"), lines(5, "1 2 3 4 5"), lines(10000, ints(rng.randint(-10000, 10000) for _ in range(10000)))],
    ),
    "count-primes": (
        count_primes,
        ["10", "1"],
        ["2", "100", "99991", "1000000"],
    ),
    "run-length": (
        group_chunks,
        ["aaabccdddd", "xyz"],
        ["a", "zzzzzzzzzzzz", "".join(rng.choice("ab") * rng.randint(1, 12) for _ in range(150))],
    ),
    "longest-increasing-subsequence": (
        lis,
        [lines(8, "10 9 2 5 3 7 101 18"), lines(4, "5 5 5 5")],
        [
            lines(1, "1"),
            lines(6, "1 2 3 4 5 6"),
            lines(6, "6 5 4 3 2 1"),
            lines(20000, ints(rng.randint(1, 10**9) for _ in range(20000))),
        ],
    ),
    "coin-change-ways": (
        coin_ways,
        [lines("3 5", "1 2 5"), lines("1 3", "2")],
        [lines("1 0", "7"), lines("4 100", "1 5 10 25"), lines("6 10000", "1 2 5 10 20 50")],
    ),
    "grid-escape": (
        grid_path,
        [lines("3 4", "..#.", "#...", "...."), lines("2 2", ".#", "#.")],
        [lines("1 1", "."), gen_grid(30, 40, 0.25), gen_grid(60, 60, 0.3), gen_grid(100, 100, 0.2)],
    ),
    "edit-distance": (
        edit_distance,
        [lines("kitten", "sitting"), lines("flaw", "lawn")],
        [lines("a", "a"), lines("abc", "xyz"), lines(rand_word(300, "abc"), rand_word(280, "abc"))],
    ),
}


def main():
    out = {}
    for slug, (solve, samples, hidden) in PROBLEMS.items():
        out[slug] = {
            "samples": [{"input": i, "expected": solve(i)} for i in samples],
            "hidden": [{"input": i, "expected": solve(i)} for i in hidden],
        }
    OUT.write_text(json.dumps(out, indent=1) + "\n")
    print(f"wrote {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT} ({len(out)} problems)")


if __name__ == "__main__":
    main()
