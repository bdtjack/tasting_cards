"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { getPriceLabels, getPrimaryProductType, isProductType } from "@/lib/fields";
import { parseJsonField } from "@/lib/json";
import { LIMITS, cleanText, optionalText, optionalUrl } from "@/lib/validate";
import type { BusinessCategory, ProductStatus } from "@/lib/types";

const STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

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

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) throw new Error("Product name is required");

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

  const photoUrl = optionalUrl(formData.get("photoUrl"));
  if (photoUrl === false) throw new Error("Photo link is not a valid web address");

  await prisma.product.update({
    where: { id },
    data: {
      name,
      category: cleanText(formData.get("category"), LIMITS.category),
      subtitle: optionalText(formData.get("subtitle"), LIMITS.subtitle),
      proofAbv: optionalText(formData.get("proofAbv"), LIMITS.proofAbv),
      photoUrl,
      description: optionalText(formData.get("description"), LIMITS.description),
      aroma: optionalText(formData.get("aroma"), LIMITS.note),
      palate: optionalText(formData.get("palate"), LIMITS.note),
      finish: optionalText(formData.get("finish"), LIMITS.note),
      priceLabels: JSON.stringify(priceLabelList),
      prices: JSON.stringify(priceValues),
    },
  });

  redirect("/dashboard");
}

export async function setProductStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await getOwnedProduct(id); // ownership check

  if (!(STATUSES as string[]).includes(status)) throw new Error("Invalid status");

  await prisma.product.update({ where: { id }, data: { status } });

  redirect("/dashboard");
}
