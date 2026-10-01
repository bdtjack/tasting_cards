"use server";

import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { deleteReplacedImage } from "@/lib/blob";
import { getPriceLabels, getPrimaryProductType, inferProductType, isProductType } from "@/lib/fields";
import { readSubtype } from "@/lib/subtypes";
import { parseJsonField } from "@/lib/json";
import { LIMITS, cleanText, optionalText, optionalUrl } from "@/lib/validate";
import type { BusinessCategory, ProductStatus } from "@/lib/types";

// The only status changes the dashboard offers. Anything else (e.g. sending
// a published or archived product back to draft, which would turn its
// printed QR code into a "not found" page) is refused even if a request is
// hand-edited to ask for it.
const ALLOWED_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["PUBLISHED"],
};

// Loads a product but only if it belongs to the current logged-in
// business — this is the tenant-isolation check. Without it, someone
// could edit another business's product just by guessing its id in the
// URL. Also redirects to /login outright if there's no session at all.
async function getOwnedProduct(id: string) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.businessId !== business.id) {
    notFound();
  }
  return { business, product };
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id"));
  const { business, product } = await getOwnedProduct(id); // ownership check
  const backToForm = `/dashboard/products/${id}/edit`;

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) redirect(`${backToForm}?error=name`);

  const photoUrl = optionalUrl(formData.get("photoUrl"));
  if (photoUrl === false) redirect(`${backToForm}?error=photo`);

  // Price labels come from what was snapshotted on the product at creation,
  // never from the submitted form.
  const priceLabelList: string[] =
    parseJsonField<string[] | null>(product.priceLabels, null) ??
    getPriceLabels(
      isProductType(product.productType)
        ? product.productType
        : getPrimaryProductType(business.category as BusinessCategory) ?? "SPIRIT"
    );
  const priceValues: Record<string, string> = {};
  for (const label of priceLabelList) {
    const value = cleanText(formData.get(`price_${label}`), LIMITS.price);
    if (value) priceValues[label] = value;
  }

  // Products from before types were stored get one saved now, worked out
  // the same way the menu does, so they stop relying on guesswork.
  const productType = inferProductType(product, business.category as BusinessCategory);

  await prisma.product.update({
    where: { id },
    data: {
      name,
      productType: product.productType ?? productType,
      subtype: productType ? readSubtype(formData, productType) : product.subtype,
      category: cleanText(formData.get("category"), LIMITS.category),
      subtitle: optionalText(formData.get("subtitle"), LIMITS.subtitle),
      proofAbv: optionalText(formData.get("proofAbv"), LIMITS.proofAbv),
      showAbv: formData.get("showAbv") === "on",
      photoUrl,
      description: optionalText(formData.get("description"), LIMITS.description),
      aroma: optionalText(formData.get("aroma"), LIMITS.note),
      palate: optionalText(formData.get("palate"), LIMITS.note),
      finish: optionalText(formData.get("finish"), LIMITS.note),
      priceLabels: JSON.stringify(priceLabelList),
      prices: JSON.stringify(priceValues),
    },
  });

  // Clean up the old photo if it was replaced or removed — after the
  // response, so saving isn't slowed down.
  after(() => deleteReplacedImage(product.photoUrl, photoUrl, business.slug));

  redirect("/dashboard");
}

export async function setProductStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const { product } = await getOwnedProduct(id); // ownership check

  const allowed = ALLOWED_TRANSITIONS[product.status as ProductStatus] ?? [];
  if (!(allowed as string[]).includes(status)) redirect(`/dashboard/products/${id}/edit`);

  await prisma.product.update({ where: { id }, data: { status } });

  redirect("/dashboard");
}
