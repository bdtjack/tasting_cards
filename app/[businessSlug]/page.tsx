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
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <div
          className="px-6 py-5 flex items-center gap-3 border-b"
          style={{ borderColor: `${business.accentColor}40` }}
        >
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt="" className="w-9 h-9 rounded-full" />
          ) : (
            <div
              className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-serif"
              style={{ borderColor: business.accentColor, color: business.accentColor }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm tracking-wider uppercase" style={{ color: business.accentColor }}>
            {business.name}
          </span>
        </div>

        <div className="px-6 pt-7 pb-2">
          <p className="font-serif text-[34px]" style={{ color: "#F5F1E8" }}>
            Menu
          </p>
        </div>

        {flights.length > 0 && (
          <div className="px-6 pb-5">
            <p className="text-xs tracking-wider uppercase mb-2.5" style={{ color: business.accentColor }}>
              Tasting flights
            </p>
            <div className="space-y-2">
              {flights.map((flight: (typeof flights)[number]) => (
                <a
                  key={flight.id}
                  href={`/${business.slug}/flights/${flight.slug}`}
                  className="block rounded-md px-4 py-2.5"
                  style={{ backgroundColor: `${business.accentColor}15` }}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-base font-medium" style={{ color: "#F5F1E8" }}>
                      {flight.name}
                    </span>
                    {flight.price && (
                      <span className="font-serif text-sm text-white flex-shrink-0">
                        {flight.price}
                      </span>
                    )}
                  </span>
                  {flight.kind === "BUILD_YOUR_OWN" && (
                    <span className="block text-xs tracking-wider uppercase mt-1" style={{ color: business.accentColor }}>
                      Build your own · pick {flight.selectionCount ?? 4}
                    </span>
                  )}
                  {flight.description && (
                    <span className="block text-sm mt-1" style={{ color: `${business.accentColor}CC` }}>
                      {flight.description}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <p className="text-xs tracking-wider uppercase mb-2.5" style={{ color: business.accentColor }}>
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
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span>
                    <span className="block text-base" style={{ color: "#F5F1E8" }}>
                      {product.name}
                    </span>
                    <span className="block text-sm" style={{ color: `${business.accentColor}AA` }}>
                      {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {product.status === "ARCHIVED" && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-md flex-shrink-0"
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
