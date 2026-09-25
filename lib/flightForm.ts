import { MAX_SELECTIONS, MIN_SELECTIONS } from "./types";

/** Reads the optional flat price field; blank means "no price shown". */
export function readFlightPrice(formData: FormData): string | null {
  return String(formData.get("price") ?? "").trim() || null;
}

/**
 * Reads how many picks a build-your-own flight asks for, clamped to the
 * allowed range so a hand-edited form can't create a 0- or 500-step flight.
 */
export function readSelectionCount(formData: FormData): number {
  const raw = Number.parseInt(String(formData.get("selectionCount") ?? ""), 10);
  if (!Number.isFinite(raw)) throw new Error("Number of selections is required");
  return Math.min(MAX_SELECTIONS, Math.max(MIN_SELECTIONS, raw));
}
