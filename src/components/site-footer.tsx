import Link from "next/link";
import { Logo } from "./brand";

/** Marketing/legal footer. (Placeholder — expanded by the legal & SEO work.) */
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row">
        <Logo />
        <p className="flex items-center gap-4">
          <Link href="/brand" className="font-bold hover:text-fg">Brand</Link>
          <span>© {new Date().getFullYear()} Techniance. Learn something every day.</span>
        </p>
      </div>
    </footer>
  );
}
