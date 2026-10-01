// Picks readable text colors for a business's theme.
//
// A business can choose any primary (background) and accent color in
// settings, so text colors can't be hardcoded: cream text that looks right
// on Hidden Hills' black disappears on a white or pastel card, and dark
// button text vanishes on a dark accent. Everything guest-facing (cards,
// menu, flights, settings preview, share thumbnails) takes its colors from
// cardPalette() so they all stay readable together.
//
// Colors that already read well are returned unchanged, so a dark theme
// with a light accent (like black and gold) looks exactly as before.

type Rgb = [number, number, number];

const FALLBACK_PRIMARY = "#0D0D0D";
const FALLBACK_ACCENT = "#C9A24B";

function isHex6(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function hexToRgb(hex: string): Rgb {
  const h = hex.slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

function rgbToHex(rgb: Rgb): string {
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors, from 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mix(from: string, to: string, amount: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * amount) as Rgb);
}

/** Black or white, whichever stands out more against `background`. */
function bestExtreme(background: string): string {
  return contrastRatio("#000000", background) >= contrastRatio("#FFFFFF", background)
    ? "#000000"
    : "#FFFFFF";
}

/**
 * Returns `color` unchanged if it already has at least `minRatio` contrast
 * against `background`; otherwise nudges it toward black or white just far
 * enough to get there, so it keeps as much of the brand hue as possible.
 */
function ensureContrast(color: string, background: string, minRatio: number): string {
  if (contrastRatio(color, background) >= minRatio) return color;
  const target = bestExtreme(background);
  for (let step = 1; step <= 10; step++) {
    const candidate = mix(color, target, step / 10);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target;
}

export type CardPalette = {
  /** Card background (the business's primary color). */
  background: string;
  /** The raw accent color — for borders, dividers, tints and button fills. */
  accent: string;
  /** Large text: product, flight and menu names, prices. */
  heading: string;
  /** Regular text: tasting notes, descriptions. */
  body: string;
  /** Accent-colored text (labels, business name), adjusted if the raw accent would be hard to read. */
  accentText: string;
  /** Text drawn on top of an accent-filled button. */
  onAccent: string;
  /** True when the background is dark (so text is light). */
  isDark: boolean;
};

export function cardPalette(primaryColor: string, accentColor: string): CardPalette {
  const background = isHex6(primaryColor) ? primaryColor : FALLBACK_PRIMARY;
  const accent = isHex6(accentColor) ? accentColor : FALLBACK_ACCENT;

  // Warm cream on dark backgrounds (the original look), warm near-black on
  // light ones.
  const lightBackground = bestExtreme(background) === "#000000";
  const heading = ensureContrast(lightBackground ? "#1A1714" : "#F5F1E8", background, 7);
  const body = ensureContrast(lightBackground ? "#3A332B" : "#E8DFC8", background, 4.5);

  return {
    background,
    accent,
    heading,
    body,
    accentText: ensureContrast(accent, background, 4.5),
    onAccent: contrastRatio("#0D0D0D", accent) >= contrastRatio("#FFFFFF", accent) ? "#0D0D0D" : "#FFFFFF",
    isDark: !lightBackground,
  };
}
