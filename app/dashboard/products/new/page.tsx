import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PRODUCT_TYPE_LABELS,
  getAllowedProductTypes,
  getPriceLabels,
  resolveProductType,
} from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import { LIMITS } from "@/lib/validate";
import type { BusinessCategory } from "@/lib/types";
import { createProduct } from "./actions";

const TYPE_BLURBS = {
  WINE: "Priced by the glass and bottle",
  BEER: "Priced by taste, pour and pack",
  SPIRIT: "Priced by the ounce and bottle",
  COCKTAIL: "Mixed drinks, with a single price",
} as const;

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const { type: requestedType } = await searchParams;
  const productType = resolveProductType(business.category as BusinessCategory, requestedType);

  // Every business can add more than one kind of drink (at least its own
  // plus cocktails), so ask what they're adding before showing the form —
  // the price fields depend on the answer.
  if (!productType) {
    return (
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-lg font-medium mb-1">Add product</h1>
        <p className="text-sm text-neutral-500 mb-6">What are you adding?</p>
        <div className="space-y-3">
          {getAllowedProductTypes(business.category as BusinessCategory).map((type) => (
            <Link
              key={type}
              href={`/dashboard/products/new?type=${type}`}
              className="block border border-neutral-300 rounded-md px-4 py-3 hover:border-neutral-900"
            >
              <span className="block text-sm font-medium">{PRODUCT_TYPE_LABELS[type]}</span>
              <span className="block text-xs text-neutral-500">{TYPE_BLURBS[type]}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="inline-block mt-6 text-sm text-neutral-600 underline"
        >
          Cancel
        </Link>
      </main>
    );
  }

  const priceLabels = getPriceLabels(productType);

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-lg font-medium mb-1">
        Add {PRODUCT_TYPE_LABELS[productType].toLowerCase()}
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        Fields shown to guests on the tasting card.
      </p>

      <form action={createProduct} className="space-y-4">
        <input type="hidden" name="productType" value={productType} />
        <Field label="Product name">
          <input name="name" maxLength={LIMITS.name} required className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input name="category" maxLength={LIMITS.category} className="input" />
          </Field>
          <Field label="Subtitle">
            <input name="subtitle" maxLength={LIMITS.subtitle} className="input" />
          </Field>
        </div>

        {/*
          The proof/ABV field is intentionally always rendered here — the
          business-level default (hidden for wineries) is applied server-side
          in actions.ts, not by conditionally hiding this input. A future
          per-product override control would live here.
        */}
        <Field label="Proof / ABV (leave blank if not applicable)">
          <input name="proofAbv" maxLength={LIMITS.proofAbv} className="input" />
        </Field>

        <Field label="Description (optional)">
          <textarea
            name="description" maxLength={LIMITS.description}
            rows={3}
            className="input"
          />
        </Field>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">
            Tasting notes
          </legend>
          <Field label="Aroma">
            <textarea name="aroma" maxLength={LIMITS.note} rows={2} className="input" />
          </Field>
          <Field label="Palate">
            <textarea name="palate" maxLength={LIMITS.note} rows={2} className="input" />
          </Field>
          <Field label="Finish">
            <textarea name="finish" maxLength={LIMITS.note} rows={2} className="input" />
          </Field>
        </fieldset>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">Optional</legend>

          {/*
            Price fields are driven by the product type (wine gets
            Glass/Bottle, spirit gets Oz/Bottle, beer gets
            Taste/Pour/Pack, cocktail gets a single Price — the owner picks the type first). The label itself is submitted alongside each
            value so actions.ts can build the {label: value} map without
            needing to re-derive it — see the hidden input below.
          */}
          <input type="hidden" name="priceLabels" value={JSON.stringify(priceLabels)} />
          <div className={`grid gap-4 ${priceLabels.length > 1 ? "grid-cols-2" : ""}`}>
            {priceLabels.map((label) => (
              <Field key={label} label={label}>
                <input name={`price_${label}`}
                  maxLength={LIMITS.price} className="input" />
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-neutral-300 rounded-md text-sm text-center text-neutral-600"
          >
            Cancel
          </Link>
          <button
            type="submit"
            name="intent"
            value="draft"
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-sm"
          >
            Save draft
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
          >
            Publish
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-neutral-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
