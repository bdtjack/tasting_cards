// Input cleanup shared by every server action that saves user text.
//
// None of this is about SQL injection — Prisma already sends all values as
// parameters, never as SQL. It's about keeping stored data sane: bounded
// lengths so a pasted essay can't wreck a card's layout, no invisible
// control characters (Postgres rejects the null character outright, which
// would surface as an error page), and only real web links in link fields.
//
// The same LIMITS are used as maxLength on the form inputs, so a normal user
// hits the limit while typing; the server-side slice is the backstop for a
// hand-edited request.

import type { BusinessCategory } from "./types";

export const LIMITS = {
  name: 80,
  category: 60,
  subtitle: 80,
  proofAbv: 40,
  description: 300,
  note: 100,
  price: 20,
  flightDescription: 300,
  url: 500,
} as const;

// Control characters except tab (\t) and newline (\n).
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trimmed, length-capped text with control characters removed. */
export function cleanText(value: FormDataEntryValue | null | undefined, max: number): string {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS, "")
    .trim()
    .slice(0, max);
}

/** Same as cleanText, but an empty result becomes null (for optional columns). */
export function optionalText(
  value: FormDataEntryValue | null | undefined,
  max: number
): string | null {
  return cleanText(value, max) || null;
}

/**
 * An optional link field. Returns null for blank, the cleaned URL if it's a
 * real http(s) link, or false if it's anything else — e.g. a `javascript:`
 * link, which would run code when a guest taps it.
 */
export function optionalUrl(value: FormDataEntryValue | null | undefined): string | null | false {
  const text = cleanText(value, LIMITS.url);
  if (!text) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : false;
  } catch {
    return false;
  }
}

/**
 * Six-digit hex colors only. The card code appends two hex digits to these
 * for transparency (e.g. `${accentColor}40`), so shorthand like #fff or a
 * named color would silently break the styling.
 */
export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

const BUSINESS_CATEGORIES: BusinessCategory[] = ["WINERY", "BREWERY", "DISTILLERY", "MIXED"];

export function isBusinessCategory(value: unknown): value is BusinessCategory {
  return typeof value === "string" && (BUSINESS_CATEGORIES as string[]).includes(value);
}
