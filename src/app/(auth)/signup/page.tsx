import { AuthForm } from "@/components/auth-form";
import { Mascot } from "@/components/brand";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <Mascot mood="cheer" size={110} className="mx-auto mb-4" bob />
      <h1 className="text-center text-3xl font-black">Create your profile</h1>
      <p className="mt-2 mb-6 text-center font-semibold text-muted">Start your first streak in under a minute.</p>
      <AuthForm mode="signup" />
    </>
  );
}
