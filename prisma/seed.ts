import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Change this after your first login — it's only here so the seeded
// account has something to log in with on day one.
const SEED_PASSWORD = "changeme123";

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const hiddenHills = await prisma.business.upsert({
    where: { slug: "hidden-hills" },
    update: {},
    create: {
      name: "Hidden Hills Farm and Vineyard",
      slug: "hidden-hills",
      category: "WINERY",
      email: "owner@hiddenhills.example",
      passwordHash,
      primaryColor: "#0D0D0D",
      accentColor: "#C9A24B",
      mailingListLink: "https://example.com/hidden-hills-newsletter",
    },
  });

  const pinto = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "pinto-2022" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "pinto-2022",
      name: "Pinto",
      category: "Pinot noir",
      subtitle: "2022 vintage",
      showAbv: false, // locked in from the winery category at creation time
      aroma: "Cherry, cranberry, fresh earth",
      palate: "Tart red berry, soft earthy undertone",
      finish: "Light, smooth, earthy lingering note",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$12.00", Bottle: "$38.00" }),
      status: "PUBLISHED",
    },
  });

  const reserveRed = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "reserve-estate-red" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "reserve-estate-red",
      name: "Reserve Estate Red",
      category: "Cabernet sauvignon",
      subtitle: "2022 vintage",
      showAbv: false,
      aroma: "Black cherry, tobacco, violet",
      palate: "Blackberry, cedar, soft tannins",
      finish: "Long, with lingering oak and dark fruit",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$14.00", Bottle: "$42.00" }),
      status: "PUBLISHED",
    },
  });

  const chardonnay = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "sundial-chardonnay-2023" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "sundial-chardonnay-2023",
      name: "Sundial Chardonnay",
      category: "Chardonnay",
      subtitle: "2023 vintage",
      showAbv: false,
      aroma: "Golden apple, vanilla, toasted oak",
      palate: "Baked pear, butterscotch, soft citrus",
      finish: "Round and creamy with a warm oak note",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$13.00", Bottle: "$40.00" }),
      status: "PUBLISHED",
    },
  });

  const sauvignonBlanc = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "meadow-sauvignon-blanc-2023" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "meadow-sauvignon-blanc-2023",
      name: "Meadow Sauvignon Blanc",
      category: "Sauvignon blanc",
      subtitle: "2023 vintage",
      showAbv: false,
      aroma: "Fresh cut grass, lime zest, white peach",
      palate: "Crisp grapefruit, green apple, mineral edge",
      finish: "Clean and bright with a snappy citrus finish",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$12.00", Bottle: "$36.00" }),
      status: "PUBLISHED",
    },
  });

  const estateRose = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "estate-rose-2023" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "estate-rose-2023",
      name: "Estate Rosé",
      category: "Rosé",
      subtitle: "2023 vintage",
      showAbv: false,
      aroma: "Strawberry, watermelon, wild rose",
      palate: "Ripe stone fruit, light citrus, subtle minerality",
      finish: "Dry and refreshing with a delicate berry echo",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$11.00", Bottle: "$34.00" }),
      status: "PUBLISHED",
    },
  });

  const merlot = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "hillside-merlot-2021" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "hillside-merlot-2021",
      name: "Hillside Merlot",
      category: "Merlot",
      subtitle: "2021 vintage",
      showAbv: false,
      aroma: "Plum, red currant, cocoa",
      palate: "Soft black cherry, mocha, gentle spice",
      finish: "Smooth and velvety with a mellow fruit finish",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$13.00", Bottle: "$39.00" }),
      status: "PUBLISHED",
    },
  });

  const syrah = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "blackridge-syrah-2021" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "blackridge-syrah-2021",
      name: "Blackridge Syrah",
      category: "Syrah",
      subtitle: "2021 vintage",
      showAbv: false,
      aroma: "Blackberry, cracked pepper, smoked meat",
      palate: "Dark plum, clove, charred oak",
      finish: "Bold and peppery with a long smoky tail",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$15.00", Bottle: "$45.00" }),
      status: "PUBLISHED",
    },
  });

  const riesling = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "orchard-riesling-2023" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "orchard-riesling-2023",
      name: "Orchard Riesling",
      category: "Riesling",
      subtitle: "2023 vintage, off-dry",
      showAbv: false,
      aroma: "Honeysuckle, green apple, apricot",
      palate: "Juicy peach, light honey, racy acidity",
      finish: "Off-dry and lively with a lingering orchard-fruit sweetness",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$12.00", Bottle: "$35.00" }),
      status: "PUBLISHED",
    },
  });

  const zinfandel = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "old-vine-zinfandel-2021" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "old-vine-zinfandel-2021",
      name: "Old Vine Zinfandel",
      category: "Zinfandel",
      subtitle: "2021 vintage",
      showAbv: false,
      aroma: "Blackberry jam, brown sugar, baking spice",
      palate: "Ripe boysenberry, black pepper, licorice",
      finish: "Jammy and warm with a spiced, lingering close",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$14.00", Bottle: "$42.00" }),
      status: "PUBLISHED",
    },
  });

  const lateHarvest = await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "late-harvest-vidal-blanc-2022" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "late-harvest-vidal-blanc-2022",
      name: "Late Harvest Vidal Blanc",
      category: "Vidal blanc",
      subtitle: "2022 vintage, dessert wine",
      showAbv: false,
      aroma: "Honeyed apricot, orange marmalade, jasmine",
      palate: "Rich dried fruit, honey, candied citrus peel",
      finish: "Lusciously sweet with a long, syrupy finish",
      priceLabels: JSON.stringify(["Glass", "Bottle (375ml)"]),
      prices: JSON.stringify({ Glass: "$9.00", "Bottle (375ml)": "$28.00" }),
      status: "PUBLISHED",
    },
  });

  const reserveFlight = await prisma.flight.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "reserve-flight" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "reserve-flight",
      name: "Reserve Flight",
      description: "Our two boldest reds, poured together.",
    },
  });

  // Re-running the seed shouldn't duplicate flight items.
  await prisma.flightItem.deleteMany({ where: { flightId: reserveFlight.id } });
  await prisma.flightItem.createMany({
    data: [
      { flightId: reserveFlight.id, productId: pinto.id, order: 0 },
      { flightId: reserveFlight.id, productId: reserveRed.id, order: 1 },
    ],
  });

  console.log("Seeded Hidden Hills Farm and Vineyard + 10 products + Reserve Flight");
  console.log(`Log in at /login with: owner@hiddenhills.example / ${SEED_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
