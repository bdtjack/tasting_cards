"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPriceLabels, resolveProductType } from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import { createWithFreshSlug, uniqueProductSlug } from "@/lib/uniqueSlug";
import { LIMITS, cleanText, optionalText, optionalUrl } from "@/lib/validate";
import type { BusinessCategory } from "@/lib/types";

export async function createProduct(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const productType = resolveProductType(
    business.category as BusinessCategory,
    formData.get("productType")
  );
  // Missing or not allowed for this business: back to the type chooser.
  if (!productType) redirect("/dashboard/products/new");

  const backToForm = `/dashboard/products/new?type=${productType}`;

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) redirect(`${backToForm}&error=name`);

  const photoUrl = optionalUrl(formData.get("photoUrl"));
  if (photoUrl === false) redirect(`${backToForm}&error=photo`);

  const publish = formData.get("intent") === "publish";

  // Derived server-side from the type rather than trusting anything
  // submitted, so the form can't be tampered with to save arbitrary labels.
  const priceLabelList = getPriceLabels(productType);
  const priceValues: Record<string, string> = {};
  for (const label of priceLabelList) {
    const value = cleanText(formData.get(`price_${label}`), LIMITS.price);
    if (value) priceValues[label] = value;
  }

  await createWithFreshSlug(
    () => uniqueProductSlug(business.id, name),
    (slug) =>
      prisma.product.create({
        data: {
          businessId: business.id,
          slug,
          name,
          category: cleanText(formData.get("category"), LIMITS.category),
          subtitle: optionalText(formData.get("subtitle"), LIMITS.subtitle),
          productType,
          photoUrl,
          description: optionalText(formData.get("description"), LIMITS.description),
          // The checkbox starts ticked or not based on the product type
          // (wine off; beer, spirits and cocktails on), and the business can
          // override it per product. Saved on the product, so changing the
          // business's category later never changes existing cards.
          showAbv: formData.get("showAbv") === "on",
          proofAbv: optionalText(formData.get("proofAbv"), LIMITS.proofAbv),
          aroma: optionalText(formData.get("aroma"), LIMITS.note),
          palate: optionalText(formData.get("palate"), LIMITS.note),
          finish: optionalText(formData.get("finish"), LIMITS.note),
          priceLabels: JSON.stringify(priceLabelList),
          prices: JSON.stringify(priceValues),
          status: publish ? "PUBLISHED" : "DRAFT",
        },
      })
  );

  redirect("/dashboard");
}
