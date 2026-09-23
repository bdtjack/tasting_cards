export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// "flights" is a reserved product slug — the guest-facing route
// /[businessSlug]/flights/[flightSlug] would otherwise collide with a
// product at /[businessSlug]/flights (Next.js resolves the literal
// "flights" folder ahead of the [productSlug] dynamic segment, so a
// product actually named "Flights" would become permanently unreachable
// at its own URL rather than causing an obvious error).
const RESERVED_PRODUCT_SLUGS = new Set(["flights"]);

export function productSlugify(name: string): string {
  const slug = slugify(name);
  return RESERVED_PRODUCT_SLUGS.has(slug) ? `${slug}-product` : slug;
}
