import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { OG_SIZE, fallbackOgImage, LogoBadge, ogOptions } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { businessSlug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { businessSlug } = await params;
  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });

  if (!business) return fallbackOgImage();

  const options = await ogOptions();

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

          <div style={{ display: "flex", flexDirection: "column", marginTop: 96 }}>
            <span style={{ fontFamily: "Serif", color: "#F5F1E8", fontSize: 104 }}>Menu</span>
            <span style={{ color: business.accentColor, fontSize: 30, marginTop: 16 }}>
              See what&apos;s being poured
            </span>
            <div
              style={{
                display: "flex",
                height: 2,
                width: 360,
                marginTop: 28,
                backgroundImage: `linear-gradient(90deg, ${business.accentColor}, transparent)`,
              }}
            />
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
