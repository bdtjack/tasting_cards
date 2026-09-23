import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { OG_SIZE, fallbackOgImage, LogoBadge } from "@/lib/og";

// This file is a Next.js convention, not a normal page: dropping an
// "opengraph-image.tsx" file in a route segment tells Next.js to render
// this as that route's og:image automatically — no manual <meta> tag
// needed, and generateMetadata (in page.tsx) doesn't have to reference it.

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

  if (!business || !product) return fallbackOgImage();

  const isArchived = product.status === "ARCHIVED";
  const subtitle = [product.category, product.subtitle].filter(Boolean).join(" · ");

  // A business's logoUrl is a raw pasted link with no validation — if it's
  // broken or unreachable, rendering would otherwise throw and break the
  // whole preview image rather than just the logo. Fall back cleanly.
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 80,
            background: business.primaryColor,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <LogoBadge
              logoUrl={business.logoUrl}
              name={business.name}
              accentColor={business.accentColor}
            />
            <span style={{ color: business.accentColor, fontSize: 24, letterSpacing: 2 }}>
              {business.name.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 64 }}>
            <span style={{ color: "#F5F1E8", fontSize: 84, fontWeight: 700 }}>
              {product.name}
            </span>
            {subtitle && (
              <span style={{ color: business.accentColor, fontSize: 32, marginTop: 12 }}>
                {subtitle.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: "flex", marginTop: 40 }}>
            {isArchived ? (
              <span
                style={{
                  color: business.accentColor,
                  fontSize: 28,
                  background: `${business.accentColor}20`,
                  padding: "8px 20px",
                  borderRadius: 8,
                }}
              >
                No longer available
              </span>
            ) : (
              product.aroma && (
                <span style={{ color: "#E8DFC8", fontSize: 30, maxWidth: 900 }}>
                  {product.aroma}
                </span>
              )
            )}
          </div>
        </div>
      ),
      size
    );
  } catch (err) {
    console.error("OG image generation failed, falling back:", err);
    return fallbackOgImage();
  }
}
