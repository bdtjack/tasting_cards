"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { readFlightPrice, readSelectionCount } from "@/lib/flightForm";

export async function createFlight(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Flight name is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const price = readFlightPrice(formData);
  const productIds = formData.getAll("productIds").map(String);

  await prisma.flight.create({
    data: {
      businessId: business.id,
      slug: slugify(name),
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

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Flight name is required");

  const description = String(formData.get("description") ?? "").trim() || null;

  await prisma.flight.create({
    data: {
      businessId: business.id,
      slug: slugify(name),
      name,
      description,
      kind: "BUILD_YOUR_OWN",
      price: readFlightPrice(formData),
      selectionCount: readSelectionCount(formData),
    },
  });

  redirect("/dashboard/flights");
}
