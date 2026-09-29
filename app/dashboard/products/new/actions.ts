"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { defaultShowAbv, getPriceLabels, resolveProductType } from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import { uniqueProductSlug } from "@/lib/uniqueSlug";
import { LIMITS, cleanText, optionalText } from "@/lib/validate";
import type { BusinessCategory } from "@/lib/types";

export async function createProduct(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) throw new Error("Product name is required");

  const publish = formData.get("intent") === "publish";

  const productType = resolveProductType(
    business.category as BusinessCategory,
    formData.get("productType")
  );
  if (!productType) throw new Error("Product type is required");

  // Derived server-side from the type rather than trusting the submitted
  // labels, so the form can't be tampered with to save arbitrary labels.
  const priceLabelList = getPriceLabels(productType);
  const priceValues: Record<string, string> = {};
  for (const label of priceLabelList) {
    const value = cleanText(formData.get(`price_${label}`), LIMITS.price);
    if (value) priceValues[label] = value;
  }

  await prisma.product.create({
    data: {
      businessId: business.id,
      slug: await uniqueProductSlug(business.id, name),
      name,
      category: cleanText(formData.get("category"), LIMITS.category),
      subtitle: optionalText(formData.get("subtitle"), LIMITS.subtitle),
      productType,
      description: optionalText(formData.get("description"), LIMITS.description),
      // Locked in now, from the product type at this moment —
      // does not get re-derived later if the business's category changes.
      showAbv: defaultShowAbv(productType),
      proofAbv: optionalText(formData.get("proofAbv"), LIMITS.proofAbv),
      aroma: optionalText(formData.get("aroma"), LIMITS.note),
      palate: optionalText(formData.get("palate"), LIMITS.note),
      finish: optionalText(formData.get("finish"), LIMITS.note),
      priceLabels: JSON.stringify(priceLabelList),
      prices: JSON.stringify(priceValues),
      status: publish ? "PUBLISHED" : "DRAFT",
    },
  });

  redirect("/dashboard");
}
