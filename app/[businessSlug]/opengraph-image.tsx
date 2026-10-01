import { prisma } from "@/lib/prisma";
import { cardPalette } from "@/lib/color";
import { OG_SIZE, fallbackOgImage, LogoBadge, loadLogoForOg, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { businessSlug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { businessSlug } = await params;
  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });

  if (!business) return fallbackOgImage();

  const p = cardPalette(business.primaryColor, business.accentColor);
  const logoSrc = await loadLogoForOg(business.logoUrl);

  return renderOgImage(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 80,
        background: p.background,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LogoBadge logoSrc={logoSrc} name={business.name} color={p.accentText} />
        <span style={{ color: p.accentText, fontSize: 24, letterSpacing: 2 }}>
          {business.name.toUpperCase()}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 96 }}>
        <span style={{ fontFamily: "Serif", color: p.heading, fontSize: 104 }}>Menu</span>
        <span style={{ color: p.accentText, fontSize: 30, marginTop: 16 }}>
          See what&apos;s being poured
        </span>
        <div
          style={{
            display: "flex",
            height: 2,
            width: 360,
            marginTop: 28,
            backgroundImage: `linear-gradient(90deg, ${p.accent}, transparent)`,
          }}
        />
      </div>
    </div>,
    business.cardFont
  );
}
