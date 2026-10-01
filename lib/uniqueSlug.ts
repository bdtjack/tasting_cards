import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { productSlugify, slugify } from "./slug";

/**
 * Picks the first free slug among base, base-2, base-3, … from the slugs
 * already taken. Needed because slugs must be unique per business — without
 * this, adding a second product with the same name hit the database's
 * unique constraint and showed an error page.
 */
function firstFree(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function uniqueProductSlug(businessId: string, name: string): Promise<string> {
  // A name with no letters or digits (e.g. "!!!") slugifies to "", which
  // would give the product no URL of its own.
  const base = (slugify(name) ? productSlugify(name) : "product").slice(0, 60);
  const existing = await prisma.product.findMany({
    where: { businessId, slug: { startsWith: base } },
    select: { slug: true },
  });
  return firstFree(base, new Set(existing.map((p) => p.slug)));
}

export async function uniqueFlightSlug(businessId: string, name: string): Promise<string> {
  const base = (slugify(name) || "flight").slice(0, 60);
  const existing = await prisma.flight.findMany({
    where: { businessId, slug: { startsWith: base } },
    select: { slug: true },
  });
  return firstFree(base, new Set(existing.map((f) => f.slug)));
}

/**
 * Runs `create` with a freshly picked slug, retrying with a new one if
 * another request grabbed the same slug in the moment between picking and
 * saving (the database's unique constraint is the final word). Rare, but
 * otherwise it shows an error page.
 */
export async function createWithFreshSlug<T>(
  pickSlug: () => Promise<string>,
  create: (slug: string) => Promise<T>
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const slug = await pickSlug();
    try {
      return await create(slug);
    } catch (err) {
      const slugTaken =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!slugTaken || attempt >= 3) throw err;
    }
  }
}

/**
 * Keeps only product ids that belong to this business and have been
 * published (archived ones can stay in a flight they're already in), de-
 * duplicated and in the order submitted. Without this, a hand-edited
 * flight form could attach another business's product or an unpublished
 * draft, or crash on a repeated id.
 */
export async function ownedProductIds(businessId: string, ids: string[]): Promise<string[]> {
  const unique = Array.from(new Set(ids));
  const owned = await prisma.product.findMany({
    where: { businessId, id: { in: unique }, status: { not: "DRAFT" } },
    select: { id: true },
  });
  const ownedSet = new Set(owned.map((p) => p.id));
  return unique.filter((id) => ownedSet.has(id));
}
