"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness, verifyPassword, hashPassword } from "@/lib/auth";
import { MAX_SHARE_PHRASE_LENGTH } from "@/lib/shareCaption";
import { LIMITS, cleanText, isBusinessCategory, isHexColor, optionalText, optionalUrl } from "@/lib/validate";

export async function updateBusinessTheme(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) redirect("/dashboard/settings?error=name");

  const category = String(formData.get("category") ?? business.category);
  if (!isBusinessCategory(category)) redirect("/dashboard/settings?error=category");

  const primaryColor = cleanText(formData.get("primaryColor"), 7) || business.primaryColor;
  const accentColor = cleanText(formData.get("accentColor"), 7) || business.accentColor;
  if (!isHexColor(primaryColor) || !isHexColor(accentColor)) {
    redirect("/dashboard/settings?error=color");
  }

  const logoUrl = optionalUrl(formData.get("logoUrl"));
  if (logoUrl === false) redirect("/dashboard/settings?error=logoUrl");

  const mailingListLink = optionalUrl(formData.get("mailingListLink"));
  if (mailingListLink === false) redirect("/dashboard/settings?error=mailingListLink");

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name,
      category,
      logoUrl,
      primaryColor,
      accentColor,
      mailingListLink,
      sharePhrase: optionalText(formData.get("sharePhrase"), MAX_SHARE_PHRASE_LENGTH),
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
