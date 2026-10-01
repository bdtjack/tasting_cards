import { MAX_SELECTIONS, MIN_SELECTIONS } from "./types";
import { LIMITS, optionalText } from "./validate";

/** Reads the optional flat price field; blank means "no price shown". */
export function readFlightPrice(formData: FormData): string | null {
  return optionalText(formData.get("price"), LIMITS.price);
}

/**
 * Reads how many picks a build-your-own flight asks for, clamped to the
 * allowed range so a hand-edited form can't create a 0- or 500-step flight.
 * Returns null if it's missing or not a number.
 */
export function readSelectionCount(formData: FormData): number | null {
  const raw = Number.parseInt(String(formData.get("selectionCount") ?? ""), 10);
  if (!Number.isFinite(raw)) return null;
  return Math.min(MAX_SELECTIONS, Math.max(MIN_SELECTIONS, raw));
}
