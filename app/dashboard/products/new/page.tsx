import { redirect } from "next/navigation";
import { getPriceLabels } from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import type { BusinessCategory } from "@/lib/types";
import { createProduct } from "./actions";

export default async function NewProductPage() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const priceLabels = getPriceLabels(business.category as BusinessCategory);

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-lg font-medium mb-1">Add product</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Fields shown to guests on the tasting card.
      </p>

      <form action={createProduct} className="space-y-4">
        <Field label="Product name">
          <input name="name" required className="input" placeholder="Pinto" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input name="category" className="input" placeholder="Pinot noir" />
          </Field>
          <Field label="Subtitle">
            <input name="subtitle" className="input" placeholder="2022 vintage" />
          </Field>
        </div>

        {/*
          The proof/ABV field is intentionally always rendered here — the
          business-level default (hidden for wineries) is applied server-side
          in actions.ts, not by conditionally hiding this input. A future
          per-product override control would live here.
        */}
        <Field label="Proof / ABV (leave blank if not applicable)">
          <input name="proofAbv" className="input" placeholder="108 proof · 54% alc/vol" />
        </Field>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">
            Tasting notes
          </legend>
          <Field label="Aroma">
            <textarea name="aroma" rows={2} className="input" />
          </Field>
          <Field label="Palate">
            <textarea name="palate" rows={2} className="input" />
          </Field>
          <Field label="Finish">
            <textarea name="finish" rows={2} className="input" />
          </Field>
        </fieldset>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">Optional</legend>

          {/*
            Price fields are driven by the business's category (winery gets
            Glass/Bottle, distillery gets Oz/Bottle, brewery gets
            Taste/Pour/Pack). The label itself is submitted alongside each
            value so actions.ts can build the {label: value} map without
            needing to re-derive it — see the hidden input below.
          */}
          <input type="hidden" name="priceLabels" value={JSON.stringify(priceLabels)} />
          <div className={`grid gap-4 ${priceLabels.length > 1 ? "grid-cols-2" : ""}`}>
            {priceLabels.map((label) => (
              <Field key={label} label={label}>
                <input name={`price_${label}`} className="input" placeholder="$0.00" />
              </Field>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2 pt-2">
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
