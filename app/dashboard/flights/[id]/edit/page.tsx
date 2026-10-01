import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { baseUrlForPage, displayHost } from "@/lib/baseUrl";
import { MAX_SELECTIONS, MIN_SELECTIONS } from "@/lib/types";
import { updateFlight, deleteFlight } from "./actions";
import { LIMITS } from "@/lib/validate";
import { FLIGHT_ERROR_MESSAGES } from "@/lib/formErrors";
import FlightProductPicker from "@/components/FlightProductPicker";
import { PICKER_PRODUCT_SELECT, toPickerProducts } from "@/lib/menuGroups";
import type { BusinessCategory } from "@/lib/types";
import ConfirmDeleteForm from "@/components/ConfirmDeleteForm";
import FormError, { NOT_BLANK } from "@/components/FormError";


export default async function EditFlightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const flight = await prisma.flight.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!flight || flight.businessId !== business.id) {
    notFound();
  }

  const selectedProductIds = flight.items.map((item) => item.productId);

  // Everything published, plus anything already in this flight that has
  // since been archived — so saving never silently drops it.
  const products = await prisma.product.findMany({
    where: {
      businessId: business.id,
      OR: [{ status: "PUBLISHED" }, { id: { in: selectedProductIds }, status: "ARCHIVED" }],
    },
    orderBy: { name: "asc" },
    select: PICKER_PRODUCT_SELECT,
  });
  // Grouped like the guest menu (Wine → Red / White …) so it's easy to see
  // what's available while building the flight.
  const pickerProducts = toPickerProducts(products, business.category as BusinessCategory);

  const isBuildYourOwn = flight.kind === "BUILD_YOUR_OWN";
  const guestPath = `/${business.slug}/flights/${flight.slug}`;
  const qrTarget = `${displayHost(await baseUrlForPage())}${guestPath}`;

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-lg font-medium mb-1">
        {isBuildYourOwn ? "Edit build-your-own flight" : "Edit flight"}
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        {isBuildYourOwn
          ? "The QR code below stays the same even if you change the number of selections, price, or description later."
          : "The QR code below stays the same even if you change the products or description later."}
      </p>

      {isBuildYourOwn && (
        <div className="mb-6 border border-neutral-200 rounded-md bg-white px-4 py-3">
          <p className="text-xs text-neutral-500">Times guests have built this flight</p>
          <p className="text-2xl font-medium">{flight.completedCount}</p>
        </div>
      )}

      <FormError code={error} messages={FLIGHT_ERROR_MESSAGES} />

      <form action={updateFlight} className="space-y-4">
        <input type="hidden" name="id" value={flight.id} />

        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Flight name</span>
          <input
            name="name"
            maxLength={LIMITS.name}
            required
            {...NOT_BLANK}
            defaultValue={flight.name}
            className="input"
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
            defaultValue={flight.description ?? ""}
            className="input"
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
                defaultValue={flight.selectionCount ?? 4}
                className="input"
              />
            </label>
          )}
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Flight price (optional)
            </span>
            <input
              name="price"
              maxLength={LIMITS.price}
              defaultValue={flight.price ?? ""}
              className="input"
              placeholder="$0.00"
            />
          </label>
        </div>

        {isBuildYourOwn ? (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-600 mb-1">Products</p>
            <p className="text-xs text-neutral-500">
              Guests can choose from all{" "}
              {products.filter((product) => product.status === "PUBLISHED").length} of your
              published products at every step, and can pick the same one more than once.
            </p>
          </div>
        ) : (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-600 mb-3">Products</p>
            <FlightProductPicker products={pickerProducts} initialSelectedIds={selectedProductIds} />
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
            Save changes
          </button>
        </div>
      </form>

      <div className="border-t border-neutral-200 mt-6 pt-6">
        <p className="text-sm font-medium text-neutral-600 mb-1">QR code</p>
        <p className="text-xs text-neutral-500 mb-3 break-all">Points to {qrTarget}</p>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/flight/${business.slug}/${flight.slug}`}
            alt="QR code"
            className="w-28 h-28 border border-neutral-200 rounded-md bg-white p-2"
          />
          <div className="flex flex-col gap-2">
            <a
              href={`/api/qr/flight/${business.slug}/${flight.slug}`}
              download
              className="text-sm px-3 py-1.5 border border-neutral-300 rounded-md text-center"
            >
              Download PNG
            </a>
            <a
              href={guestPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-500 text-center"
            >
              View flight page
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 mt-6 pt-6">
        <ConfirmDeleteForm
          action={deleteFlight}
          id={flight.id}
          label="Delete flight"
          warning={`Delete "${flight.name}"? This can't be undone, and any printed QR code for this flight will stop working.`}
        />
      </div>
    </main>
  );
}
