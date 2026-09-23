import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/json";
import GuestCard from "@/components/GuestCard";

type Params = { businessSlug: string; productSlug: string };

// Drives the link-preview card shown by iMessage, Facebook, Instagram
// Stories, etc. when the "Share" button's URL gets pasted or forwarded.
// Those apps ignore whatever title/text navigator.share() sends — they
// re-fetch the URL and read ITS OWN metadata, so without this they all
// fall back to the generic site-wide title in app/layout.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { businessSlug, productSlug } = await params;

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) return {};

  const product = await prisma.product.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: productSlug } },
  });
  if (!product || product.status === "DRAFT") return {};

  const title = `${product.name} — ${business.name}`;
  const description =
    product.status === "ARCHIVED"
      ? `No longer available — join ${business.name}'s list to hear about the next release.`
      : [
          [product.category, product.subtitle].filter(Boolean).join(" · "),
          product.aroma,
        ]
          .filter(Boolean)
          .join(". ");

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function GuestCardPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { businessSlug, productSlug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });
  if (!business) notFound();

  const product = await prisma.product.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: productSlug } },
  });
  // A product in DRAFT was never published, so it should behave like it
  // doesn't exist to a guest, same as a 404.
  if (!product || product.status === "DRAFT") notFound();

  // Fire-and-forget scan log. Errors here should never break the guest's
  // page — analytics is a nice-to-have, not a dependency for rendering.
  prisma.scan.create({ data: { productId: product.id } }).catch(() => {});

  return (
    <GuestCard
      business={{
        name: business.name,
        logoUrl: business.logoUrl,
        primaryColor: business.primaryColor,
        accentColor: business.accentColor,
        mailingListLink: business.mailingListLink,
      }}
      product={{
        slug: product.slug,
        name: product.name,
        category: product.category,
        subtitle: product.subtitle,
        showAbv: product.showAbv,
        proofAbv: product.proofAbv,
        aroma: product.aroma,
        palate: product.palate,
        finish: product.finish,
        prices: parseJsonField<Record<string, string>>(product.prices, {}),
      }}
      isArchived={product.status === "ARCHIVED"}
    />
  );
}
