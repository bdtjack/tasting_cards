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
    },
  });

  await prisma.product.upsert({
    where: { businessId_slug: { businessId: hiddenHills.id, slug: "pinto-2022" } },
    update: {},
    create: {
      businessId: hiddenHills.id,
      slug: "pinto-2022",
      name: "Pinto",
      category: "Pinot noir",
      subtitle: "100% Pinot Noir · 2022 vintage",
      showAbv: false, // locked in from the winery category at creation time
      aroma: "Cherry, cranberry, fresh earth",
      palate: "Tart red berry, soft earthy undertone",
      finish: "Light, smooth, earthy lingering note",
      priceLabels: JSON.stringify(["Glass", "Bottle"]),
      prices: JSON.stringify({ Glass: "$12.00", Bottle: "$38.00" }),
      status: "PUBLISHED",
    },
  });

  console.log("Seeded Hidden Hills Farm and Vineyard + Pinto 2022");
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
