"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, normalizeEmail } from "@/lib/auth";
import {
  clearFailedLogins,
  clientIp,
  isLoginBlocked,
  recordFailedLogin,
} from "@/lib/loginThrottle";

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const ip = await clientIp();

  // Checked before the password, so a locked-out guesser learns nothing
  // even if they happen to hit the right one.
  if (await isLoginBlocked(email, ip)) {
    redirect("/login?error=locked");
  }

  const business = await prisma.business.findUnique({ where: { email } });

  // Deliberately the same error for "no such email" and "wrong password" —
  // telling the two apart lets someone probe which emails have accounts.
  if (!business || !(await verifyPassword(password, business.passwordHash))) {
    await recordFailedLogin(email, ip);
    redirect("/login?error=1");
  }

  await clearFailedLogins(email);
  await createSession(business.id);
  redirect("/dashboard");
}
