import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-medium mb-1">Log in</h1>
        <p className="text-sm text-neutral-500 mb-6">Access your product dashboard.</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            Incorrect email or password.
          </p>
        )}

        <form action={login} className="space-y-4">
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">Email</span>
            <input name="email" type="email" required className="input" />
          </label>
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">Password</span>
            <input name="password" type="password" required className="input" />
          </label>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
          >
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}
