"use client";

import clsx from "clsx";
import { BookOpen, Code2, Gem, Home, Settings, Target, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/learn", label: "Learn", icon: Home, match: ["/learn"] },
  { href: "/courses", label: "Courses", icon: BookOpen, match: ["/courses"] },
  { href: "/practice", label: "Practice", icon: Code2, match: ["/practice"] },
  { href: "/leaderboard", label: "Leagues", icon: Trophy, match: ["/leaderboard"] },
  { href: "/quests", label: "Quests", icon: Target, match: ["/quests"] },
  { href: "/shop", label: "Shop", icon: Gem, match: ["/shop"] },
];

export function SideNav({ username }: { username: string }) {
  const path = usePathname();
  const items = [
    ...ITEMS,
    { href: `/profile/${username}`, label: "Profile", icon: User, match: ["/profile"] },
    { href: "/settings", label: "Settings", icon: Settings, match: ["/settings"] },
  ];
  return (
    <nav className="space-y-1.5">
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((m) => path === m || path.startsWith(`${m}/`));
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-4 rounded-2xl border-2 px-4 py-2.5 text-sm font-extrabold tracking-wide uppercase transition",
              active ? "border-brand/60 bg-brand-soft text-brand" : "border-transparent text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-6" strokeWidth={2.4} />
            <span className="hidden xl:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ username }: { username: string }) {
  const path = usePathname();
  const items = [...ITEMS.filter((i) => i.href !== "/courses"), { href: `/profile/${username}`, label: "Profile", icon: User, match: ["/profile"] }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t-2 border-line bg-surface/95 px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((m) => path === m || path.startsWith(`${m}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={clsx("grid place-items-center rounded-xl border-2 px-3 py-1.5", active ? "border-brand/60 bg-brand-soft text-brand" : "border-transparent text-muted")}
          >
            <Icon className="size-6" strokeWidth={2.4} />
          </Link>
        );
      })}
    </nav>
  );
}
