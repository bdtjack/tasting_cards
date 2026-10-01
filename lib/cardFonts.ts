import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { resolveCardFont, type CardFontId } from "./fontOptions";

// Self-hosted heading fonts for guest cards (see lib/fontOptions.ts for the
// list). preload: false because every page imports all of them but only
// ever shows one — the browser downloads just the font a card actually
// uses (each is roughly 10–30 KB). next/font requires each font to be its
// own top-level call, hence the repetition.

const elegant = localFont({
  src: "../assets/fonts/playfair-display-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const refined = localFont({
  src: "../assets/fonts/cormorant-garamond-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const heritage = localFont({
  src: "../assets/fonts/libre-baskerville-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const vintage = localFont({
  src: "../assets/fonts/fraunces-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const estate = localFont({
  src: "../assets/fonts/cinzel-latin-500-normal.woff2",
  weight: "500",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const statement = localFont({
  src: "../assets/fonts/abril-fatface-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const rustic = localFont({
  src: "../assets/fonts/zilla-slab-latin-500-normal.woff2",
  weight: "500",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const saloon = localFont({
  src: "../assets/fonts/rye-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const bold = localFont({
  src: "../assets/fonts/oswald-latin-500-normal.woff2",
  weight: "500",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const poster = localFont({
  src: "../assets/fonts/bebas-neue-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const deco = localFont({
  src: "../assets/fonts/josefin-sans-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const modern = localFont({
  src: "../assets/fonts/raleway-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const friendly = localFont({
  src: "../assets/fonts/quicksand-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const handwritten = localFont({
  src: "../assets/fonts/dancing-script-latin-600-normal.woff2",
  weight: "600",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

const FAMILIES: Record<CardFontId, string> = {
  classic: 'Georgia, Cambria, "Times New Roman", serif',
  elegant: elegant.style.fontFamily,
  refined: refined.style.fontFamily,
  heritage: heritage.style.fontFamily,
  vintage: vintage.style.fontFamily,
  estate: estate.style.fontFamily,
  statement: statement.style.fontFamily,
  rustic: rustic.style.fontFamily,
  saloon: saloon.style.fontFamily,
  bold: bold.style.fontFamily,
  poster: poster.style.fontFamily,
  deco: deco.style.fontFamily,
  modern: modern.style.fontFamily,
  friendly: friendly.style.fontFamily,
  handwritten: handwritten.style.fontFamily,
};

/** The CSS font-family stack for a saved font choice. */
export function cardFontFamily(fontId: string | null | undefined): string {
  return FAMILIES[resolveCardFont(fontId)];
}

/**
 * Put this on a card's outermost element. Everything inside that uses the
 * `font-serif` class (names, prices — see tailwind.config.ts) then shows in
 * the business's chosen font.
 */
export function cardFontStyle(fontId: string | null | undefined): CSSProperties {
  return { ["--card-heading-font" as string]: cardFontFamily(fontId) } as CSSProperties;
}
