import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-center text-3xl font-black">Create your profile</h1>
      <p className="mt-2 mb-6 text-center font-semibold text-muted">Start your first streak in under a minute.</p>
      <AuthForm mode="signup" />
    </>
  );
}
