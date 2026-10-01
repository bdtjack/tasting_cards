import type { BusinessCategory, ProductType } from "./types";
import { parseJsonField } from "./json";

export const PRODUCT_TYPES: ProductType[] = ["WINE", "BEER", "SPIRIT", "COCKTAIL"];

export function isProductType(value: unknown): value is ProductType {
  return typeof value === "string" && (PRODUCT_TYPES as string[]).includes(value);
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  WINE: "Wine",
  BEER: "Beer",
  SPIRIT: "Spirit",
  COCKTAIL: "Cocktail",
};

/**
 * The product type a single-category business mainly makes, or null for a
 * MIXED business (which has no single primary type).
 */
export function getPrimaryProductType(category: BusinessCategory): ProductType | null {
  switch (category) {
    case "WINERY":
      return "WINE";
    case "BREWERY":
      return "BEER";
    case "DISTILLERY":
      return "SPIRIT";
    default:
      return null;
  }
}

/**
 * The types a business can add, in the order shown on the chooser. Every
 * business can add cocktails on top of what it makes; MIXED businesses
 * can add any kind.
 */
export function getAllowedProductTypes(category: BusinessCategory): ProductType[] {
  const primary = getPrimaryProductType(category);
  return primary ? [primary, "COCKTAIL"] : PRODUCT_TYPES;
}

/**
 * Validates the type a new product was requested as against what this
 * business is allowed to add. Returns null if it's missing or not allowed,
 * which sends the user to the chooser.
 */
export function resolveProductType(
  category: BusinessCategory,
  requested?: unknown
): ProductType | null {
  return isProductType(requested) && getAllowedProductTypes(category).includes(requested)
    ? requested
    : null;
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
    case "COCKTAIL":
      return ["Price"];
  }
}

/** Section headings on the guest-facing menu, one per product type. */
export const MENU_SECTION_LABELS: Record<ProductType, string> = {
  WINE: "Wine",
  BEER: "Beer",
  SPIRIT: "Spirits",
  COCKTAIL: "Cocktails",
};

/**
 * The order menu sections appear in: the business's own kind of drink
 * first (beer first for a brewery, etc.), then the rest. Mixed businesses
 * get wine, beer, spirits, cocktails.
 */
export function menuSectionOrder(category: BusinessCategory): ProductType[] {
  const primary = getPrimaryProductType(category);
  return primary ? [primary, ...PRODUCT_TYPES.filter((type) => type !== primary)] : PRODUCT_TYPES;
}

/**
 * A product's type, for grouping it on the menu. Products created before
 * the type was stored (productType is null) are worked out from the price
 * fields they were created with — Glass/Bottle means wine, Oz/Bottle
 * spirits, Taste/Pour/Pack beer, a single Price a cocktail — and failing
 * that, from the business's category. Null means it can't be told (a
 * MIXED business with no clue in the prices).
 */
export function inferProductType(
  product: { productType: string | null; priceLabels: string | null },
  category: BusinessCategory
): ProductType | null {
  if (isProductType(product.productType)) return product.productType;

  const labels = parseJsonField<string[]>(product.priceLabels, []);
  if (labels.some((label) => label.startsWith("Glass"))) return "WINE";
  if (labels.includes("Oz")) return "SPIRIT";
  if (labels.some((label) => ["Taste", "Pour", "Pack"].includes(label))) return "BEER";
  if (labels.length === 1 && labels[0] === "Price") return "COCKTAIL";

  return getPrimaryProductType(category);
}
