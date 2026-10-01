import { cache } from "react";
import { prisma } from "./prisma";

// Guest pages look the same records up twice per request — once in
// generateMetadata (for the page title / link preview) and once to render
// the page. React's cache() makes the second lookup reuse the first.

export const getBusinessBySlug = cache((slug: string) =>
  prisma.business.findUnique({ where: { slug } })
);

export const getGuestProduct = cache(async (businessSlug: string, productSlug: string) => {
  const business = await getBusinessBySlug(businessSlug);
  if (!business) return null;
  const product = await prisma.product.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: productSlug } },
  });
  return product ? { business, product } : null;
});

export const getGuestFlight = cache(async (businessSlug: string, flightSlug: string) => {
  const business = await getBusinessBySlug(businessSlug);
  if (!business) return null;
  const flight = await prisma.flight.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: flightSlug } },
    include: { items: { include: { product: true }, orderBy: { order: "asc" } } },
  });
  return flight ? { business, flight } : null;
});
