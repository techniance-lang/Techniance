"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShopItem } from "@/lib/game/rules";
import { GemIcon } from "./icons";

export function BuyButton({ item, price, disabled, label }: { item: ShopItem; price: number; disabled?: boolean; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function buy() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/shop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Purchased!" } : { ok: false, text: data.error ?? "Purchase failed" });
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={buy} disabled={busy || disabled} className="btn btn-ghost btn-sm min-w-28">
        {busy ? <Loader2 className="size-4 animate-spin" /> : label ?? (
          <>
            <GemIcon className="size-4" /> <span className="text-gem">{price}</span>
          </>
        )}
      </button>
      {msg && <span className={`text-xs font-bold ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</span>}
    </div>
  );
}
