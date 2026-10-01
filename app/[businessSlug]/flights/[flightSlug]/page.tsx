import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getGuestFlight } from "@/lib/queries";
import FlightCard from "@/components/FlightCard";
import BuildYourOwnFlight from "@/components/BuildYourOwnFlight";
import { recordFlightCompletion } from "./actions";

type Params = { businessSlug: string; flightSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { businessSlug, flightSlug } = await params;
  const found = await getGuestFlight(businessSlug, flightSlug);
  if (!found) return {};
  const { business, flight } = found;

  const title = `${flight.name} — ${business.name}`;
  const description =
    flight.description ??
    (flight.kind === "BUILD_YOUR_OWN"
      ? `Build your own tasting flight at ${business.name}.`
      : `A curated tasting flight from ${business.name}.`);
  return { title, description, openGraph: { title, description } };
}

export default async function FlightPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { businessSlug, flightSlug } = await params;

  const found = await getGuestFlight(businessSlug, flightSlug);
  if (!found) notFound();
  const { business, flight } = found;

  const businessProps = {
    slug: business.slug,
    name: business.name,
    logoUrl: business.logoUrl,
    primaryColor: business.primaryColor,
    accentColor: business.accentColor,
    cardFont: business.cardFont,
    mailingListLink: business.mailingListLink,
    sharePhrase: business.sharePhrase,
  };

  if (flight.kind === "BUILD_YOUR_OWN") {
    // Every published product is pickable at every step. Archived ones are
    // left out entirely — a guest can't order something that's sold out.
    const products = await prisma.product.findMany({
      where: { businessId: business.id, status: "PUBLISHED" },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, category: true, subtitle: true },
    });

    return (
      <BuildYourOwnFlight
        business={businessProps}
        flight={{
          name: flight.name,
          description: flight.description,
          price: flight.price,
          selectionCount: flight.selectionCount ?? 4,
        }}
        products={products}
        onComplete={recordFlightCompletion.bind(null, flight.id)}
      />
    );
  }

  return (
    <FlightCard
      business={businessProps}
      flight={{
        name: flight.name,
        description: flight.description,
        price: flight.price,
        // A draft was never published, so guests shouldn't see it even if
        // it somehow ended up in a flight.
        items: flight.items
          .filter((item) => item.product.status !== "DRAFT")
          .map((item) => ({
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
