# Techniance

Learn to code with bite-sized lessons, contest-style practice problems and a Duolingo-style game loop: streaks, XP, levels, hearts, gems, daily quests, weekly leagues and achievements.

All code runs **in the learner's browser** — JavaScript in a Web Worker and Python 3 via a self-hosted [Pyodide](https://pyodide.org) runtime — so there is no code-execution server to operate.

## Features

**Learning**
- 3 courses (Python Fundamentals, JavaScript Essentials, Algorithms & Problem Solving), 28 lessons
- Lessons mix 5 exercise types: concept cards, multiple choice, fill-in-the-blank word banks, line ordering (Parsons problems) and real coding challenges checked against tests
- Winding Duolingo-style learning path; lessons unlock in order, perfect lessons turn gold
- Mistakes come back at the end of the lesson; hint and solution reveal on coding steps

**Practice arena** (CodeChef / LeetCode style)
- 18 problems (easy → hard) with statements, constraints, samples and hidden tests
- Split-pane workspace with a CodeMirror editor, Python / JavaScript, custom input, sample runs and full submissions
- Verdicts: Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded
- Submission history, acceptance rates, solver counts, filters by difficulty, tag and status
- Problem of the Day with bonus XP

**Game loop**
- **Streaks** in the learner's own time zone, with **streak freezes** spent automatically on missed days
- **XP & levels** (Newbie → Grandmaster) and a configurable **daily goal**
- **Hearts**: wrong answers cost a heart; they regenerate over time (replaying finished lessons is free)
- **Gems** from lessons, quests, daily goals and achievements; a **shop** for freezes, heart refills and double-XP boosts
- **Daily quests** — three per day, rewarded automatically
- **Weekly leagues** (Bronze → Diamond): top 7 promote, bottom 5 demote; plus an all-time leaderboard
- **15 achievements**, a profile with stats and an activity heatmap
- Celebration screens, confetti, combo counter and synthesized sound effects

**UX**
- Light and dark themes, responsive down to phones (bottom navigation on mobile)
- Keyboard friendly: `1–4` to pick answers, `Enter` to check / continue, `Ctrl/⌘ + Enter` to run code

## Getting started

### Try it in your browser (no install)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/techniance-lang/Techniance?quickstart=1)

Click the badge and then **Create codespace**. The first start takes a few minutes while dependencies install and demo learners are seeded; the app then opens in a new tab (or open the **Ports** tab and click the globe next to port 3000). Codespaces is free for personal accounts up to a monthly limit.

### Run locally

```bash
npm install        # also copies the Pyodide runtime into public/pyodide
npm run dev        # http://localhost:3000
```

The SQLite database is created automatically at `data/techniance.db` on first request. To populate leagues with demo learners locally:

```bash
npm run db:seed    # demo accounts use the password demo1234
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` / `typecheck` | ESLint and TypeScript checks |
| `npm run verify` | Validates all course content and runs every lesson's reference solution against its tests |
| `npm run gen:tests` | Regenerates `src/content/problem-tests.json` from the reference solutions in `scripts/gen_tests.py` |
| `npm run db:seed` | Adds demo learners |
| `npm run db:push` | Pushes the Drizzle schema with drizzle-kit (optional; tables are auto-created) |

## Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `file:./data/techniance.db` | Any libSQL URL, e.g. a [Turso](https://turso.tech) database for serverless hosting |
| `DATABASE_AUTH_TOKEN` | — | Auth token for remote libSQL |

## Deploying (Vercel + Turso)

Serverless hosts can't keep a SQLite file, so production uses a hosted libSQL database from [Turso](https://turso.tech) (free tier is plenty).

1. **Create the database**: sign up at turso.tech, create a database, then copy its URL (`libsql://…`) and create an auth token. With the CLI: `turso db create techniance`, `turso db show techniance --url`, `turso db tokens create techniance`.
2. **Import the repo on Vercel**: vercel.com → *Add New → Project* → pick this GitHub repo. The framework preset (Next.js) and build settings are detected automatically.
3. **Add environment variables** before the first deploy: `DATABASE_URL` = the `libsql://…` URL, `DATABASE_AUTH_TOKEN` = the token.
4. **Deploy.** Tables are created automatically on the first request. Every push to the production branch redeploys.

Without `DATABASE_URL`, a Vercel deployment still builds, but signing in fails with an error explaining what to set.

## Project layout

```
src/
  app/                    Next.js App Router
    (auth)/               login, signup
    (app)/                signed-in shell: learn, courses, practice, leaderboard, quests, shop, profile, settings
    lesson/[lessonId]/    full-screen lesson player
    api/                  auth, lesson completion, hearts, submissions, shop, settings
  components/             UI (lesson player, problem workspace, path, rewards, shell…)
  content/                courses, problems and generated problem tests
  lib/
    db/                   Drizzle schema + libSQL client (auto-migrating)
    game/                 rules (XP, levels, hearts, leagues), streak/quest/achievement engine
    runner.ts             browser code runner + judge
public/workers/           JS and Python sandbox workers
scripts/                  test generation, content verification, seeding
```

## Adding content

- **Lessons**: add steps to a course in `src/content/courses/*.ts` (types in `src/content/types.ts`), then run `npm run verify`.
- **Problems**: add a reference solution and inputs in `scripts/gen_tests.py`, run `npm run gen:tests`, then add the statement in `src/content/problems.ts`.

## Notes and limitations

- Code is judged client-side, so a determined user could fake a verdict and earn XP. That is fine for self-paced learning; for rated contests, plug a server-side judge (e.g. Judge0 or Piston) into `src/app/api/problems/submit/route.ts`.
- Python starts after a one-time ~13 MB runtime download, which the browser then caches.
