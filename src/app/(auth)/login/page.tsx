import { AuthForm } from "@/components/auth-form";
import { Mascot } from "@/components/brand";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <Mascot mood="wave" size={110} className="mx-auto mb-4" bob />
      <h1 className="mb-6 text-center text-3xl font-black">Welcome back</h1>
      <AuthForm mode="login" />
    </>
  );
}
