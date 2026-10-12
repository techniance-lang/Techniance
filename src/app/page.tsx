import { ArrowRight, Check, Code2, Crown, Play, Sparkles, Target, Zap } from "lucide-react";
import Link from "next/link";
import { Mascot } from "@/components/brand";
import { BoltIcon, FlameIcon, GemIcon, HeartIcon, TrophyIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui";
import { COURSES, lessonCount } from "@/content/courses";
import { PROBLEMS } from "@/content/problems";
import { getCurrentUser } from "@/lib/auth";

export default async function Landing() {
  const user = await getCurrentUser();
  const primaryHref = user ? "/learn" : "/signup";
  const totalLessons = COURSES.reduce((s, c) => s + lessonCount(c), 0);

  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-bold text-muted md:flex">
            <a href="#features" className="hover:text-fg">Features</a>
            <a href="#courses" className="hover:text-fg">Courses</a>
            <a href="#practice" className="hover:text-fg">Practice</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/learn" className="btn btn-sm">Continue</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Log in</Link>
                <Link href="/signup" className="btn btn-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_60%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-3 py-1 text-xs font-extrabold text-muted">
              <Sparkles className="size-3.5 text-brand" /> Free · Runs in your browser · No setup
            </span>
            <h1 className="mt-5 text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl">
              Learn to code.
              <br />
              <span className="bg-gradient-to-r from-brand via-[#c25cff] to-flame bg-clip-text text-transparent">Keep the streak alive.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Bite-sized lessons, real coding challenges judged instantly, and a game loop that keeps you coming back —
              streaks, XP, leagues, quests and achievements.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryHref} className="btn btn-lg">
                {user ? "Continue learning" : "Start learning — free"} <ArrowRight className="size-5" />
              </Link>
              <Link href={user ? "/practice" : "/login"} className="btn btn-ghost btn-lg">
                {user ? "Practice problems" : "I have an account"}
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                [COURSES.length, "courses"],
                [totalLessons, "lessons"],
                [PROBLEMS.length, "problems"],
              ].map(([n, label]) => (
                <div key={label as string}>
                  <dt className="text-3xl font-black">{n}</dt>
                  <dd className="text-sm font-bold text-muted">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y-2 border-line bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black sm:text-4xl">Built to make practice a habit</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
            The science of habit-forming apps, applied to programming. Every feature nudges you to code a little every day.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <FlameIcon className="size-9" />, title: "Daily streaks", body: "Code every day to grow your streak. Streak freezes protect it on busy days." },
              { icon: <BoltIcon className="size-9" />, title: "XP & levels", body: "Earn XP for lessons and solved problems. Level up from Newbie to Grandmaster." },
              { icon: <TrophyIcon className="size-9" />, title: "Weekly leagues", body: "Compete on a weekly leaderboard. Finish top 7 to get promoted — Bronze to Diamond." },
              { icon: <HeartIcon className="size-9" />, title: "Hearts", body: "Mistakes cost hearts, so every answer counts. They refill over time or in the shop." },
              { icon: <Target className="size-9 text-success" />, title: "Daily quests", body: "Three fresh quests every day, with gem rewards for finishing them." },
              { icon: <GemIcon className="size-9" />, title: "Gems & shop", body: "Spend gems on streak freezes, heart refills and double-XP boosts." },
            ].map((f) => (
              <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:border-brand/50">
                {f.icon}
                <h3 className="mt-4 text-lg font-black">{f.title}</h3>
                <p className="mt-1.5 text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-black sm:text-4xl">Pick a path</h2>
          <p className="mt-3 max-w-2xl text-muted">Every lesson mixes explanations, quick quizzes, code puzzles and real programs you write yourself.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {COURSES.map((c) => (
              <Link key={c.slug} href={user ? `/courses/${c.slug}` : "/signup"} className="card group overflow-hidden transition hover:-translate-y-1">
                <div className="flex h-28 items-center justify-center text-6xl" style={{ background: `linear-gradient(135deg, ${c.color}, color-mix(in srgb, ${c.color} 55%, #000))` }}>
                  <span className="transition group-hover:scale-110">{c.emoji}</span>
                </div>
                <div className="p-5">
                  <div className="text-xs font-extrabold tracking-wider text-muted uppercase">{c.level} · {lessonCount(c)} lessons</div>
                  <h3 className="mt-1 text-xl font-black">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted">{c.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Practice */}
      <section id="practice" className="border-y-2 border-line bg-surface py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-brand"><Code2 className="size-4" /> PRACTICE ARENA</span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Contest-style problems, judged instantly</h2>
            <p className="mt-3 text-muted">
              Read the statement, write a solution in Python or JavaScript, and submit against hidden tests — just like a real
              competitive programming judge. A new Problem of the Day every day for bonus XP.
            </p>
            <ul className="mt-6 space-y-3">
              {["Easy → Hard problems with tags and hints", "Sample tests + hidden tests", "Accepted / Wrong Answer / TLE verdicts", "Code runs locally in a secure sandbox"].map((t) => (
                <li key={t} className="flex items-center gap-3 font-bold">
                  <span className="grid size-6 place-items-center rounded-full bg-success text-white"><Check className="size-4" strokeWidth={3} /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card overflow-hidden shadow-2xl shadow-black/10">
            <div className="flex items-center gap-2 border-b-2 border-line px-4 py-3">
              <span className="size-3 rounded-full bg-danger" /><span className="size-3 rounded-full bg-gold" /><span className="size-3 rounded-full bg-success" />
              <span className="ml-3 text-sm font-bold text-muted">longest_streak.py</span>
            </div>
            <pre className="bg-code p-5 font-mono text-sm leading-relaxed">
{`n = int(input())
s = input()
best = cur = 0
for ch in s:
    cur = cur + 1 if ch == "1" else 0
    best = max(best, cur)
print(best)`}
            </pre>
            <div className="flex items-center justify-between border-t-2 border-line px-4 py-3">
              <span className="font-black text-success">✓ Accepted · 5/5 tests</span>
              <span className="flex items-center gap-1 font-black text-gold"><BoltIcon className="size-5" /> +10 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Mascot mood="cheer" size={150} className="mx-auto mb-6" bob />
          <h2 className="text-4xl font-black sm:text-5xl">Your streak starts today.</h2>
          <p className="mt-4 text-lg text-muted">Five minutes a day is all it takes. Set a daily goal and we&apos;ll help you stick to it.</p>
          <Link href={primaryHref} className="btn btn-lg mt-8">
            <Play className="size-5" /> {user ? "Continue" : "Create free account"}
          </Link>
        </div>
      </section>

      <footer className="border-t-2 border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row">
          <Logo />
          <p className="flex items-center gap-4">
            <Link href="/brand" className="font-bold hover:text-fg">Brand</Link>
            <span>© {new Date().getFullYear()} Techniance. Learn something every day.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeroMock() {
  const nodes = [
    { done: true, x: 0 },
    { done: true, x: 56 },
    { current: true, x: 80 },
    { x: 40 },
    { x: -20, chest: true },
  ];
  return (
    <div className="relative mx-auto mt-28 w-full max-w-md md:mt-24">
      <div className="card relative p-5 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-flame"><FlameIcon className="size-6 animate-flicker" /> 12</div>
          <div className="flex items-center gap-1.5 font-black text-gem"><GemIcon className="size-6" /> 840</div>
          <div className="flex items-center gap-1.5 font-black text-heart"><HeartIcon className="size-6" /> 5</div>
        </div>
        <div className="mt-4 rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg,#3d8bff,#2559c7)" }}>
          <div className="text-xs font-extrabold opacity-80">UNIT 3</div>
          <div className="text-lg font-black">Decisions & Loops</div>
        </div>
        <div className="relative mt-6 flex flex-col items-center gap-5 pt-8 pb-2">
          {nodes.map((n, i) => (
            <div key={i} style={{ transform: `translateX(${n.x}px)` }} className="relative">
              {n.current && (
                <div className="absolute top-1/2 left-full ml-4 -translate-y-1/2 animate-float rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-xs font-black text-brand">START</div>
              )}
              <div
                className="grid size-16 place-items-center rounded-full text-2xl font-black text-white"
                style={{
                  background: n.done ? "var(--gold)" : n.current ? "var(--brand)" : "var(--locked)",
                  boxShadow: `0 6px 0 ${n.done ? "var(--gold-strong)" : n.current ? "var(--brand-strong)" : "var(--locked-strong)"}`,
                  outline: n.current ? "6px solid color-mix(in srgb, var(--brand) 25%, transparent)" : undefined,
                }}
              >
                {n.chest ? "🎁" : n.done ? <Check className="size-8" strokeWidth={4} /> : n.current ? <Zap className="size-8" /> : <Crown className="size-7 opacity-50" />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card absolute -right-4 -bottom-6 flex animate-float items-center gap-3 px-4 py-3 shadow-xl sm:-right-10">
        <BoltIcon className="size-8" />
        <div>
          <div className="text-xs font-extrabold text-muted">LESSON COMPLETE</div>
          <div className="font-black">+15 XP · 100% accuracy</div>
        </div>
      </div>
      <Mascot mood="wave" size={100} className="absolute -top-[104px] right-10 hidden sm:block" bob />
      <div className="card absolute -top-6 -left-4 flex items-center gap-2 px-3 py-2 shadow-xl sm:-left-10">
        <TrophyIcon className="size-6" color="#ffc93c" />
        <span className="text-sm font-black">#2 in Gold League</span>
      </div>
    </div>
  );
}
