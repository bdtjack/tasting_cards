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

// Business slugs become the first segment of every guest URL, so they can't
// be any word the app itself uses at the top level — /dashboard, /login,
// /api, etc. resolve to the app's own pages first, which would leave that
// business's menu and cards unreachable. The signup flow must check this
// (along with uniqueness) before creating a business.
const RESERVED_BUSINESS_SLUGS = new Set([
  "dashboard",
  "login",
  "logout",
  "signup",
  "register",
  "api",
  "admin",
  "settings",
  "account",
  "billing",
  "pricing",
  "about",
  "help",
  "support",
  "privacy",
  "terms",
  "flights",
  "opengraph-image",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "static",
  "public",
  "assets",
  "www",
]);

export function isReservedBusinessSlug(slug: string): boolean {
  return RESERVED_BUSINESS_SLUGS.has(slug.toLowerCase());
}

export function productSlugify(name: string): string {
  const slug = slugify(name);
  return RESERVED_PRODUCT_SLUGS.has(slug) ? `${slug}-product` : slug;
}
