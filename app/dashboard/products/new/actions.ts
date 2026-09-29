"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { defaultShowAbv, getPriceLabels, resolveProductType } from "@/lib/fields";
import { getCurrentBusiness } from "@/lib/auth";
import { productSlugify } from "@/lib/slug";
import type { BusinessCategory } from "@/lib/types";

export async function createProduct(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
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
    const value = String(formData.get(`price_${label}`) ?? "").trim();
    if (value) priceValues[label] = value;
  }

  await prisma.product.create({
    data: {
      businessId: business.id,
      slug: productSlugify(name),
      name,
      category: String(formData.get("category") ?? ""),
      subtitle: String(formData.get("subtitle") ?? "") || null,
      productType,
      description: String(formData.get("description") ?? "").trim() || null,
      // Locked in now, from the product type at this moment —
      // does not get re-derived later if the business's category changes.
      showAbv: defaultShowAbv(productType),
      proofAbv: String(formData.get("proofAbv") ?? "") || null,
      aroma: String(formData.get("aroma") ?? "") || null,
      palate: String(formData.get("palate") ?? "") || null,
      finish: String(formData.get("finish") ?? "") || null,
      priceLabels: JSON.stringify(priceLabelList),
      prices: JSON.stringify(priceValues),
      status: publish ? "PUBLISHED" : "DRAFT",
    },
  });

  redirect("/dashboard");
}
