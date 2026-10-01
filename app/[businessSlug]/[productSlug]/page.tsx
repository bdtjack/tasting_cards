import { notFound } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/json";
import { getGuestProduct } from "@/lib/queries";
import { getCurrentBusiness } from "@/lib/auth";
import { isLikelyBot } from "@/lib/bots";
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

  const found = await getGuestProduct(businessSlug, productSlug);
  if (!found || found.product.status === "DRAFT") return {};
  const { business, product } = found;

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

  const found = await getGuestProduct(businessSlug, productSlug);
  // A product in DRAFT was never published, so it should behave like it
  // doesn't exist to a guest, same as a 404.
  if (!found || found.product.status === "DRAFT") notFound();
  const { business, product } = found;

  // View log for the dashboard count. Skips link-preview bots, browser
  // prefetches, and the business's own visits (e.g. "View guest card"
  // while logged in), so the number reflects guests.
  const h = await headers();
  const isPrefetch =
    h.get("next-router-prefetch") !== null ||
    h.get("purpose") === "prefetch" ||
    h.get("sec-purpose")?.includes("prefetch");
  const viewer = await getCurrentBusiness();
  if (!isPrefetch && !isLikelyBot(h.get("user-agent")) && viewer?.id !== business.id) {
    // after() runs once the page has been sent. A plain un-awaited promise
    // can be cut off on Vercel when the function finishes, silently losing
    // the count. Errors are swallowed — analytics must never break the page.
    after(() => prisma.scan.create({ data: { productId: product.id } }).catch(() => {}));
  }

  return (
    <GuestCard
      business={{
        name: business.name,
        logoUrl: business.logoUrl,
        primaryColor: business.primaryColor,
        accentColor: business.accentColor,
        cardFont: business.cardFont,
        mailingListLink: business.mailingListLink,
        sharePhrase: business.sharePhrase,
      }}
      product={{
        slug: product.slug,
        name: product.name,
        category: product.category,
        subtitle: product.subtitle,
        showAbv: product.showAbv,
        proofAbv: product.proofAbv,
        photoUrl: product.photoUrl,
        description: product.description,
        aroma: product.aroma,
        palate: product.palate,
        finish: product.finish,
        prices: parseJsonField<Record<string, string>>(product.prices, {}),
      }}
      isArchived={product.status === "ARCHIVED"}
    />
  );
}
