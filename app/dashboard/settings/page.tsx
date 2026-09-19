import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/auth";
import ThemeForm from "./theme-form";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const { saved } = await searchParams;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium">Business profile and theme</h1>
        <Link href="/dashboard" className="text-sm text-neutral-500">
          Back to dashboard
        </Link>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        This applies to every guest-facing card you publish.
      </p>

      {saved && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
          Saved.
        </p>
      )}

      <div className="mb-6 text-sm text-neutral-500">
        Card URL:{" "}
        <span className="text-neutral-700">yourdomain.com/{business.slug}/...</span>
        <span className="block text-xs text-neutral-400 mt-0.5">
          This is baked into every QR code you&apos;ve printed, so it can&apos;t be
          changed here.
        </span>
      </div>

      <ThemeForm
        business={{
          name: business.name,
          category: business.category,
          logoUrl: business.logoUrl,
          primaryColor: business.primaryColor,
          accentColor: business.accentColor,
        }}
      />
    </main>
  );
}
