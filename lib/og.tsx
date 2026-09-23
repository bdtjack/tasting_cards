import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const OG_SIZE = { width: 1200, height: 630 };

// The image generator can't use browser/system fonts — it needs the raw
// font file. Crimson Text (SIL Open Font License) ships in assets/fonts
// and is listed in next.config.mjs's outputFileTracingIncludes so Vercel
// bundles it with the deployed functions.
let serifFontPromise: Promise<Buffer> | null = null;

export function loadSerifFont(): Promise<Buffer> {
  if (!serifFontPromise) {
    serifFontPromise = readFile(join(process.cwd(), "assets/fonts/CrimsonText-Regular.ttf"));
  }
  return serifFontPromise;
}

/** ImageResponse options with the serif font registered as "Serif". */
export async function ogOptions() {
  try {
    const data = await loadSerifFont();
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
 * Rendered when a route's business/product/flight can't be found, OR when
 * rendering the real branded image throws for any reason (most likely: a
 * business's logoUrl is broken or unreachable — that field is a raw
 * pasted URL with no validation on the settings page). A generic
 * share-preview image is a much better failure mode than the image
 * request itself erroring out, which some platforms treat as "no image
 * at all" rather than falling back gracefully.
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
    OG_SIZE
  );
}

/** The small circular logo (or initials, if no logo is set) used in the header row of every generated image. */
export function LogoBadge({
  logoUrl,
  name,
  accentColor,
}: {
  logoUrl: string | null;
  name: string;
  accentColor: string;
}) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} width={48} height={48} style={{ borderRadius: "50%" }} alt="" />;
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
        border: `2px solid ${accentColor}`,
        color: accentColor,
        fontSize: 18,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
