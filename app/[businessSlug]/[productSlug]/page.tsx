import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/json";
import GuestCard from "@/components/GuestCard";

export default async function GuestCardPage({
  params,
}: {
  params: Promise<{ businessSlug: string; productSlug: string }>;
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
        mailingListLink: product.mailingListLink,
      }}
      isArchived={product.status === "ARCHIVED"}
    />
  );
}
