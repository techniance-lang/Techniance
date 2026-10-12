import { Lock } from "lucide-react";
import Link from "next/link";
import { Mascot } from "../brand";

/** Full-page lock shown when a free user opens Pro-only content. */
export function ProLockedPage({ title, reason, backHref, backLabel }: { title: string; reason: string; backHref: string; backLabel: string }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md">
        <Mascot mood="think" size={120} className="mx-auto" />
        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-black text-brand uppercase">
          <Lock className="size-3.5" /> Pro
        </div>
        <h1 className="mt-3 text-2xl font-black">{title}</h1>
        <p className="mt-2 font-semibold text-muted">{reason}</p>
        <Link href="/pricing" className="btn btn-lg mt-6 w-full">
          Unlock with Pro
        </Link>
        <Link href={backHref} className="btn btn-ghost mt-3 w-full">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
