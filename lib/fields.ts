import type { BusinessCategory, ProductType } from "./types";

export const PRODUCT_TYPES: ProductType[] = ["WINE", "BEER", "SPIRIT"];

export function isProductType(value: unknown): value is ProductType {
  return typeof value === "string" && (PRODUCT_TYPES as string[]).includes(value);
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  WINE: "Wine",
  BEER: "Beer",
  SPIRIT: "Spirit",
};

/**
 * Which kind of product a new item is. A single-category business always
 * adds its own kind; a MIXED business chooses per product (the chooser
 * on the new-product page), so `requested` is only honored for MIXED and
 * returns null if it's missing or invalid.
 */
export function resolveProductType(
  category: BusinessCategory,
  requested?: unknown
): ProductType | null {
  switch (category) {
    case "WINERY":
      return "WINE";
    case "BREWERY":
      return "BEER";
    case "DISTILLERY":
      return "SPIRIT";
    case "MIXED":
    default:
      return isProductType(requested) ? requested : null;
  }
}

/**
 * Whether the proof/ABV field should be shown for a new product.
 *
 * Wine typically doesn't lead with ABV on a tasting card; beer and
 * spirits do. Only consulted at product-creation time — the result gets
 * copied onto Product.showAbv and never re-derived, so changing the
 * business category later doesn't retroactively change existing cards.
 */
export function defaultShowAbv(type: ProductType): boolean {
  return type !== "WINE";
}

/**
 * Price fields a product shows, based on how that kind of drink is
 * typically sold. Snapshotted onto Product.priceLabels at creation.
 */
export function getPriceLabels(type: ProductType): string[] {
  switch (type) {
    case "WINE":
      return ["Glass", "Bottle"];
    case "SPIRIT":
      return ["Oz", "Bottle"];
    case "BEER":
      return ["Taste", "Pour", "Pack"];
  }
}

/** Placeholder text for the Description field, by product type. */
export function getDescriptionHint(type: ProductType | null): string {
  switch (type) {
    case "SPIRIT":
      return "Mash bill, e.g. 75% corn, 15% rye, 10% malted barley";
    case "WINE":
      return "Grape breakdown, e.g. 60% Cabernet Sauvignon, 40% Merlot";
    case "BEER":
      return "Hops and malt breakdown, e.g. Citra, Mosaic; 2-row, Munich";
    default:
      return "Mash bill, grape breakdown, hops breakdown, etc.";
  }
}
