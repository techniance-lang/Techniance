import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-center text-3xl font-black">Welcome back</h1>
      <AuthForm mode="login" />
    </>
  );
}
