import { redirect } from "next/navigation";
import { BottomNav, SideNav } from "@/components/nav-links";
import { StatBar } from "@/components/shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, Logo } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getShellData } from "@/lib/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user.onboarded) redirect("/welcome");
  const shell = await getShellData(user);

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col border-r-2 border-line bg-bg px-3 py-6 md:flex xl:w-64 xl:px-4">
        <div className="mb-8 px-2">
          <Logo className="hidden xl:flex" />
          <Logo compact className="xl:hidden" />
        </div>
        <SideNav username={user.username} />
        <div className="mt-auto flex items-center gap-3 px-2">
          <Avatar name={user.displayName} color={user.avatarColor} size={36} />
          <div className="hidden min-w-0 flex-1 xl:block">
            <div className="truncate text-sm font-black">{user.displayName}</div>
            <div className="truncate text-xs font-bold text-muted">@{user.username}</div>
          </div>
          <ThemeToggle className="hidden xl:grid" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b-2 border-line bg-bg/90 px-4 py-2.5 backdrop-blur md:hidden">
        <StatBar user={user} shell={shell} />
      </header>

      <main className="pb-24 md:pb-10 md:pl-[88px] xl:pl-64">{children}</main>
      <BottomNav username={user.username} />
    </div>
  );
}
