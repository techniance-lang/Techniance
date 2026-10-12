"""Generates src/content/problem-tests.json from reference solutions.

Each problem has hand-picked sample inputs plus seeded random hidden inputs.
Expected outputs are computed by the reference solution, so they are always
consistent. Re-run after editing:  python3 scripts/gen_tests.py
"""

import heapq
import json
import random
import string
import sys
import time
from bisect import bisect_left
from collections import Counter, deque
from math import gcd, isqrt
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


# ================================================================ problem set 2
# Everything below uses its own random stream (R), so adding or editing these
# problems never changes the inputs generated for the original set above.

R = random.Random(20261013)


# ---------------------------------------------------------------- solutions

def spiral_matrix(inp):
    data = inp.split()
    r, c = int(data[0]), int(data[1])
    vals = data[2 : 2 + r * c]
    g = [vals[i * c : (i + 1) * c] for i in range(r)]
    top, bottom, left, right = 0, r - 1, 0, c - 1
    out = []
    while top <= bottom and left <= right:
        out.extend(g[top][j] for j in range(left, right + 1))
        out.extend(g[i][right] for i in range(top + 1, bottom + 1))
        if top < bottom:
            out.extend(g[bottom][j] for j in range(right - 1, left - 1, -1))
        if left < right:
            out.extend(g[i][left] for i in range(bottom - 1, top, -1))
        top, bottom, left, right = top + 1, bottom - 1, left + 1, right - 1
    return " ".join(out)


def shift_cipher(inp):
    first, msg = inp.split("\n", 1)
    k = int(first) % 26
    out = []
    for ch in msg.rstrip("\n"):
        if "a" <= ch <= "z":
            out.append(chr((ord(ch) - 97 - k) % 26 + 97))
        elif "A" <= ch <= "Z":
            out.append(chr((ord(ch) - 65 - k) % 26 + 65))
        else:
            out.append(ch)
    return "".join(out)


def sync_reminders(inp):
    data = list(map(int, inp.split()))
    n = data[0]
    lcm = 1
    for x in data[1 : 1 + n]:
        lcm = lcm // gcd(lcm, x) * x
    return str(lcm)


def rover_commands(inp):
    rows = inp.split("\n")
    r, c = map(int, rows[0].split())
    g = rows[1 : 1 + r]
    cmds = rows[1 + r].strip()
    dr, dc = (-1, 0, 1, 0), (0, 1, 0, -1)  # N E S W
    y = x = 0
    d = 1  # facing East
    seen = {(0, 0)}
    for ch in cmds:
        if ch == "L":
            d = (d + 3) % 4
        elif ch == "R":
            d = (d + 1) % 4
        else:
            ny, nx = y + dr[d], x + dc[d]
            if 0 <= ny < r and 0 <= nx < c and g[ny][nx] == ".":
                y, x = ny, nx
                seen.add((y, x))
    return f"{y + 1} {x + 1} {'NESW'[d]}\n{len(seen)}"


def power_mod(inp):
    data = inp.split()
    t = int(data[0])
    return "\n".join(str(pow(int(data[1 + 3 * i]), int(data[2 + 3 * i]), int(data[3 + 3 * i]))) for i in range(t))


def prime_window(inp):
    lo, hi = map(int, inp.split())
    lim = isqrt(hi)
    base = bytearray([1]) * (lim + 1)
    for i in range(min(2, lim + 1)):
        base[i] = 0
    for i in range(2, isqrt(lim) + 1):
        if base[i]:
            base[i * i :: i] = bytearray(len(range(i * i, lim + 1, i)))
    seg = bytearray([1]) * (hi - lo + 1)
    for p in range(2, lim + 1):
        if not base[p]:
            continue
        start = max(p * p, (lo + p - 1) // p * p)
        if start <= hi:
            seg[start - lo :: p] = bytearray(len(range(start - lo, hi - lo + 1, p)))
    if lo == 1:
        seg[0] = 0
    return str(seg.count(1))


def next_higher(inp):
    data = list(map(int, inp.split()))
    n = data[0]
    a = data[1 : 1 + n]
    res = [-1] * n
    waiting = []  # indices still looking for a higher score
    for i, x in enumerate(a):
        while waiting and a[waiting[-1]] < x:
            res[waiting.pop()] = x
        waiting.append(i)
    return " ".join(map(str, res))


def study_sprint(inp):
    data = list(map(int, inp.split()))
    n, s = data[0], data[1]
    a = data[2 : 2 + n]
    best, total, left = n + 1, 0, 0
    for right, x in enumerate(a):
        total += x
        while total >= s:
            best = min(best, right - left + 1)
            total -= a[left]
            left += 1
    return str(best if best <= n else 0)


def workshop_marathon(inp):
    data = list(map(int, inp.split()))
    n = data[0]
    talks = sorted(zip(data[1 : 1 + 2 * n : 2], data[2 : 2 + 2 * n : 2]), key=lambda p: p[1])
    count, free_at = 0, -1
    for s, e in talks:
        if s >= free_at:
            count += 1
            free_at = e
    return str(count)


def orchard_harvest(inp):
    rows = inp.split("\n")
    r, c = map(int, rows[0].split())
    P = [[0] * (c + 1) for _ in range(r + 1)]
    for i in range(r):
        row, acc = rows[1 + i].strip(), 0
        above, here = P[i], P[i + 1]
        for j in range(c):
            acc += ord(row[j]) - 48
            here[j + 1] = above[j + 1] + acc
    q = int(rows[1 + r])
    out = []
    for k in range(q):
        r1, c1, r2, c2 = map(int, rows[2 + r + k].split())
        out.append(P[r2][c2] - P[r1 - 1][c2] - P[r2][c1 - 1] + P[r1 - 1][c1 - 1])
    return "\n".join(map(str, out))


def study_groups(inp):
    rows = inp.split("\n")
    n, q = map(int, rows[0].split())
    parent = list(range(n + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    groups, out = n, []
    for k in range(q):
        op, a, b = rows[1 + k].split()
        ra, rb = find(int(a)), find(int(b))
        if op == "+":
            if ra != rb:
                parent[ra] = rb
                groups -= 1
        else:
            out.append("YES" if ra == rb else "NO")
    out.append(str(groups))
    return "\n".join(out)


def robot_paths(inp):
    rows = inp.split("\n")
    r, c = map(int, rows[0].split())
    mod = 10**9 + 7
    dp = [0] * c
    for i in range(r):
        row = rows[1 + i]
        for j in range(c):
            if row[j] == "#":
                dp[j] = 0
            elif i == 0 and j == 0:
                dp[j] = 1
            elif j > 0:
                dp[j] = (dp[j] + dp[j - 1]) % mod
    return str(dp[c - 1])


def palindrome_patch(inp):
    s = inp.strip()
    t = s[::-1]
    n = len(s)
    prev = [0] * (n + 1)  # longest common subsequence of s and reversed s
    for i in range(1, n + 1):
        cur = [0] * (n + 1)
        a = s[i - 1]
        for j in range(1, n + 1):
            if a == t[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = cur[j - 1] if cur[j - 1] > prev[j] else prev[j]
        prev = cur
    return str(n - prev[n])


def reading_plan(inp):
    data = list(map(int, inp.split()))
    n, d = data[0], data[1]
    pages = data[2 : 2 + n]

    def days_needed(limit):
        days, today = 1, 0
        for p in pages:
            if today + p > limit:
                days, today = days + 1, p
            else:
                today += p
        return days

    lo, hi = max(pages), sum(pages)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(mid) <= d:
            hi = mid
        else:
            lo = mid + 1
    return str(lo)


def course_order(inp):
    data = list(map(int, inp.split()))
    n, m = data[0], data[1]
    adj = [[] for _ in range(n + 1)]
    indeg = [0] * (n + 1)
    for k in range(m):
        a, b = data[2 + 2 * k], data[3 + 2 * k]
        adj[a].append(b)
        indeg[b] += 1
    ready = [v for v in range(1, n + 1) if indeg[v] == 0]
    heapq.heapify(ready)
    order = []
    while ready:
        v = heapq.heappop(ready)
        order.append(v)
        for w in adj[v]:
            indeg[w] -= 1
            if indeg[w] == 0:
                heapq.heappush(ready, w)
    return " ".join(map(str, order)) if len(order) == n else "IMPOSSIBLE"


def cheapest_route(inp):
    data = list(map(int, inp.split()))
    n, m = data[0], data[1]
    adj = [[] for _ in range(n + 1)]
    for k in range(m):
        u, v, w = data[2 + 3 * k : 5 + 3 * k]
        adj[u].append((v, w))
        adj[v].append((u, w))
    dist = [-1] * (n + 1)
    heap = [(0, 1)]
    while heap:
        d, v = heapq.heappop(heap)
        if dist[v] >= 0:
            continue
        dist[v] = d
        for w, cost in adj[v]:
            if dist[w] < 0:
                heapq.heappush(heap, (d + cost, w))
    return str(dist[n])


def backpack_budget(inp):
    data = list(map(int, inp.split()))
    n, cap = data[0], data[1]
    best = [0] * (cap + 1)  # best[c] = top value using capacity c
    for k in range(n):
        w, v = data[2 + 2 * k], data[3 + 2 * k]
        if w <= cap:
            best = best[:w] + [x if x >= y + v else y + v for x, y in zip(best[w:], best[: cap + 1 - w])]
    return str(best[cap])


def skill_squad(inp):
    rows = inp.split("\n")
    n, k = map(int, rows[0].split())
    masks = set()
    for i in range(n):
        parts = list(map(int, rows[1 + i].split()))
        m = 0
        for s in parts[1 : 1 + parts[0]]:
            m |= 1 << s
        masks.add(m)
    dist = [-1] * (1 << k)
    dist[0] = 0
    frontier = [0]
    while frontier:
        nxt = []
        for cur in frontier:
            for m in masks:
                nm = cur | m
                if dist[nm] < 0:
                    dist[nm] = dist[cur] + 1
                    nxt.append(nm)
        frontier = nxt
    return str(dist[(1 << k) - 1])


def eval_expression(expr, track=None):
    """Recursive-descent evaluator for + - * and parentheses. `track` collects |value| of every subresult."""
    tokens, i = [], 0
    while i < len(expr):
        ch = expr[i]
        if ch.isdigit():
            j = i
            while j < len(expr) and expr[j].isdigit():
                j += 1
            tokens.append(int(expr[i:j]))
            i = j
        else:
            if ch in "+-*()":
                tokens.append(ch)
            elif ch != " ":
                raise ValueError(f"bad character {ch!r}")
            i += 1
    pos = 0

    def note(v):
        if track is not None:
            track.append(abs(v))
        return v

    def expr_():
        nonlocal pos
        v = term()
        while pos < len(tokens) and tokens[pos] in ("+", "-"):
            op = tokens[pos]
            pos += 1
            v = note(v + term() if op == "+" else v - term())
        return v

    def term():
        nonlocal pos
        v = factor()
        while pos < len(tokens) and tokens[pos] == "*":
            pos += 1
            v = note(v * factor())
        return v

    def factor():
        nonlocal pos
        tok = tokens[pos]
        pos += 1
        if tok == "(":
            v = expr_()
            assert tokens[pos] == ")"
            pos += 1
            return v
        assert isinstance(tok, int)
        return note(tok)

    v = expr_()
    assert pos == len(tokens), expr
    return v


def calculator(inp):
    rows = inp.split("\n")
    t = int(rows[0])
    return "\n".join(str(eval_expression(rows[1 + i])) for i in range(t))


# ---------------------------------------------------------------- inputs

def r_ints(n, lo, hi):
    return ints(R.randint(lo, hi) for _ in range(n))


def r_word(n, alphabet=string.ascii_lowercase):
    return "".join(R.choice(alphabet) for _ in range(n))


def r_matrix(r, c, lo=-999, hi=999):
    return lines(f"{r} {c}", *(r_ints(c, lo, hi) for _ in range(r)))


def r_grid(r, c, p, keep=((0, 0),)):
    g = [["#" if R.random() < p else "." for _ in range(c)] for _ in range(r)]
    for y, x in keep:
        g[y][x] = "."
    return ["".join(row) for row in g]


WORDS = (
    "code loop array stack queue graph tree node edge path sort merge search binary prime streak league "
    "lesson badge python rust java swift kotlin bug fix test run debug patch push commit branch learn level "
    "quest bonus gem heart friend coffee night owl early bird puzzle logic crash compile"
).split()


def shift_encode(msg, k):
    out = []
    for ch in msg:
        if ch.islower():
            out.append(chr((ord(ch) - 97 + k) % 26 + 97))
        elif ch.isupper():
            out.append(chr((ord(ch) - 65 + k) % 26 + 65))
        else:
            out.append(ch)
    return "".join(out)


def r_sentence(words):
    parts = []
    for _ in range(words):
        w = R.choice(WORDS)
        if R.random() < 0.2:
            w = w.capitalize()
        if R.random() < 0.08:
            w = w.upper()
        if R.random() < 0.1:
            w += R.choice(",.!?;:")
        if R.random() < 0.05:
            w += str(R.randint(0, 2026))
        parts.append(w)
    return " ".join(parts)


def cipher_case(k, plain):
    return lines(k, shift_encode(plain, k % 26))


def divisors_from(factors):
    """All divisors of the number whose prime factorisation is {prime: exponent}."""
    divs = [1]
    for p, e in factors.items():
        divs = [d * p**k for d in divs for k in range(e + 1)]
    return sorted(divs)


# Divisors (≤ 10⁹) of 2¹⁰·3⁶·5⁴·7³·11²·13 ≈ 2.5·10¹⁴, so any mix of them has an LCM that fits in 64 bits.
REMINDER_PERIODS = [d for d in divisors_from({2: 10, 3: 6, 5: 4, 7: 3, 11: 2, 13: 1}) if d <= 10**9]


def rover_case(r, c, p, length):
    g = r_grid(r, c, p)
    cmds = "".join(R.choice("FFFFFFLRR" if i % 7 else "FL") for i in range(length))
    return lines(f"{r} {c}", *g, cmds)


def orchard_case(r, c, q):
    g = ["".join(R.choice("0123456789") for _ in range(c)) for _ in range(r)]
    qs = []
    for _ in range(q):
        r1, r2 = sorted((R.randint(1, r), R.randint(1, r)))
        c1, c2 = sorted((R.randint(1, c), R.randint(1, c)))
        qs.append(f"{r1} {c1} {r2} {c2}")
    return lines(f"{r} {c}", *g, q, *qs)


def groups_case(n, q, join_share):
    ops = []
    for _ in range(q):
        op = "+" if R.random() < join_share else "?"
        ops.append(f"{op} {R.randint(1, n)} {R.randint(1, n)}")
    return lines(f"{n} {q}", *ops)


def chain_groups_case(n):
    # Long chains defeat union-find without path compression or union by size.
    ops = [f"+ {i} {i + 1}" for i in range(1, n)]
    ops += [f"? 1 {n}", f"? {n} 1", f"? 1 {n // 2}"]
    return lines(f"{n + 1} {len(ops)}", *ops)


def robot_case(r, c, p):
    return lines(f"{r} {c}", *r_grid(r, c, p, keep=((0, 0), (r - 1, c - 1))))


def dag_case(n, m, cycle=False):
    perm = list(range(1, n + 1))
    R.shuffle(perm)
    edges = set()
    while len(edges) < m:
        i, j = sorted(R.sample(range(n), 2))
        edges.add((perm[i], perm[j]))
    edges = list(edges)
    if cycle:
        # Two forward edges plus one back edge close a 3-cycle somewhere in the middle of the order.
        i, j, k = sorted(R.sample(range(n), 3))
        edges += [(perm[i], perm[j]), (perm[j], perm[k]), (perm[k], perm[i])]
    R.shuffle(edges)
    return lines(f"{n} {len(edges)}", *(f"{a} {b}" for a, b in edges))


def road_case(n, m, wlo, whi, connected=True):
    edges = []
    if connected:
        for v in range(2, n + 1):
            edges.append((R.randint(1, v - 1), v, R.randint(wlo, whi)))
    while len(edges) < m:
        u, v = R.sample(range(1, n + 1), 2)
        edges.append((u, v, R.randint(wlo, whi)))
    R.shuffle(edges)
    return lines(f"{n} {len(edges)}", *(f"{u} {v} {w}" for u, v, w in edges))


def backpack_case(n, cap, wmax, vmax):
    return lines(f"{n} {cap}", *(f"{R.randint(1, wmax)} {R.randint(1, vmax)}" for _ in range(n)))


def squad_case(n, k, lo, hi):
    rows = []
    for _ in range(n):
        skills = R.sample(range(k), R.randint(lo, min(hi, k)))
        rows.append(ints([len(skills), *skills]))
    return lines(f"{n} {k}", *rows)


def squad_greedy_trap():
    # Optimal: {0..5} + {6..11} (2 people). Greedy grabs the 8-skill decoy first and ends with 3.
    people = [
        [0, 1, 2, 3, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11],
        [4, 10],
        [5, 11],
        [1, 7],
    ]
    return lines(f"{len(people)} 12", *(ints([len(p), *p]) for p in people))


def r_expression(budget, depth=0):
    """Random expression with roughly `budget` numbers; spaces sprinkled between tokens."""
    if budget <= 1 or (depth > 0 and R.random() < 0.15):
        return str(R.choice([R.randint(0, 9), R.randint(0, 99), R.randint(0, 9999)]))
    parts = []
    count = R.randint(2, min(5, budget))
    share = max(1, budget // count)
    for i in range(count):
        if i:
            op = R.choice("+-*" if depth < 3 else "+-")
            sp = R.choice(["", " "])
            parts.append(f"{sp}{op}{sp}")
        sub = r_expression(share, depth + 1)
        parts.append(f"({sub})" if R.random() < 0.35 and not sub.isdigit() else sub)
    return "".join(parts)


def calc_case(t, budget):
    out = []
    while len(out) < t:
        e = r_expression(budget)
        track = []
        eval_expression(e, track)
        if max(track) <= 10**15 and len(e) <= 10**4:
            out.append(e)
    return lines(t, *out)


def deep_expression(depth):
    e = "7"
    for i in range(depth):
        e = f"({e} {'+-*'[i % 3]} {i % 5 + 1})"
    return e


N_DECREASING = 3000

PROBLEMS_2 = {
    "spiral-matrix": (
        spiral_matrix,
        [lines("3 4", "1 2 3 4", "5 6 7 8", "9 10 11 12"), lines("3 1", "5", "6", "7")],
        [
            lines("1 1", "42"),
            lines("1 6", "6 5 4 3 2 1"),
            lines("2 2", "1 2", "3 4"),
            r_matrix(4, 4),
            r_matrix(5, 3),
            r_matrix(3, 5),
            r_matrix(2, 7),
            r_matrix(7, 2),
            r_matrix(20, 13),
            r_matrix(37, 41),
        ],
    ),
    "shift-cipher": (
        shift_cipher,
        [lines(3, "Khoor, Zruog!"), lines(27, "bqqmf ujnf")],
        [
            lines(0, "Nothing changes here 123"),
            cipher_case(26, "Full Circle"),
            cipher_case(25, "zzz AAA abc XYZ"),
            cipher_case(1000000000, r_sentence(12)),
            cipher_case(13, "Why did the developer go broke? Because he used up all his cache!"),
            cipher_case(R.randint(1, 10**9), r_sentence(120)),
        ],
    ),
    "sync-reminders": (
        sync_reminders,
        [lines(3, "4 6 10"), lines(2, "7 7")],
        [
            lines(1, "1"),
            lines(1, "1000000000"),
            lines(5, "1 2 3 4 5"),
            lines(4, "12 18 30 45"),
            lines(2, "999999937 999999929"),
            lines(3, "999999937 999999929 999999937"),
            lines(100, r_ints(100, 1, 40)),
            lines(60, ints(R.choice(REMINDER_PERIODS) for _ in range(60))),
        ],
    ),
    "rover-commands": (
        rover_commands,
        [lines("3 4", "....", ".#..", "....", "FFRFRFFLLFFF"), lines("1 1", ".", "FFLRF")],
        [
            lines("1 5", ".....", "FFFFFFFF"),
            lines("2 2", "..", "..", "RRRRRRRRL"),
            lines("3 3", ".#.", "...", "#..", "FRFFLFLFRRF"),
            rover_case(10, 10, 0.2, 200),
            rover_case(30, 40, 0.25, 2000),
            rover_case(50, 50, 0.1, 5000),
        ],
    ),
    "power-mod": (
        power_mod,
        [lines(3, "2 10 1000", "3 0 7", "7 222 13"), lines(2, "5 1000000000000000000 1", "0 0 9")],
        [
            lines(4, "0 5 7", "1000000000 1000000000000000000 1000000000", "999999999 1000000000000000000 999999937", "10 18 1000000000"),
            lines(
                200,
                *(f"{R.randint(0, 10**9)} {R.randint(0, 10**18)} {R.randint(1, 10**9)}" for _ in range(150)),
                *(f"{R.randint(0, 50)} {R.randint(0, 100)} {R.randint(1, 1000)}" for _ in range(50)),
            ),
        ],
    ),
    "prime-window": (
        prime_window,
        ["10 30", "1 10"],
        [
            "1 1",
            "2 2",
            "1 1000000",
            "999999000000 1000000000000",
            "1000000000000 1000000000000",
            "999999999989 999999999989",
            "123456789012 123456989012",
            "4294000000 4295000000",
        ],
    ),
    "next-higher": (
        next_higher,
        [lines(6, "2 7 3 5 4 6"), lines(4, "5 5 5 5")],
        [
            lines(1, "9"),
            lines(10, "1 2 3 4 5 6 7 8 9 10"),
            lines(60, r_ints(60, 1, 20)),
            lines(N_DECREASING, ints(range(N_DECREASING, 0, -1))),
            lines(1500, r_ints(1500, 1, 1000)),
        ],
    ),
    "study-sprint": (
        study_sprint,
        [lines("6 10", "2 1 5 2 8 1"), lines("3 100", "10 20 30")],
        [
            lines("1 5", "5"),
            lines("1 6", "5"),
            lines("5 15", "1 2 3 4 5"),
            lines("8 7", "1 1 1 7 1 1 1 1"),
            lines("1500 2000000", r_ints(1500, 1, 10000)),
            lines("1500 150000", r_ints(1500, 1, 10000)),
            lines("2000 60000", r_ints(2000, 1, 100)),
            lines("800 1000000000", r_ints(800, 1, 10000)),
        ],
    ),
    "workshop-marathon": (
        workshop_marathon,
        [lines(5, "1 4", "3 5", "0 6", "5 7", "8 9"), lines(3, "1 3", "3 5", "5 7")],
        [
            lines(1, "0 1"),
            lines(3, "2 5", "2 5", "2 5"),
            lines(4, "0 100", "10 20", "30 40", "50 60"),
            lines(3, "0 10", "9 12", "11 20"),
            lines(4, "0 1000000000", "0 1", "1 2", "999999999 1000000000"),
            lines(1000, *(f"{s} {s + R.randint(1, 500)}" for s in (R.randint(0, 100000) for _ in range(1000)))),
            lines(500, *(f"{s} {s + R.randint(1, 20)}" for s in (R.randint(0, 3000) for _ in range(500)))),
        ],
    ),
    "orchard-harvest": (
        orchard_harvest,
        [lines("3 4", "1203", "4567", "0089", 3, "1 1 2 2", "2 3 3 4", "1 1 3 4")],
        [
            lines("1 1", "7", 2, "1 1 1 1", "1 1 1 1"),
            lines("2 3", "999", "999", 3, "1 1 2 3", "2 2 2 2", "1 3 2 3"),
            orchard_case(50, 80, 300),
            orchard_case(100, 100, 700),
        ],
    ),
    "study-groups": (
        study_groups,
        [lines("5 6", "+ 1 2", "? 1 2", "? 1 3", "+ 3 4", "+ 2 4", "? 1 3")],
        [
            lines("1 1", "? 1 1"),
            lines("3 2", "+ 1 1", "? 2 3"),
            lines("4 4", "+ 1 2", "+ 3 4", "+ 1 2", "? 4 3"),
            groups_case(30, 60, 0.4),
            groups_case(800, 1500, 0.3),
            chain_groups_case(1000),
        ],
    ),
    "robot-paths": (
        robot_paths,
        [lines("3 3", "...", ".#.", "..."), lines("2 2", ".#", "#.")],
        [
            lines("1 1", "."),
            lines("1 5", "....."),
            lines("2 2", "#.", ".."),
            lines("3 3", "...", "...", "..#"),
            robot_case(18, 18, 0.0),
            robot_case(100, 100, 0.0),
            robot_case(100, 100, 0.1),
            robot_case(60, 90, 0.25),
        ],
    ),
    "palindrome-patch": (
        palindrome_patch,
        ["abca", "race"],
        [
            "a",
            "abba",
            "ab",
            "programming",
            r_word(300, "ab"),
            r_word(450, "abc"),
            (lambda h: h + "x" + h[::-1][3:])(r_word(250)),
            r_word(400),
        ],
    ),
    "reading-plan": (
        reading_plan,
        [lines("5 3", "10 20 30 40 50"), lines("4 4", "7 2 9 4")],
        [
            lines("1 1", "100"),
            lines("6 1", "1 2 3 4 5 6"),
            lines("8 3", "5 5 5 5 5 5 5 5"),
            lines("7 5", "1 1 1 1 1 1 10000"),
            lines("2500 37", r_ints(2500, 1, 10000)),
            lines("1500 1499", r_ints(1500, 1, 10000)),
            lines("1000 7", r_ints(1000, 9000, 10000)),
        ],
    ),
    "course-order": (
        course_order,
        [lines("4 3", "1 3", "2 3", "3 4"), lines("5 3", "3 1", "2 1", "5 4"), lines("3 3", "1 2", "2 3", "3 1")],
        [
            lines("1 0"),
            lines("3 0"),
            lines("2 2", "1 2", "1 2"),
            lines("4 2", "4 1", "3 2"),
            dag_case(30, 40),
            dag_case(600, 1200),
            dag_case(500, 800, cycle=True),
        ],
    ),
    "cheapest-route": (
        cheapest_route,
        [lines("4 5", "1 2 4", "1 3 1", "3 2 2", "2 4 5", "3 4 9"), lines("3 1", "1 2 5")],
        [
            lines("2 1", "1 2 1000000000"),
            lines("2 2", "1 2 5", "2 1 3"),
            lines("4 2", "1 2 1", "3 4 1"),
            lines("300 299", *(f"{v} {v + 1} 1000000000" for v in range(1, 300))),
            road_case(40, 80, 1, 50),
            road_case(400, 1000, 1, 1000),
            road_case(300, 800, 1, 10**9),
            road_case(300, 600, 1, 100, connected=False),
        ],
    ),
    "backpack-budget": (
        backpack_budget,
        [lines("4 7", "3 4", "4 5", "2 3", "5 8"), lines("3 10", "6 30", "5 20", "5 20")],
        [
            lines("1 5", "6 100"),
            lines("1 5", "5 100"),
            lines("5 10", "5 10", "4 40", "6 30", "3 50", "2 5"),
            backpack_case(30, 500, 100, 1000),
            backpack_case(60, 5000, 1000, 10**9),
            backpack_case(100, 10000, 2000, 10**9),
            backpack_case(100, 10000, 10000, 10**6),
        ],
    ),
    "skill-squad": (
        skill_squad,
        [lines("4 5", "3 0 1 2", "2 3 4", "3 1 3 4", "2 0 2"), lines("2 3", "1 0", "1 1")],
        [
            lines("1 1", "0"),
            lines("1 1", "1 0"),
            lines("10 10", *(f"1 {i}" for i in range(10))),
            squad_greedy_trap(),
            squad_case(20, 8, 1, 3),
            squad_case(60, 12, 1, 4),
            squad_case(60, 12, 0, 2),
            squad_case(40, 12, 2, 6),
        ],
    ),
    "calculator": (
        calculator,
        [lines(4, "2 + 3 * 4", "(2 + 3) * 4", "10 - 4 - 3", "2*(3+(4-1))*2")],
        [
            lines(1, "42"),
            lines(3, "0*999999999", "1 - 2 - 3", "3 - (4 - 10) * 2"),
            lines(2, "999999999 * 999999999 * 1", "1000000 * 1000000 * 1000000 - 1"),
            lines(1, deep_expression(100)),
            calc_case(10, 20),
            calc_case(15, 120),
        ],
    ),
}


def main():
    out = {}
    slow = []
    for slug, (solve, samples, hidden) in {**PROBLEMS, **PROBLEMS_2}.items():
        cases = {"samples": [], "hidden": []}
        for kind, inputs in (("samples", samples), ("hidden", hidden)):
            for i in inputs:
                start = time.perf_counter()
                expected = solve(i)
                took = time.perf_counter() - start
                if took > 1.0:
                    slow.append(f"{slug}: a {kind[:-1]} took {took:.2f}s in the reference solution")
                cases[kind].append({"input": i, "expected": expected})
        out[slug] = cases
    OUT.write_text(json.dumps(out, indent=1) + "\n")
    size = OUT.stat().st_size
    print(f"wrote {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT} ({len(out)} problems, {size // 1024} KB)")
    for s in slow:
        print(f"warning: {s}", file=sys.stderr)


if __name__ == "__main__":
    main()
