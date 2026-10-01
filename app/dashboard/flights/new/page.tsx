import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { MAX_SELECTIONS, MIN_SELECTIONS } from "@/lib/types";
import { createFlight, createBuildYourOwnFlight } from "./actions";
import { LIMITS } from "@/lib/validate";
import { FLIGHT_ERROR_MESSAGES } from "@/lib/formErrors";
import FlightProductPicker from "@/components/FlightProductPicker";
import { PICKER_PRODUCT_SELECT, toPickerProducts } from "@/lib/menuGroups";
import type { BusinessCategory } from "@/lib/types";
import FormError, { NOT_BLANK } from "@/components/FormError";


export default async function NewFlightPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const { type, error } = await searchParams;
  const isBuildYourOwn = type === "build-your-own";

  const products = await prisma.product.findMany({
    where: { businessId: business.id, status: "PUBLISHED" },
    orderBy: { name: "asc" },
    select: PICKER_PRODUCT_SELECT,
  });
  // Grouped like the guest menu (Wine → Red / White …) so it's easy to see
  // what's available while building the flight.
  const pickerProducts = toPickerProducts(products, business.category as BusinessCategory);

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-lg font-medium mb-1">
        {isBuildYourOwn ? "Create build-your-own flight" : "Create flight"}
      </h1>
      <p className="text-sm text-neutral-500 mb-4">
        {isBuildYourOwn
          ? "Guests scan the QR code and pick their own pours, one selection at a time, then save or share their finished flight card."
          : "Pick a few products to group into one tasting, with its own QR code."}
      </p>

      <div className="flex gap-1 p-1 mb-6 bg-neutral-200/60 rounded-md text-sm">
        <Link
          replace
          href="/dashboard/flights/new"
          className={`flex-1 text-center py-1.5 rounded ${
            !isBuildYourOwn ? "bg-white shadow-sm font-medium" : "text-neutral-500"
          }`}
        >
          Preset
        </Link>
        <Link
          replace
          href="/dashboard/flights/new?type=build-your-own"
          className={`flex-1 text-center py-1.5 rounded ${
            isBuildYourOwn ? "bg-white shadow-sm font-medium" : "text-neutral-500"
          }`}
        >
          Build your own
        </Link>
      </div>

      <FormError code={error} messages={FLIGHT_ERROR_MESSAGES} />

      <form
        action={isBuildYourOwn ? createBuildYourOwnFlight : createFlight}
        className="space-y-4"
      >
        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Flight name</span>
          <input
            name="name"
            maxLength={LIMITS.name}
            required
            {...NOT_BLANK}
            className="input"
            placeholder={isBuildYourOwn ? "Build Your Own Flight" : "Reserve Flight"}
          />
        </label>

        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">
            Description (optional)
          </span>
          <textarea
            name="description"
            maxLength={LIMITS.flightDescription}
            rows={2}
            className="input"
            placeholder={
              isBuildYourOwn
                ? "Pick any four pours from our list."
                : "Our four boldest reds, poured together."
            }
          />
        </label>

        <div className={`grid gap-4 ${isBuildYourOwn ? "grid-cols-2" : ""}`}>
          {isBuildYourOwn && (
            <label className="block">
              <span className="block text-sm text-neutral-600 mb-1">
                Number of selections
              </span>
              <input
                name="selectionCount"
                type="number"
                required
                min={MIN_SELECTIONS}
                max={MAX_SELECTIONS}
                defaultValue={4}
                className="input"
              />
            </label>
          )}
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Flight price (optional)
            </span>
            <input name="price" maxLength={LIMITS.price} className="input" placeholder="$0.00" />
          </label>
        </div>

        {isBuildYourOwn ? (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Products</p>
            <p className="text-xs text-neutral-500">
              Guests can choose from all {products.length} of your published
              products at every step, and can pick the same one more than
              once. Products you publish or archive later are picked up
              automatically.
            </p>
          </div>
        ) : (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Products</p>
            {products.length === 0 ? (
              <p className="text-sm text-neutral-500">
                You don&apos;t have any published products yet — publish at least
                one before creating a flight.
              </p>
            ) : (
              <FlightProductPicker products={pickerProducts} initialSelectedIds={[]} />
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href="/dashboard/flights"
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-center text-neutral-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
          >
            Create flight
          </button>
        </div>
      </form>
    </main>
  );
}
