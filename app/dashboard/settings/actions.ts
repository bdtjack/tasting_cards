"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness, verifyPassword, hashPassword } from "@/lib/auth";

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
      mailingListLink: String(formData.get("mailingListLink") ?? "").trim() || null,
    },
  });

  redirect("/dashboard/settings?saved=1");
}

export async function changePassword(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const currentIsCorrect = await verifyPassword(currentPassword, business.passwordHash);
  if (!currentIsCorrect) {
    redirect("/dashboard/settings?pwError=current");
  }

  if (newPassword.length < 8) {
    redirect("/dashboard/settings?pwError=short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/dashboard/settings?pwError=mismatch");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.business.update({
    where: { id: business.id },
    data: { passwordHash },
  });

  redirect("/dashboard/settings?pwSaved=1");
}
