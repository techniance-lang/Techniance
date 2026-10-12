import { Download } from "lucide-react";
import { BRAND, LogoMark, Mascot, Wordmark, type Mood } from "@/components/brand";
import { BoltIcon, FlameIcon, GemIcon, HeartIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui";

export const metadata = { title: "Brand", description: "The Techniance logo, mascot, colors and type." };

const PALETTE = [
  { name: "Violet", hex: BRAND.violet, use: "Primary actions, brand" },
  { name: "Deep violet", hex: BRAND.violetDeep, use: "Pressed edges, gradients" },
  { name: "Flame", hex: BRAND.flame, use: "Streaks" },
  { name: "Gold", hex: BRAND.gold, use: "XP, perfect lessons" },
  { name: "Success", hex: "#22c06b", use: "Correct, accepted" },
  { name: "Gem", hex: "#1cb0f6", use: "Gems, shop" },
  { name: "Heart", hex: "#ff4b6e", use: "Hearts, errors" },
  { name: "Night", hex: "#0d0f1e", use: "Dark background" },
];

const MOODS: { mood: Mood; label: string; when: string }[] = [
  { mood: "wave", label: "Wave", when: "Greetings, sign-in, empty states" },
  { mood: "happy", label: "Happy", when: "Default" },
  { mood: "cheer", label: "Cheer", when: "Lesson complete, sign-up, wins" },
  { mood: "think", label: "Think", when: "Not found, errors to retry" },
  { mood: "sad", label: "Sad", when: "Out of hearts, quitting" },
];

export default function BrandPage() {
  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm font-extrabold tracking-wider text-brand uppercase">Brand guide</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Write code. Keep the flame.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          The Techniance mark is a code prompt whose cursor is a streak flame: every session you type is another day your streak
          stays alive. The same flame dots the <em>i</em> in the wordmark and sits on Byte&apos;s antenna.
        </p>

        {/* Logo */}
        <Section title="Logo">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid h-56 place-items-center rounded-3xl border-2 border-line bg-white">
              <div className="flex items-center gap-3 text-[#191b31] [&_.text-fg]:text-[#191b31]">
                <LogoMark size={64} />
                <Wordmark className="text-5xl" />
              </div>
            </div>
            <div className="grid h-56 place-items-center rounded-3xl border-2 border-line bg-[#0d0f1e]">
              <div className="flex items-center gap-3 [&_.text-fg]:text-white">
                <LogoMark size={64} />
                <Wordmark className="text-5xl" />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[128, 72, 40, 24].map((s) => (
              <div key={s} className="card grid h-40 place-items-center">
                <div className="text-center">
                  <LogoMark size={s} className="mx-auto" />
                  <div className="mt-3 text-xs font-bold text-muted">{s}px</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="/brand/techniance-mark.svg" download className="btn btn-ghost btn-sm">
              <Download className="size-4" /> Mark (SVG)
            </a>
            <a href="/icons/icon-512.png" download className="btn btn-ghost btn-sm">
              <Download className="size-4" /> App icon (PNG)
            </a>
          </div>
          <ul className="mt-6 grid gap-3 text-sm font-semibold text-muted sm:grid-cols-3">
            <li className="card p-4"><strong className="text-fg">Clear space:</strong> keep at least a quarter of the mark&apos;s width empty around it.</li>
            <li className="card p-4"><strong className="text-fg">Minimum size:</strong> 20px for the mark, 16px tall for the wordmark.</li>
            <li className="card p-4"><strong className="text-fg">Don&apos;t</strong> recolor the flame, stretch the mark, or set the wordmark in another font.</li>
          </ul>
        </Section>

        {/* Mascot */}
        <Section title="Meet Byte">
          <p className="-mt-2 mb-6 max-w-2xl text-muted">
            Byte is a small, curious program who loves keeping streaks. Byte cheers wins, nudges you back when you slip, and never
            makes you feel bad for a wrong answer.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {MOODS.map((m) => (
              <div key={m.mood} className="card flex flex-col items-center p-5 text-center">
                <Mascot mood={m.mood} size={110} />
                <div className="mt-3 font-black">{m.label}</div>
                <div className="mt-1 text-xs font-semibold text-muted">{m.when}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Color */}
        <Section title="Color">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PALETTE.map((c) => (
              <div key={c.hex} className="card overflow-hidden">
                <div className="h-24" style={{ background: c.hex }} />
                <div className="p-3">
                  <div className="font-black">{c.name}</div>
                  <div className="font-mono text-xs text-muted uppercase">{c.hex}</div>
                  <div className="mt-1 text-xs font-semibold text-muted">{c.use}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Type */}
        <Section title="Typography">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6">
              <div className="text-xs font-extrabold tracking-wider text-muted uppercase">Display & UI · Nunito</div>
              <div className="mt-3 text-5xl font-black">Aa Bb 123</div>
              <p className="mt-3 text-muted">Rounded and friendly. Headings use Black (900), UI labels ExtraBold (800) in caps.</p>
            </div>
            <div className="card p-6">
              <div className="text-xs font-extrabold tracking-wider text-muted uppercase">Code · JetBrains Mono</div>
              <div className="mt-3 font-mono text-4xl font-bold">{"print(42)"}</div>
              <p className="mt-3 text-muted">Used for code, inputs and outputs, and anything learners type.</p>
            </div>
          </div>
        </Section>

        {/* UI */}
        <Section title="Game elements">
          <div className="card flex flex-wrap items-center gap-6 p-6">
            <button className="btn">Primary</button>
            <button className="btn btn-success">Check</button>
            <button className="btn btn-ghost">Secondary</button>
            <span className="flex items-center gap-1.5 font-black text-flame"><FlameIcon className="size-7" /> Streak</span>
            <span className="flex items-center gap-1.5 font-black text-gold"><BoltIcon className="size-7" /> XP</span>
            <span className="flex items-center gap-1.5 font-black text-gem"><GemIcon className="size-7" /> Gems</span>
            <span className="flex items-center gap-1.5 font-black text-heart"><HeartIcon className="size-7" /> Hearts</span>
          </div>
        </Section>

        {/* Voice */}
        <Section title="Voice">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Encouraging", "“Not quite — try again” beats “Wrong.”"],
              ["Short", "One idea per sentence. Buttons are verbs: Check, Continue, Submit."],
              ["Honest", "Name the real problem: “Failed on hidden test #2”, not “Something went wrong.”"],
            ].map(([t, b]) => (
              <div key={t} className="card p-5">
                <div className="font-black">{t}</div>
                <p className="mt-1 text-sm font-semibold text-muted">{b}</p>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-black">{title}</h2>
      {children}
    </section>
  );
}
