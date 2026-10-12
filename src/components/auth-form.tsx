"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body =
      mode === "signup"
        ? {
            username: form.get("username"),
            email: form.get("email"),
            password: form.get("password"),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        : { identifier: form.get("identifier"), password: form.get("password") };
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
      return;
    }
    router.replace(mode === "signup" || !data.onboarded ? "/welcome" : "/learn");
    router.refresh();
  }

  const input =
    "w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3.5 font-semibold outline-none transition placeholder:text-muted focus:border-brand focus:bg-surface";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {mode === "signup" ? (
        <>
          <input name="username" required minLength={3} maxLength={20} pattern="[A-Za-z0-9_]+" title="Letters, numbers and _ only" placeholder="Username" autoComplete="username" className={input} />
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={input} />
          <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" autoComplete="new-password" className={input} />
        </>
      ) : (
        <>
          <input name="identifier" required placeholder="Email or username" autoComplete="username" className={input} />
          <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={input} />
        </>
      )}
      {error && (
        <p role="alert" className="animate-shake rounded-xl bg-danger-soft px-4 py-2.5 text-sm font-bold text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn w-full py-4">
        {busy && <Loader2 className="size-4 animate-spin" />}
        {mode === "signup" ? "Create account" : "Log in"}
      </button>
      <p className="pt-2 text-center text-sm font-bold text-muted">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/login" className="text-brand hover:underline">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="text-brand hover:underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
