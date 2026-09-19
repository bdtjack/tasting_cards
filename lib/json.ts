/**
 * Parses a JSON-encoded string field back into its value, falling back
 * cleanly if the field is null or somehow malformed. Used for the fields
 * that store JSON as plain text because SQLite's Prisma connector has no
 * native Json column type (priceLabels, prices).
 */
export function parseJsonField<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
