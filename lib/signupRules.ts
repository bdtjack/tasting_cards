// Rules for new-business signup that both the signup form (in the browser)
// and the signup server action use, so the live checks while typing match
// what the server will actually accept.

import { isReservedBusinessSlug, slugify } from "./slug";

export const BUSINESS_SLUG_MIN = 2;
export const BUSINESS_SLUG_MAX = 40;
export const PASSWORD_MIN_LENGTH = 8;
export const EMAIL_MAX_LENGTH = 254;

/**
 * The final form of a business's web address, e.g. "Hidden Hills Farm" →
 * "hidden-hills-farm". This is what gets saved, and it's baked into every QR
 * code the business prints, so it can't change after signup.
 */
export function cleanBusinessSlug(raw: string): string {
  return slugify(raw).slice(0, BUSINESS_SLUG_MAX).replace(/-+$/, "");
}

/**
 * A gentler version for the input box while someone types: same allowed
 * characters, but a trailing hyphen is kept so "hidden-" can become
 * "hidden-hills" instead of snapping back to "hidden" on every keystroke.
 */
export function typingBusinessSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, BUSINESS_SLUG_MAX);
}

export type SlugStatus = "available" | "taken" | "reserved" | "invalid";

/** The checks that don't need the database. Null means "ask the server". */
export function localSlugProblem(slug: string): Exclude<SlugStatus, "available" | "taken"> | null {
  if (slug.length < BUSINESS_SLUG_MIN) return "invalid";
  if (isReservedBusinessSlug(slug)) return "reserved";
  return null;
}

export function isPlausibleEmail(email: string): boolean {
  return email.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
