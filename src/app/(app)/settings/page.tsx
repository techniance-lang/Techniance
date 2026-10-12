import { SettingsForm } from "@/components/settings-form";
import { AVATAR_COLORS, requireUser } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8 pb-12">
      <h1 className="mb-6 text-3xl font-black">Settings</h1>
      <SettingsForm
        colors={AVATAR_COLORS}
        initial={{ displayName: user.displayName, bio: user.bio, dailyGoal: user.dailyGoal, timezone: user.timezone, avatarColor: user.avatarColor }}
      />
    </div>
  );
}
