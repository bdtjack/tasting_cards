import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBusinessBySlug } from "@/lib/queries";
import { cardPalette } from "@/lib/color";
import CardHeader from "@/components/CardHeader";
import { cardFontStyle } from "@/lib/cardFonts";

type Params = { businessSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await getBusinessBySlug(businessSlug);
  if (!business) return {};

  const title = `${business.name} — Menu`;
  const description = `See what's being poured at ${business.name}.`;
  return { title, description, openGraph: { title, description } };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { businessSlug } = await params;

  const business = await getBusinessBySlug(businessSlug);
  if (!business) notFound();

  const [products, allFlights] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id, status: { in: ["PUBLISHED", "ARCHIVED"] } },
      orderBy: [{ status: "desc" }, { name: "asc" }], // PUBLISHED sorts before ARCHIVED
    }),
    prisma.flight.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "asc" },
      include: { items: { select: { product: { select: { status: true } } } } },
    }),
  ]);

  // Only list flights a guest can actually order: a preset flight needs at
  // least one product still available, and build-your-own needs something
  // published to pick from. (Their own pages and QR codes keep working.)
  const hasPublished = products.some((product) => product.status === "PUBLISHED");
  const flights = allFlights.filter((flight) =>
    flight.kind === "BUILD_YOUR_OWN"
      ? hasPublished
      : flight.items.some((item) => item.product.status === "PUBLISHED")
  );

  const p = cardPalette(business.primaryColor, business.accentColor);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: p.background, ...cardFontStyle(business.cardFont) }}
      >
        <CardHeader name={business.name} logoUrl={business.logoUrl} palette={p} />

        <div className="px-6 pt-7 pb-2">
          <p className="font-serif text-[34px]" style={{ color: p.heading }}>
            Menu
          </p>
        </div>

        {flights.length > 0 && (
          <div className="px-6 pb-5">
            <p className="text-xs tracking-wider uppercase mb-2.5" style={{ color: p.accentText }}>
              Tasting flights
            </p>
            <div className="space-y-2">
              {flights.map((flight) => (
                <a
                  key={flight.id}
                  href={`/${business.slug}/flights/${flight.slug}`}
                  className="block rounded-md px-4 py-2.5"
                  style={{ backgroundColor: `${p.accent}15` }}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-base font-medium" style={{ color: p.heading }}>
                      {flight.name}
                    </span>
                    {flight.price && (
                      <span className="font-serif text-sm flex-shrink-0" style={{ color: p.heading }}>
                        {flight.price}
                      </span>
                    )}
                  </span>
                  {flight.kind === "BUILD_YOUR_OWN" && (
                    <span className="block text-xs tracking-wider uppercase mt-1" style={{ color: p.accentText }}>
                      Build your own · pick {flight.selectionCount ?? 4}
                    </span>
                  )}
                  {flight.description && (
                    <span className="block text-sm mt-1" style={{ color: `${p.accentText}CC` }}>
                      {flight.description}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <p className="text-xs tracking-wider uppercase mb-2.5" style={{ color: p.accentText }}>
            All products
          </p>
          {products.length === 0 ? (
            <p className="text-sm" style={{ color: `${p.accentText}AA` }}>
              Nothing on the menu yet.
            </p>
          ) : (
            <div>
              {products.map((product, i) => (
                <a
                  key={product.id}
                  href={`/${business.slug}/${product.slug}`}
                  className={`flex items-center justify-between gap-3 py-3 ${i > 0 ? "border-t" : ""}`}
                  style={{ borderColor: `${p.accent}20` }}
                >
                  <span>
                    <span className="block text-base" style={{ color: p.heading }}>
                      {product.name}
                    </span>
                    <span className="block text-sm" style={{ color: `${p.accentText}AA` }}>
                      {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {product.status === "ARCHIVED" && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${p.accent}20`, color: p.accentText }}
                    >
                      Sold out
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
