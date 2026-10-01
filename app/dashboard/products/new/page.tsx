import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PRODUCT_TYPE_LABELS,
  defaultShowAbv,
  getAllowedProductTypes,
  getPriceLabels,
  resolveProductType,
} from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import { uploadFolderFor } from "@/lib/blob";
import ImageUpload from "@/components/ImageUpload";
import CountedTextarea from "@/components/CountedTextarea";
import FormError, { NOT_BLANK } from "@/components/FormError";
import { LIMITS } from "@/lib/validate";
import { PRODUCT_ERROR_MESSAGES } from "@/lib/formErrors";
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
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const { type: requestedType, error } = await searchParams;
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

      <FormError code={error} messages={PRODUCT_ERROR_MESSAGES} />

      <form action={createProduct} className="space-y-4">
        <input type="hidden" name="productType" value={productType} />
        <Field label="Product name">
          <input name="name" maxLength={LIMITS.name} required {...NOT_BLANK} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input name="category" maxLength={LIMITS.category} className="input" />
          </Field>
          <Field label="Subtitle">
            <input name="subtitle" maxLength={LIMITS.subtitle} className="input" />
          </Field>
        </div>

        <div>
          <Field label="Proof / ABV (leave blank if not applicable)">
            <input name="proofAbv" maxLength={LIMITS.proofAbv} className="input" />
          </Field>
          <label className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
            <input type="checkbox" name="showAbv" defaultChecked={defaultShowAbv(productType)} />
            Show proof / ABV on the guest card
          </label>
        </div>

        <ImageUpload
          name="photoUrl"
          label="Photo (optional)"
          folder={uploadFolderFor(business.slug)}
          initialUrl={null}
          maxDimension={1200}
          help="A bottle, can or cocktail shot. JPG, PNG or WebP."
        />

        <Field label="Description (optional)">
          <CountedTextarea name="description" maxLength={LIMITS.description} rows={3} />
        </Field>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">
            Tasting notes
          </legend>
          <Field label="Aroma">
            <CountedTextarea name="aroma" maxLength={LIMITS.note} />
          </Field>
          <Field label="Palate">
            <CountedTextarea name="palate" maxLength={LIMITS.note} />
          </Field>
          <Field label="Finish">
            <CountedTextarea name="finish" maxLength={LIMITS.note} />
          </Field>
        </fieldset>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">Optional</legend>

          {/*
            Price fields depend on the product type (wine gets Glass/Bottle,
            spirit gets Oz/Bottle, beer gets Taste/Pour/Pack, cocktail gets a
            single Price). actions.ts re-derives the same list from the type
            rather than trusting anything the form sends.
          */}
          <div className={`grid gap-4 ${priceLabels.length > 1 ? "grid-cols-2" : ""}`}>
            {priceLabels.map((label) => (
              <Field key={label} label={label}>
                <input name={`price_${label}`} maxLength={LIMITS.price} className="input" />
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
