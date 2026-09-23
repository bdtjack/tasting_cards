import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/json";
import { OG_SIZE, fallbackOgImage, LogoBadge, ogOptions } from "@/lib/og";

// Next.js convention: a file named opengraph-image.tsx becomes this route's
// og:image automatically. This is the thumbnail shown when a card's LINK is
// shared (iMessage, Facebook, etc). It's laid out like the tasting card
// turned sideways: name on the left, tasting notes on the right.

export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { businessSlug: string; productSlug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { businessSlug, productSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  const product = business
    ? await prisma.product.findUnique({
        where: { businessId_slug: { businessId: business.id, slug: productSlug } },
      })
    : null;

  if (!business || !product || product.status === "DRAFT") return fallbackOgImage();

  const accent = business.accentColor;
  const isArchived = product.status === "ARCHIVED";
  const subtitle = [product.category, product.subtitle].filter(Boolean).join(" · ");
  const prices = Object.entries(parseJsonField<Record<string, string>>(product.prices, {})).filter(
    ([, v]) => v
  );
  const notes = [
    product.showAbv && product.proofAbv ? ["Proof / ABV", product.proofAbv] : null,
    product.aroma ? ["Aroma", product.aroma] : null,
    product.palate ? ["Palate", product.palate] : null,
    product.finish ? ["Finish", product.finish] : null,
  ].filter((n): n is string[] => n !== null);

  const options = await ogOptions();

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: business.primaryColor,
            padding: 64,
          }}
        >
          {/* Left: identity */}
          <div style={{ display: "flex", flexDirection: "column", width: 560, paddingRight: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <LogoBadge logoUrl={business.logoUrl} name={business.name} accentColor={accent} />
              <span style={{ color: accent, fontSize: 20, letterSpacing: 3 }}>
                {business.name.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 72 }}>
              <span style={{ fontFamily: "Serif", color: "#F5F1E8", fontSize: 76, lineHeight: 1.05 }}>
                {product.name}
              </span>
              {subtitle && (
                <span style={{ color: accent, fontSize: 22, letterSpacing: 2, marginTop: 16 }}>
                  {subtitle.toUpperCase()}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  height: 2,
                  width: 360,
                  marginTop: 28,
                  backgroundImage: `linear-gradient(90deg, ${accent}, transparent)`,
                }}
              />
            </div>

            {!isArchived && prices.length > 0 && (
              <div style={{ display: "flex", gap: 28, marginTop: "auto" }}>
                {prices.map(([label, value]) => (
                  <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ color: accent, fontSize: 20 }}>{label}</span>
                    <span style={{ fontFamily: "Serif", color: "#F5F1E8", fontSize: 30 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: tasting notes (or sold-out message) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingLeft: 48,
              borderLeft: `1px solid ${accent}40`,
              gap: 26,
            }}
          >
            {isArchived ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <span
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    color: accent,
                    fontSize: 20,
                    letterSpacing: 2,
                    background: `${accent}22`,
                    padding: "6px 16px",
                    borderRadius: 6,
                  }}
                >
                  NO LONGER AVAILABLE
                </span>
                <span style={{ color: "#E8DFC8", fontSize: 26, lineHeight: 1.4 }}>
                  This one sold out. Join the list to hear about the next release.
                </span>
              </div>
            ) : (
              notes.map(([label, value]) => (
                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: accent, fontSize: 16, letterSpacing: 3 }}>
                    {label.toUpperCase()}
                  </span>
                  <span style={{ color: "#E8DFC8", fontSize: 26, marginTop: 6, lineHeight: 1.3 }}>
                    {value}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      options
    );
  } catch (err) {
    console.error("OG image generation failed, falling back:", err);
    return fallbackOgImage();
  }
}
