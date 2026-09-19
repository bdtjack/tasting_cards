"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const business = await prisma.business.findUnique({ where: { email } });

  // Deliberately the same error for "no such email" and "wrong password" —
  // telling the two apart lets someone probe which emails have accounts.
  if (!business || !(await verifyPassword(password, business.passwordHash))) {
    redirect("/login?error=1");
  }

  await createSession(business.id);
  redirect("/dashboard");
}
