import { AccountSection } from "@/components/account/account-section";
import { BillingSection } from "@/components/billing/billing-section";
import { SettingsForm } from "@/components/settings-form";
import { AVATAR_COLORS, requireUser } from "@/lib/auth";
import { accessOf } from "@/lib/billing/access";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const access = accessOf(user);
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pt-8 pb-12">
      <h1 className="text-3xl font-black">Settings</h1>
      <BillingSection
        pro={access.pro}
        billingEnabled={access.billingEnabled}
        proUntil={user.proUntil}
        status={user.subscriptionStatus}
        interval={user.subscriptionInterval}
        cancelAtPeriodEnd={user.cancelAtPeriodEnd}
      />
      <SettingsForm
        colors={AVATAR_COLORS}
        initial={{ displayName: user.displayName, bio: user.bio, dailyGoal: user.dailyGoal, timezone: user.timezone, avatarColor: user.avatarColor }}
      />
      <AccountSection email={user.email} emailReminders={user.emailReminders} />
    </div>
  );
}
