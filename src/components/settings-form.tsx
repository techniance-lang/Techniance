"use client";

import clsx from "clsx";
import { Check, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DAILY_GOALS } from "@/lib/game/rules";
import { setSoundEnabled, soundEnabled } from "@/lib/sound";
import { ThemeToggle } from "./theme-toggle";
import { Avatar } from "./ui";

export function SettingsForm({
  initial,
  colors,
}: {
  initial: { displayName: string; bio: string; dailyGoal: number; timezone: string; avatarColor: string };
  colors: string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | string>("idle");
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundEnabled()), []);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [initial.timezone];
    }
  }, [initial.timezone]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? "saved" : (data.error ?? "Couldn't save"));
    if (res.ok) router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  const input = "w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 font-semibold outline-none transition focus:border-brand focus:bg-surface";

  return (
    <form onSubmit={save} className="space-y-8">
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-black">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar name={form.displayName || "?"} color={form.avatarColor} size={64} />
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, avatarColor: c })}
                aria-label={`Avatar color ${c}`}
                className="grid size-9 place-items-center rounded-full transition hover:scale-110"
                style={{ background: c }}
              >
                {form.avatarColor === c && <Check className="size-5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-extrabold text-muted">Display name</span>
          <input className={input} value={form.displayName} maxLength={40} required onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-extrabold text-muted">Bio</span>
          <textarea className={clsx(input, "resize-none")} rows={2} maxLength={160} value={form.bio} placeholder="What are you learning?" onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </label>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-black">Daily goal</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {DAILY_GOALS.map((g) => (
            <button key={g.xp} type="button" data-selected={form.dailyGoal === g.xp} onClick={() => setForm({ ...form, dailyGoal: g.xp })} className="tile flex items-center justify-between px-4 py-3 text-left">
              <span className="font-black">{g.label}</span>
              <span className="text-sm font-bold text-muted">{g.xp} XP / day</span>
            </button>
          ))}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-extrabold text-muted">Time zone (your day — and streak — resets at local midnight)</span>
          <select className={input} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </label>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-black">Preferences</h2>
        <div className="flex items-center justify-between">
          <span className="font-bold">Theme</span>
          <ThemeToggle />
        </div>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="font-bold">Sound effects</span>
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => {
              setSound(e.target.checked);
              setSoundEnabled(e.target.checked);
            }}
            className="size-5 accent-[var(--brand)]"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button type="button" onClick={logout} className="btn btn-ghost">
          <LogOut className="size-4" /> Log out
        </button>
        <div className="flex items-center gap-3">
          {status === "saved" && <span className="font-bold text-success">Saved!</span>}
          {status !== "idle" && status !== "saving" && status !== "saved" && <span className="font-bold text-danger">{status}</span>}
          <button type="submit" disabled={status === "saving"} className="btn">
            {status === "saving" && <Loader2 className="size-4 animate-spin" />} Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
