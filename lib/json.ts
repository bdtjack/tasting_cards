/**
 * Parses a JSON-encoded string field back into its value, falling back
 * cleanly if the field is null or somehow malformed. Used for the fields
 * stored as JSON text rather than a native Json column (priceLabels,
 * prices) — see the note at the top of prisma/schema.prisma.
 */
export function parseJsonField<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
