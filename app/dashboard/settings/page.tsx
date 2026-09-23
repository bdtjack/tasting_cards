import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/auth";
import ThemeForm from "./theme-form";
import { changePassword } from "./actions";

const PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  current: "That current password is incorrect.",
  short: "New password must be at least 8 characters.",
  mismatch: "New password and confirmation don't match.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; pwSaved?: string; pwError?: string }>;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const { saved, pwSaved, pwError } = await searchParams;

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

      <div className="border-t border-neutral-200 mt-10 pt-6 max-w-sm">
        <p className="text-sm font-medium text-neutral-600 mb-1">Password</p>
        <p className="text-xs text-neutral-500 mb-4">
          Login email: {business.email}
        </p>

        {pwSaved && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-4">
            Password updated.
          </p>
        )}
        {pwError && PASSWORD_ERROR_MESSAGES[pwError] && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {PASSWORD_ERROR_MESSAGES[pwError]}
          </p>
        )}

        <form action={changePassword} className="space-y-3">
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Current password
            </span>
            <input
              type="password"
              name="currentPassword"
              required
              className="input"
              autoComplete="current-password"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">New password</span>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="input"
              autoComplete="new-password"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Confirm new password
            </span>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="input"
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
          >
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
