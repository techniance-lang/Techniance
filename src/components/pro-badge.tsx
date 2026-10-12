import clsx from "clsx";

/** Small "PRO" pill shown next to Pro members' names. */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-md bg-gradient-to-r from-brand to-[#c25cff] px-1.5 py-0.5 text-[10px] leading-none font-black tracking-wider text-white", className)}>
      PRO
    </span>
  );
}
