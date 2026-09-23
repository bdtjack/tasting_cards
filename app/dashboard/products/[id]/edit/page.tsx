import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPriceLabels } from "@/lib/fields";
import { parseJsonField } from "@/lib/json";
import { getCurrentBusiness } from "@/lib/auth";
import type { BusinessCategory } from "@/lib/types";
import { updateProduct, setProductStatus } from "./actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const product = await prisma.product.findUnique({ where: { id } });

  // Tenant isolation: a product that doesn't exist, or belongs to a
  // different business, behaves identically to a 404 — never reveal which.
  if (!product || product.businessId !== business.id) {
    notFound();
  }

  // Products created before pricing was per-category may not have a
  // stored snapshot yet — fall back to deriving it fresh in that case.
  const priceLabels: string[] =
    parseJsonField<string[] | null>(product.priceLabels, null) ??
    getPriceLabels(business.category as BusinessCategory);
  const prices = parseJsonField<Record<string, string>>(product.prices, {});

  return (
    <main className="max-w-lg mx-auto p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-lg font-medium">Edit product</h1>
        <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600">
          {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
        </span>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        The QR code for this product stays the same no matter what you change here.
      </p>

      <form action={updateProduct} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />

        <Field label="Product name">
          <input name="name" required defaultValue={product.name} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input name="category" defaultValue={product.category} className="input" />
          </Field>
          <Field label="Subtitle">
            <input name="subtitle" defaultValue={product.subtitle ?? ""} className="input" />
          </Field>
        </div>

        <Field label="Proof / ABV (leave blank if not applicable)">
          <input name="proofAbv" defaultValue={product.proofAbv ?? ""} className="input" />
        </Field>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">
            Tasting notes
          </legend>
          <Field label="Aroma">
            <textarea name="aroma" rows={2} defaultValue={product.aroma ?? ""} className="input" />
          </Field>
          <Field label="Palate">
            <textarea name="palate" rows={2} defaultValue={product.palate ?? ""} className="input" />
          </Field>
          <Field label="Finish">
            <textarea name="finish" rows={2} defaultValue={product.finish ?? ""} className="input" />
          </Field>
        </fieldset>

        <fieldset className="border-t border-neutral-200 pt-4 space-y-3">
          <legend className="text-sm font-medium text-neutral-600 mb-1">Optional</legend>

          <input type="hidden" name="priceLabels" value={JSON.stringify(priceLabels)} />
          <div className={`grid gap-4 ${priceLabels.length > 1 ? "grid-cols-2" : ""}`}>
            {priceLabels.map((label) => (
              <Field key={label} label={label}>
                <input
                  name={`price_${label}`}
                  defaultValue={prices[label] ?? ""}
                  className="input"
                  placeholder="$0.00"
                />
              </Field>
            ))}
          </div>

        </fieldset>

        <button type="submit" className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm">
          Save changes
        </button>
      </form>

      <div className="border-t border-neutral-200 mt-6 pt-6">
        <p className="text-sm font-medium text-neutral-600 mb-3">Status</p>
        <div className="flex gap-2">
          {product.status === "DRAFT" && (
            <StatusForm id={product.id} status="PUBLISHED" label="Publish" primary />
          )}
          {product.status === "PUBLISHED" && (
            <StatusForm id={product.id} status="ARCHIVED" label="Archive" />
          )}
          {product.status === "ARCHIVED" && (
            <StatusForm id={product.id} status="PUBLISHED" label="Restore to published" primary />
          )}
        </div>
      </div>

      {product.status !== "DRAFT" && (
        <div className="border-t border-neutral-200 mt-6 pt-6">
          <p className="text-sm font-medium text-neutral-600 mb-1">QR code</p>
          <p className="text-xs text-neutral-500 mb-3">
            This stays the same even if you edit the product's details later.
          </p>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${business.slug}/${product.slug}`}
              alt="QR code"
              className="w-28 h-28 border border-neutral-200 rounded-md bg-white p-2"
            />
            <div className="flex flex-col gap-2">
              <a
                href={`/api/qr/${business.slug}/${product.slug}`}
                download
                className="text-sm px-3 py-1.5 border border-neutral-300 rounded-md text-center"
              >
                Download PNG
              </a>
              <a
                href={`/${business.slug}/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-500 text-center"
              >
                View guest card
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusForm({
  id,
  status,
  label,
  primary,
}: {
  id: string;
  status: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <form action={setProductStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={
          primary
            ? "px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
            : "px-4 py-2 border border-neutral-300 rounded-md text-sm"
        }
      >
        {label}
      </button>
    </form>
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
