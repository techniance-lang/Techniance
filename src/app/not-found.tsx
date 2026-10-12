import Link from "next/link";
import { Mascot } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Mascot mood="think" size={140} className="mx-auto" bob />
        <div className="mt-4 text-6xl font-black text-brand">404</div>
        <h1 className="mt-2 text-2xl font-black">Byte can&apos;t find that page</h1>
        <p className="mt-2 font-semibold text-muted">Let&apos;s get you back to learning.</p>
        <Link href="/learn" className="btn mt-6">Back to learning</Link>
      </div>
    </div>
  );
}
