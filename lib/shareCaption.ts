export const MAX_SHARE_PHRASE_LENGTH = 150;

/**
 * Assembles the caption shown on a product/flight card's saved image and
 * passed to the share sheet: "{business's phrase} {item name} at
 * {business name}". Returns null when the business hasn't set a phrase, so
 * callers fall back to their own plainer text instead of a sentence with a
 * missing first half.
 */
export function buildShareCaption({
  sharePhrase,
  itemName,
  businessName,
}: {
  sharePhrase: string | null;
  itemName: string;
  businessName: string;
}): string | null {
  const phrase = sharePhrase?.trim();
  if (!phrase) return null;
  return `${phrase} ${itemName} at ${businessName}`;
}
