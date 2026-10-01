// Creates the demo business (see prisma/demoData.ts) — a fictional mixed
// tasting room with wine, spirits, beer, cocktails and flights, for showing
// prospective customers.
//
//   npm run db:seed:demo
//
// Safe to re-run: anything that already exists is left exactly as it is
// (so edits you make in the dashboard stick), and only missing pieces are
// added. Menu: /demo   Login: printed below the first time it's created.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { defaultShowAbv, getPriceLabels } from "../lib/fields";
import { isSubtypeFor } from "../lib/subtypes";
import { LIMITS } from "../lib/validate";
import {
  DEMO_BUILD_YOUR_OWN,
  DEMO_BUSINESS,
  DEMO_FLIGHTS,
  DEMO_PRODUCTS,
  type DemoProduct,
} from "./demoData";

const prisma = new PrismaClient();

/** Catch typos in demoData.ts before anything is written. */
function checkData(products: DemoProduct[]) {
  const problems: string[] = [];
  for (const p of products) {
    const labels = getPriceLabels(p.type);
    if (!isSubtypeFor(p.type, p.subtype)) problems.push(`${p.slug}: unknown style "${p.subtype}"`);
    for (const key of Object.keys(p.prices)) {
      if (!labels.includes(key)) problems.push(`${p.slug}: price "${key}" isn't one of ${labels.join("/")}`);
    }
    const lengths: [string, string | undefined, number][] = [
      ["name", p.name, LIMITS.name],
      ["category", p.category, LIMITS.category],
      ["subtitle", p.subtitle, LIMITS.subtitle],
      ["description", p.description, LIMITS.description],
      ["aroma", p.aroma, LIMITS.note],
      ["palate", p.palate, LIMITS.note],
      ["finish", p.finish, LIMITS.note],
    ];
    for (const [field, value, max] of lengths) {
      if (value && value.length > max) problems.push(`${p.slug}: ${field} is over ${max} characters`);
    }
  }
  if (problems.length) throw new Error("demoData.ts has problems:\n" + problems.join("\n"));
}

async function main() {
  checkData(DEMO_PRODUCTS);

  const existing = await prisma.business.findUnique({ where: { slug: DEMO_BUSINESS.slug } });
  const password = process.env.SEED_PASSWORD ?? randomBytes(9).toString("base64url");

  const business =
    existing ??
    (await prisma.business.create({
      data: { ...DEMO_BUSINESS, passwordHash: await bcrypt.hash(password, 10) },
    }));

  let added = 0;
  const idBySlug = new Map<string, string>();
  for (const p of DEMO_PRODUCTS) {
    const before = await prisma.product.findUnique({
      where: { businessId_slug: { businessId: business.id, slug: p.slug } },
      select: { id: true },
    });
    const product =
      before ??
      (await prisma.product.create({
        data: {
          businessId: business.id,
          slug: p.slug,
          name: p.name,
          productType: p.type,
          subtype: p.subtype,
          category: p.category,
          subtitle: p.subtitle ?? null,
          showAbv: defaultShowAbv(p.type),
          proofAbv: p.proofAbv ?? null,
          description: p.description ?? null,
          aroma: p.aroma ?? null,
          palate: p.palate ?? null,
          finish: p.finish ?? null,
          priceLabels: JSON.stringify(getPriceLabels(p.type)),
          prices: JSON.stringify(p.prices),
          status: p.archived ? "ARCHIVED" : "PUBLISHED",
        },
        select: { id: true },
      }));
    if (!before) added++;
    idBySlug.set(p.slug, product.id);
  }

  for (const f of DEMO_FLIGHTS) {
    const before = await prisma.flight.findUnique({
      where: { businessId_slug: { businessId: business.id, slug: f.slug } },
    });
    if (before) continue;
    await prisma.flight.create({
      data: {
        businessId: business.id,
        slug: f.slug,
        name: f.name,
        description: f.description,
        price: f.price,
        kind: "PRESET",
        items: {
          create: f.productSlugs.map((slug, order) => ({ productId: idBySlug.get(slug)!, order })),
        },
      },
    });
    added++;
  }

  const byo = await prisma.flight.findUnique({
    where: { businessId_slug: { businessId: business.id, slug: DEMO_BUILD_YOUR_OWN.slug } },
  });
  if (!byo) {
    await prisma.flight.create({
      data: { businessId: business.id, kind: "BUILD_YOUR_OWN", ...DEMO_BUILD_YOUR_OWN },
    });
    added++;
  }

  console.log(
    existing
      ? `Demo business already existed — added ${added} missing item(s), left everything else alone.`
      : `Created "${DEMO_BUSINESS.name}" with ${added} products and flights.`
  );
  console.log(`Menu: /${DEMO_BUSINESS.slug}`);
  if (!existing) {
    console.log(`Log in at /login with: ${DEMO_BUSINESS.email} / ${password}`);
    console.log("(Save that password — it's only shown this once. Change it in Settings anytime.)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
