import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-xl font-medium">Tasting Cards</h1>
      <Link href="/dashboard" className="text-sm underline">
        Go to dashboard
      </Link>
    </main>
  );
}
