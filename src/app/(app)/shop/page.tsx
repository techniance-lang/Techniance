import { BoltIcon, FreezeIcon, GemIcon, HeartIcon } from "@/components/icons";
import { RightRail } from "@/components/shell";
import { BuyButton } from "@/components/shop-items";
import { requireUser } from "@/lib/auth";
import { MAX_HEARTS, MAX_STREAK_FREEZES, SHOP } from "@/lib/game/rules";
import { formatDuration, getShellData } from "@/lib/shell";

export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const user = await requireUser();
  const shell = await getShellData(user);

  return (
    <div className="mx-auto flex max-w-[1100px] gap-10 px-4 pt-8 lg:px-8">
      <div className="min-w-0 flex-1 pb-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">Shop</h1>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-line px-4 py-2 text-lg font-black text-gem">
            <GemIcon className="size-6" /> {user.gems}
          </div>
        </div>

        <h2 className="mt-8 text-xl font-black">Hearts</h2>
        <div className="mt-3 space-y-3">
          <Item
            icon={<HeartIcon className="size-14" />}
            title={SHOP.heartRefill.name}
            body={
              user.hearts >= MAX_HEARTS
                ? "Your hearts are full."
                : `Get all ${MAX_HEARTS} hearts back now.${shell.heartsNextAt ? ` Next free heart in ${formatDuration(shell.heartsNextAt - Date.now())}.` : ""}`
            }
            action={<BuyButton item="heartRefill" price={SHOP.heartRefill.price} disabled={user.hearts >= MAX_HEARTS} label={user.hearts >= MAX_HEARTS ? "Full" : undefined} />}
          />
        </div>

        <h2 className="mt-8 text-xl font-black">Power-ups</h2>
        <div className="mt-3 space-y-3">
          <Item
            icon={<FreezeIcon className="size-14" />}
            title={SHOP.streakFreeze.name}
            body={`Keeps your streak alive for one missed day. Equipped: ${user.streakFreezes}/${MAX_STREAK_FREEZES}.`}
            action={
              <BuyButton
                item="streakFreeze"
                price={SHOP.streakFreeze.price}
                disabled={user.streakFreezes >= MAX_STREAK_FREEZES}
                label={user.streakFreezes >= MAX_STREAK_FREEZES ? "Max equipped" : undefined}
              />
            }
          />
          <Item
            icon={<BoltIcon className="size-14" />}
            title={SHOP.xpBoost.name}
            body={shell.boostActive ? `Active — ${formatDuration(user.xpBoostUntil - Date.now())} left. Buying again extends it.` : "Earn double XP on everything for 15 minutes."}
            action={<BuyButton item="xpBoost" price={SHOP.xpBoost.price} />}
          />
        </div>

        <div className="card mt-8 p-5">
          <h2 className="font-black">How to earn gems</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold text-muted">
            <li>Complete a new lesson (+5)</li>
            <li>Finish a daily quest (+15)</li>
            <li>Reach your daily goal (+10)</li>
            <li>Unlock achievements (+20 to +200)</li>
          </ul>
        </div>
      </div>
      <RightRail user={user} shell={shell} />
    </div>
  );
}

function Item({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="card flex items-center gap-5 p-5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="font-black">{title}</div>
        <p className="mt-0.5 text-sm font-semibold text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
