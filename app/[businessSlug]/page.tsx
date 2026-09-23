import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Params = { businessSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { businessSlug } = await params;
  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
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

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) notFound();

  const [products, flights] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: business.id, status: { in: ["PUBLISHED", "ARCHIVED"] } },
      orderBy: [{ status: "asc" }, { name: "asc" }], // PUBLISHED sorts before ARCHIVED
    }),
    prisma.flight.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2.5 border-b"
          style={{ borderColor: `${business.accentColor}40` }}
        >
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div
              className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-serif"
              style={{ borderColor: business.accentColor, color: business.accentColor }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs tracking-wider uppercase" style={{ color: business.accentColor }}>
            {business.name}
          </span>
        </div>

        <div className="px-5 pt-5 pb-2">
          <p className="font-serif text-2xl" style={{ color: "#F5F1E8" }}>
            Menu
          </p>
        </div>

        {flights.length > 0 && (
          <div className="px-5 pb-4">
            <p className="text-[11px] tracking-wider uppercase mb-2" style={{ color: business.accentColor }}>
              Tasting flights
            </p>
            <div className="space-y-1.5">
              {flights.map((flight: (typeof flights)[number]) => (
                <a
                  key={flight.id}
                  href={`/${business.slug}/flights/${flight.slug}`}
                  className="block rounded-md px-3 py-2"
                  style={{ backgroundColor: `${business.accentColor}15` }}
                >
                  <span className="text-sm font-medium" style={{ color: "#F5F1E8" }}>
                    {flight.name}
                  </span>
                  {flight.description && (
                    <span className="block text-xs mt-0.5" style={{ color: `${business.accentColor}CC` }}>
                      {flight.description}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 pb-5">
          <p className="text-[11px] tracking-wider uppercase mb-2" style={{ color: business.accentColor }}>
            All products
          </p>
          {products.length === 0 ? (
            <p className="text-sm" style={{ color: `${business.accentColor}AA` }}>
              Nothing on the menu yet.
            </p>
          ) : (
            <div
              className="divide-y"
              style={{ borderColor: `${business.accentColor}20` }}
            >
              {products.map((product: (typeof products)[number]) => (
                <a
                  key={product.id}
                  href={`/${business.slug}/${product.slug}`}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span>
                    <span className="block text-sm" style={{ color: "#F5F1E8" }}>
                      {product.name}
                    </span>
                    <span className="block text-xs" style={{ color: `${business.accentColor}AA` }}>
                      {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {product.status === "ARCHIVED" && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${business.accentColor}20`, color: business.accentColor }}
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
