import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { createFlight } from "./actions";

export default async function NewFlightPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const products = await prisma.product.findMany({
    where: { businessId: business.id, status: "PUBLISHED" },
    orderBy: { name: "asc" },
  });

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-lg font-medium mb-1">Create flight</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Pick a few products to group into one tasting, with its own QR code.
      </p>

      <form action={createFlight} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Flight name</span>
          <input name="name" required className="input" placeholder="Reserve Flight" />
        </label>

        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">
            Description (optional)
          </span>
          <textarea
            name="description"
            rows={2}
            className="input"
            placeholder="Our four boldest reds, poured together."
          />
        </label>

        <div className="border-t border-neutral-200 pt-4">
          <p className="text-sm font-medium text-neutral-600 mb-1">Products</p>
          {products.length === 0 ? (
            <p className="text-sm text-neutral-500">
              You don&apos;t have any published products yet — publish at least
              one before creating a flight.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 mb-3">
              Only published products can be added to a flight.
            </p>
          )}
          <div className="space-y-2">
            {products.map((product: (typeof products)[number]) => (
              <label
                key={product.id}
                className="flex items-center gap-2.5 text-sm border border-neutral-200 rounded-md px-3 py-2"
              >
                <input type="checkbox" name="productIds" value={product.id} />
                <span>{product.name}</span>
                <span className="text-neutral-400 text-xs">{product.category}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
        >
          Create flight
        </button>
      </form>
    </main>
  );
}
