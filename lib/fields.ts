import { BusinessCategory } from "./types";

/**
 * Whether the proof/ABV field should be shown for a new product.
 *
 * Wine typically doesn't lead with ABV on a tasting card; beer and
 * spirits do. This is only consulted at product-creation time — the
 * result gets copied onto Product.showAbv and never re-derived, so a
 * business changing its category later doesn't retroactively change
 * the look of its existing published cards.
 */
export function defaultShowAbv(category: BusinessCategory): boolean {
  return category !== "WINERY";
}

/**
 * Which price fields a product shows, based on how that category of
 * business typically sells a tasting pour. Like showAbv, this is only
 * consulted at creation time and then snapshotted onto Product.priceLabels
 * — a business changing category later doesn't rewrite existing cards.
 *
 * MIXED businesses fall back to a single generic label since there's no
 * single serving structure that fits every category they might pour —
 * worth revisiting with a per-product override once that's needed.
 */
export function getPriceLabels(category: BusinessCategory): string[] {
  switch (category) {
    case "WINERY":
      return ["Glass", "Bottle"];
    case "DISTILLERY":
      return ["Oz", "Bottle"];
    case "BREWERY":
      return ["Taste", "Pour", "Pack"];
    case "MIXED":
    default:
      return ["Price"];
  }
}

