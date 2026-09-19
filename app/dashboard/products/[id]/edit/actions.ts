"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";

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
  return product;
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id"));
  await getOwnedProduct(id); // ownership check

  const priceLabelList: string[] = JSON.parse(String(formData.get("priceLabels") ?? "[]"));
  const priceValues: Record<string, string> = {};
  for (const label of priceLabelList) {
    const value = String(formData.get(`price_${label}`) ?? "").trim();
    if (value) priceValues[label] = value;
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      category: String(formData.get("category") ?? ""),
      subtitle: String(formData.get("subtitle") ?? "") || null,
      proofAbv: String(formData.get("proofAbv") ?? "") || null,
      aroma: String(formData.get("aroma") ?? "") || null,
      palate: String(formData.get("palate") ?? "") || null,
      finish: String(formData.get("finish") ?? "") || null,
      priceLabels: JSON.stringify(priceLabelList),
      prices: JSON.stringify(priceValues),
      mailingListLink: String(formData.get("mailingListLink") ?? "") || null,
    },
  });

  redirect("/dashboard");
}

export async function setProductStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await getOwnedProduct(id); // ownership check

  await prisma.product.update({ where: { id }, data: { status } });

  redirect("/dashboard");
}
