"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, normalizeEmail } from "@/lib/auth";
import { clientIp } from "@/lib/loginThrottle";
import { isSignupOpen } from "@/lib/signupGate";
import {
  PASSWORD_MIN_LENGTH,
  cleanBusinessSlug,
  isPlausibleEmail,
  localSlugProblem,
  type SlugStatus,
} from "@/lib/signupRules";
import { LIMITS, cleanText, isBusinessCategory } from "@/lib/validate";

// How many accounts one IP address can create per hour. Generous for a
// real person (or a few staff on the same tasting-room Wi-Fi), but stops a
// script from filling the database with junk businesses.
const SIGNUPS_PER_IP_PER_HOUR = 5;

export type SignupField = "name" | "slug" | "category" | "email" | "password" | "confirm" | "terms";
export type SignupState = { error?: string; field?: SignupField };

/**
 * Live check for the web-address box on the signup form. Business slugs
 * are already public (they're in every card URL), so answering "taken" for
 * one gives nothing away.
 */
export async function checkBusinessSlug(raw: string): Promise<SlugStatus> {
  if (!isSignupOpen()) return "invalid";
  const slug = cleanBusinessSlug(String(raw ?? ""));
  const problem = localSlugProblem(slug);
  if (problem) return problem;
  const existing = await prisma.business.findUnique({ where: { slug }, select: { id: true } });
  return existing ? "taken" : "available";
}

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  if (!isSignupOpen()) return { error: "Sign-ups aren't open yet." };

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) return { field: "name", error: "Enter your business name." };

  const slug = cleanBusinessSlug(String(formData.get("slug") ?? ""));
  const slugProblem = localSlugProblem(slug);
  if (slugProblem === "invalid") {
    return { field: "slug", error: "Your web address needs at least 2 letters or numbers." };
  }
  if (slugProblem === "reserved") {
    return { field: "slug", error: `"${slug}" is reserved by Pour Tags. Try another web address.` };
  }

  const category = String(formData.get("category") ?? "");
  if (!isBusinessCategory(category)) {
    return { field: "category", error: "Choose what kind of business you are." };
  }

  const email = normalizeEmail(formData.get("email"));
  if (!isPlausibleEmail(email)) return { field: "email", error: "Enter a valid email address." };

  const password = String(formData.get("password") ?? "");
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      field: "password",
      error: `Your password needs at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }
  if (password !== String(formData.get("confirmPassword") ?? "")) {
    return { field: "confirm", error: "The two passwords don't match." };
  }

  if (formData.get("terms") !== "on") {
    return { field: "terms", error: "Please agree to the Terms of Service to continue." };
  }

  const ip = await clientIp();
  const throttleKey = `signup:${ip}`;
  if (await tooManySignups(throttleKey)) {
    return { error: "Too many new accounts from this network. Try again in an hour." };
  }

  let businessId: string;
  try {
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        category,
        email,
        passwordHash: await hashPassword(password),
        termsAcceptedAt: new Date(),
      },
      select: { id: true },
    });
    businessId = business.id;
  } catch (err) {
    // The unique constraints are the final word: someone may have taken the
    // slug between the live check and submitting, or the email may already
    // have an account.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = String(err.meta?.target ?? "");
      if (target.includes("email")) {
        return {
          field: "email",
          error: "There's already an account with that email. Log in instead.",
        };
      }
      return { field: "slug", error: "That web address was just taken. Try another." };
    }
    throw err;
  }

  await recordSignup(throttleKey);
  await createSession(businessId);

  // BILLING: once Stripe is set up, this is where the new business goes to
  // Stripe Checkout to enter a card (first month free, then $30/month on
  // the 15th) instead of straight to settings. Checkout's success URL would
  // then land on /dashboard/settings?welcome=1.
  redirect("/dashboard/settings?welcome=1");
}

// Uses the LoginAttempt table (rows keyed "signup:<ip>") rather than a new
// one. Like the login throttle, this fails open: if the check errors,
// signup still works.
async function tooManySignups(key: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await prisma.loginAttempt.count({ where: { key, createdAt: { gte: since } } });
    return count >= SIGNUPS_PER_IP_PER_HOUR;
  } catch (err) {
    console.error("Signup throttle check failed (allowing signup):", err);
    return false;
  }
}

async function recordSignup(key: string): Promise<void> {
  try {
    await prisma.loginAttempt.create({ data: { key } });
  } catch (err) {
    console.error("Couldn't record signup for throttling:", err);
  }
}
