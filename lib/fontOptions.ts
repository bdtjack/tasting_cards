// The heading fonts a business can choose for its guest-facing cards
// (product, flight and menu names, prices). Tasting notes and other body
// text stay in the plain system font so they're always easy to read.
//
// This file is plain data so it can be used anywhere — including the
// share-thumbnail generator, which can't use next/font. The web-font
// loading lives in lib/cardFonts.ts; a font added here must be added there
// too (TypeScript will complain until it is).
//
// All fonts except "classic" (system Georgia) are self-hosted from
// assets/fonts, under the SIL Open Font License (see assets/fonts/licenses).
// Ids are what's saved in the database, so never rename one — only labels.

export const CARD_FONT_IDS = [
  "classic",
  "elegant",
  "refined",
  "heritage",
  "vintage",
  "estate",
  "statement",
  "rustic",
  "saloon",
  "bold",
  "poster",
  "deco",
  "modern",
  "friendly",
  "handwritten",
] as const;

export type CardFontId = (typeof CARD_FONT_IDS)[number];

export const DEFAULT_CARD_FONT: CardFontId = "classic";

export const CARD_FONT_OPTIONS: Record<
  CardFontId,
  {
    label: string;
    hint: string;
    /** File in assets/fonts drawn into share thumbnails (TTF/OTF/WOFF only — the generator can't read WOFF2). */
    ogFile: string;
  }
> = {
  classic: {
    label: "Classic",
    hint: "Traditional serif — the original look",
    ogFile: "CrimsonText-Regular.ttf",
  },
  elegant: {
    label: "Elegant",
    hint: "High-contrast serif, like a wine label",
    ogFile: "playfair-display-latin-400-normal.woff",
  },
  refined: {
    label: "Refined",
    hint: "Delicate old-style serif",
    ogFile: "cormorant-garamond-latin-600-normal.woff",
  },
  heritage: {
    label: "Heritage",
    hint: "Bookish serif, timeless and readable",
    ogFile: "libre-baskerville-latin-400-normal.woff",
  },
  vintage: {
    label: "Vintage",
    hint: "Soft, chunky serif with old-fashioned charm",
    ogFile: "fraunces-latin-600-normal.woff",
  },
  estate: {
    label: "Estate",
    hint: "Engraved capitals, old estate-label style",
    ogFile: "cinzel-latin-500-normal.woff",
  },
  statement: {
    label: "Statement",
    hint: "Heavy display serif that stands out",
    ogFile: "abril-fatface-latin-400-normal.woff",
  },
  rustic: {
    label: "Rustic",
    hint: "Sturdy slab serif, distillery style",
    ogFile: "zilla-slab-latin-500-normal.woff",
  },
  saloon: {
    label: "Saloon",
    hint: "Western whiskey-label lettering",
    ogFile: "rye-latin-400-normal.woff",
  },
  bold: {
    label: "Bold",
    hint: "Tall condensed sans, taproom style",
    ogFile: "oswald-latin-500-normal.woff",
  },
  poster: {
    label: "Poster",
    hint: "Condensed capitals, like a tap list",
    ogFile: "bebas-neue-latin-400-normal.woff",
  },
  deco: {
    label: "Art Deco",
    hint: "Geometric sans, cocktail-bar style",
    ogFile: "josefin-sans-latin-600-normal.woff",
  },
  modern: {
    label: "Modern",
    hint: "Clean, airy sans",
    ogFile: "raleway-latin-600-normal.woff",
  },
  friendly: {
    label: "Friendly",
    hint: "Rounded, relaxed sans",
    ogFile: "quicksand-latin-600-normal.woff",
  },
  handwritten: {
    label: "Handwritten",
    hint: "Casual script, like a chalkboard menu",
    ogFile: "dancing-script-latin-600-normal.woff",
  },
};

export function isCardFontId(value: unknown): value is CardFontId {
  return typeof value === "string" && (CARD_FONT_IDS as readonly string[]).includes(value);
}

/** The saved font, or the default if it's missing or no longer offered. */
export function resolveCardFont(value: string | null | undefined): CardFontId {
  return isCardFontId(value) ? value : DEFAULT_CARD_FONT;
}
