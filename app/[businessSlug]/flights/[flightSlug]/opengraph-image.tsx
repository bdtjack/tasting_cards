import { prisma } from "@/lib/prisma";
import { cardPalette } from "@/lib/color";
import { OG_SIZE, fallbackOgImage, LogoBadge, loadLogoForOg, renderOgImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { businessSlug: string; flightSlug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { businessSlug, flightSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  const flight = business
    ? await prisma.flight.findUnique({
        where: { businessId_slug: { businessId: business.id, slug: flightSlug } },
        include: { _count: { select: { items: { where: { product: { status: { not: "DRAFT" } } } } } } },
      })
    : null;

  if (!business || !flight) return fallbackOgImage();

  const p = cardPalette(business.primaryColor, business.accentColor);
  const logoSrc = await loadLogoForOg(business.logoUrl);
  const itemCount = flight._count.items;

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

      <div style={{ display: "flex", flexDirection: "column", marginTop: 64 }}>
        <span style={{ fontFamily: "Serif", color: p.heading, fontSize: 84 }}>{flight.name}</span>
        <span style={{ color: p.accentText, fontSize: 28, marginTop: 16 }}>
          {flight.kind === "BUILD_YOUR_OWN"
            ? `Build your own · ${flight.selectionCount ?? 4} selections`
            : `${itemCount} tasting${itemCount === 1 ? "" : "s"}`}
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

      {flight.description && (
        <div style={{ display: "flex", marginTop: 40 }}>
          <span style={{ color: p.body, fontSize: 30, maxWidth: 900 }}>{flight.description}</span>
        </div>
      )}
    </div>,
    business.cardFont
  );
}
