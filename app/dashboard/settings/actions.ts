"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";

export async function updateBusinessTheme(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Business name is required");

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name,
      category: String(formData.get("category") ?? business.category),
      logoUrl: String(formData.get("logoUrl") ?? "").trim() || null,
      primaryColor: String(formData.get("primaryColor") ?? business.primaryColor),
      accentColor: String(formData.get("accentColor") ?? business.accentColor),
    },
  });

  redirect("/dashboard/settings?saved=1");
}
