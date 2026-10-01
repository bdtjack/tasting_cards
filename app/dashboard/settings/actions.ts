"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness, verifyPassword, hashPassword, revokeOtherSessions } from "@/lib/auth";
import { deleteReplacedImage } from "@/lib/blob";
import { isCardFontId } from "@/lib/fontOptions";
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

  // An unknown value (hand-edited form, or a font that's since been
  // removed from the list) just keeps the current choice.
  const requestedFont = formData.get("cardFont");
  const cardFont = isCardFontId(requestedFont) ? requestedFont : business.cardFont;

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
      cardFont,
      mailingListLink,
      sharePhrase: optionalText(formData.get("sharePhrase"), MAX_SHARE_PHRASE_LENGTH),
    },
  });

  // Clean up the old logo if it was replaced or removed — after the
  // response, so saving isn't slowed down.
  after(() => deleteReplacedImage(business.logoUrl, logoUrl, business.slug));

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

  // Anyone else logged in with the old password (another device, or
  // someone who shouldn't have had it) is signed out. This browser stays in.
  await revokeOtherSessions(business.id);

  redirect("/dashboard/settings?pwSaved=1");
}
