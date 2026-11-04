import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/auth";
import { baseUrlForPage, displayHost } from "@/lib/baseUrl";
import { isSignupOpen } from "@/lib/signupGate";
import SignupForm from "./signup-form";

export const metadata = { title: "Create your account · Pour Tags" };

export default async function SignupPage() {
  // Someone already logged in who opens /signup goes to their dashboard.
  if (await getCurrentBusiness()) redirect("/dashboard");

  if (!isSignupOpen()) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-lg font-medium mb-1">Sign-ups open soon</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Pour Tags isn&apos;t taking new accounts yet.
          </p>
          <Link href="/login" className="text-sm underline">
            Already have an account? Log in
          </Link>
        </div>
      </main>
    );
  }

  const host = displayHost(await baseUrlForPage());

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-lg font-medium mb-1">Create your Pour Tags account</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Your first month is free. After that it&apos;s $30 a month.
        </p>
        <SignupForm host={host} />
        <p className="text-sm text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
