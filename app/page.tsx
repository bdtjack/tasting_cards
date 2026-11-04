import Link from "next/link";
import { isSignupOpen } from "@/lib/signupGate";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-xl font-medium">Pour Tags</h1>
      <Link href="/dashboard" className="text-sm underline">
        Go to dashboard
      </Link>
      {isSignupOpen() && (
        <Link href="/signup" className="text-sm underline">
          Create an account
        </Link>
      )}
    </main>
  );
}
