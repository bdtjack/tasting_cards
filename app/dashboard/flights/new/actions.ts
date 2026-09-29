"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { ownedProductIds, uniqueFlightSlug } from "@/lib/uniqueSlug";
import { LIMITS, cleanText, optionalText } from "@/lib/validate";
import { readFlightPrice, readSelectionCount } from "@/lib/flightForm";

export async function createFlight(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) throw new Error("Flight name is required");

  const description = optionalText(formData.get("description"), LIMITS.flightDescription);
  const price = readFlightPrice(formData);
  const productIds = await ownedProductIds(business.id, formData.getAll("productIds").map(String));

  await prisma.flight.create({
    data: {
      businessId: business.id,
      slug: await uniqueFlightSlug(business.id, name),
      name,
      description,
      kind: "PRESET",
      price,
      items: {
        create: productIds.map((productId, index) => ({
          productId,
          order: index,
        })),
      },
    },
  });

  redirect("/dashboard/flights");
}

// A build-your-own flight has no FlightItem rows: the guest picks from
// every published product at scan time, so there's nothing to store here
// beyond how many picks to ask for.
export async function createBuildYourOwnFlight(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = cleanText(formData.get("name"), LIMITS.name);
  if (!name) throw new Error("Flight name is required");

  const description = optionalText(formData.get("description"), LIMITS.flightDescription);

  await prisma.flight.create({
    data: {
      businessId: business.id,
      slug: await uniqueFlightSlug(business.id, name),
      name,
      description,
      kind: "BUILD_YOUR_OWN",
      price: readFlightPrice(formData),
      selectionCount: readSelectionCount(formData),
    },
  });

  redirect("/dashboard/flights");
}
