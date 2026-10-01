import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { readFile } from "fs/promises";
import { join } from "path";
import { CARD_FONT_OPTIONS, resolveCardFont } from "./fontOptions";

export const OG_SIZE = { width: 1200, height: 630 };

// Share thumbnails change when a business edits a product, so they must not
// be cached for long. (ImageResponse's own default is a year, immutable.)
const OG_CACHE_CONTROL = "public, max-age=600, s-maxage=600, stale-while-revalidate=3600";

// The image generator can't use browser/system fonts — it needs the raw
// font file. The business's heading font (lib/fontOptions.ts) is read from
// assets/fonts, which next.config.mjs's outputFileTracingIncludes makes
// Vercel bundle with the deployed functions. It's registered under the
// name "Serif", so the thumbnail layouts just use fontFamily: "Serif".
const fontCache = new Map<string, Promise<Buffer>>();

function loadFontFile(file: string): Promise<Buffer> {
  let promise = fontCache.get(file);
  if (!promise) {
    promise = readFile(join(process.cwd(), "assets/fonts", file));
    // Don't cache a failed read forever.
    promise.catch(() => fontCache.delete(file));
    fontCache.set(file, promise);
  }
  return promise;
}

async function ogOptions(cardFont: string | null | undefined) {
  try {
    const data = await loadFontFile(CARD_FONT_OPTIONS[resolveCardFont(cardFont)].ogFile);
    return {
      ...OG_SIZE,
      fonts: [{ name: "Serif", data, style: "normal" as const, weight: 400 as const }],
    };
  } catch (err) {
    // If the font can't be read for any reason, still render — just in the
    // default font — rather than failing the whole image.
    console.error("Couldn't load serif font for OG image:", err);
    return OG_SIZE;
  }
}

/**
 * Renders a share thumbnail, falling back to a plain one if anything goes
 * wrong.
 *
 * ImageResponse draws the picture lazily, while the response is being
 * streamed — so wrapping `new ImageResponse(...)` in try/catch on its own
 * never catches a drawing error. Reading the finished bytes here forces the
 * drawing to happen inside the try, so a failure really does fall back.
 */
export async function renderOgImage(
  element: ReactElement,
  cardFont: string | null | undefined
): Promise<Response> {
  const options = await ogOptions(cardFont);
  try {
    const png = await new ImageResponse(element, options).arrayBuffer();
    return new Response(png, {
      headers: { "content-type": "image/png", "cache-control": OG_CACHE_CONTROL },
    });
  } catch (err) {
    console.error("OG image generation failed, falling back:", err);
    return fallbackOgImage();
  }
}

/**
 * Rendered when a route's business/product/flight can't be found, or when
 * drawing the real branded image fails. A generic preview is a much better
 * failure mode than the image request erroring out, which some platforms
 * treat as "no image at all".
 */
export function fallbackOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D0D",
          color: "#F5F1E8",
          fontSize: 48,
        }}
      >
        Tasting Cards
      </div>
    ),
    { ...OG_SIZE, headers: { "cache-control": "public, max-age=60, s-maxage=60" } }
  );
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function sniffImageType(bytes: Uint8Array): string | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  return null;
}

/**
 * Fetches a business's logo for use in a share thumbnail, returning it as a
 * data URL — or null (so the initials badge is used instead) if it can't be
 * fetched quickly or isn't a format the image generator can draw. The
 * generator only handles PNG, JPEG and GIF; WebP logos uploaded before
 * logos switched to PNG would otherwise break the whole thumbnail.
 */
export async function loadLogoForOg(logoUrl: string | null): Promise<string | null> {
  if (!logoUrl) return null;
  try {
    const res = await fetch(logoUrl, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_LOGO_BYTES) return null;
    const type = sniffImageType(new Uint8Array(buffer));
    if (!type) return null;
    return `data:${type};base64,${Buffer.from(buffer).toString("base64")}`;
  } catch {
    return null;
  }
}

/** The small circular logo (or initials, if there's no usable logo) in the header row of every generated image. */
export function LogoBadge({
  logoSrc,
  name,
  color,
}: {
  logoSrc: string | null;
  name: string;
  color: string;
}) {
  if (logoSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoSrc} width={48} height={48} style={{ borderRadius: "50%" }} alt="" />;
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        color,
        fontSize: 18,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
