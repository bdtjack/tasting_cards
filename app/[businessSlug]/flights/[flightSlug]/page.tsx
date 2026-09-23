import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FlightCard from "@/components/FlightCard";

type Params = { businessSlug: string; flightSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { businessSlug, flightSlug } = await params;
  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) return {};

  const flight = await prisma.flight.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: flightSlug } },
  });
  if (!flight) return {};

  const title = `${flight.name} — ${business.name}`;
  const description = flight.description ?? `A curated tasting flight from ${business.name}.`;
  return { title, description, openGraph: { title, description } };
}

export default async function FlightPage({
  params,
}: {
  params: Promise<Params>;
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
    <FlightCard
      business={{
        slug: business.slug,
        name: business.name,
        logoUrl: business.logoUrl,
        primaryColor: business.primaryColor,
        accentColor: business.accentColor,
      }}
      flight={{
        name: flight.name,
        description: flight.description,
        items: flight.items.map((item: (typeof flight.items)[number]) => ({
          slug: item.product.slug,
          name: item.product.name,
          category: item.product.category,
          subtitle: item.product.subtitle,
          status: item.product.status,
        })),
      }}
    />
  );
}
