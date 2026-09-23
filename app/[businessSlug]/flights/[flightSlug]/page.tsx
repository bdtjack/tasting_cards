import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function FlightPage({
  params,
}: {
  params: Promise<{ businessSlug: string; flightSlug: string }>;
}) {
  const { businessSlug, flightSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) notFound();

  const flight = await prisma.flight.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: flightSlug } },
    include: { items: { include: { product: true }, orderBy: { order: "asc" } } },
  });
  if (!flight) notFound();

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

        <div className="px-5 pt-5 pb-1">
          <p className="font-serif text-2xl" style={{ color: "#F5F1E8" }}>
            {flight.name}
          </p>
          {flight.description && (
            <p className="text-sm mt-1" style={{ color: `${business.accentColor}CC` }}>
              {flight.description}
            </p>
          )}
        </div>

        <div className="px-5 pb-1 pt-3">
          <div
            className="h-px mb-3"
            style={{ background: `linear-gradient(90deg, ${business.accentColor}, transparent)` }}
          />
        </div>

        <div className="px-5 pb-5">
          {flight.items.length === 0 ? (
            <p className="text-sm" style={{ color: `${business.accentColor}AA` }}>
              This flight doesn&apos;t have any products yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: `${business.accentColor}20` }}>
              {flight.items.map(({ product }: (typeof flight.items)[number]) => (
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
