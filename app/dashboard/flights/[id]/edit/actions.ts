"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { readFlightPrice, readSelectionCount } from "@/lib/flightForm";

// Same tenant-isolation pattern as products: loads a flight only if it
// belongs to the current logged-in business.
async function getOwnedFlight(id: string) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const flight = await prisma.flight.findUnique({ where: { id } });
  if (!flight || flight.businessId !== business.id) {
    notFound();
  }
  return flight;
}

export async function updateFlight(formData: FormData) {
  const id = String(formData.get("id"));
  const flight = await getOwnedFlight(id); // ownership check

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Flight name is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const price = readFlightPrice(formData);

  // Build-your-own flights have no product list to replace — just the
  // number of picks guests make.
  if (flight.kind === "BUILD_YOUR_OWN") {
    await prisma.flight.update({
      where: { id },
      data: { name, description, price, selectionCount: readSelectionCount(formData) },
    });
    redirect("/dashboard/flights");
  }

  const productIds = formData.getAll("productIds").map(String);

  // Simplest correct way to apply a new product selection: replace every
  // item rather than diffing old vs. new — flights are small (a handful
  // of products), so this is cheap and avoids subtle order/duplicate bugs.
  await prisma.$transaction([
    prisma.flightItem.deleteMany({ where: { flightId: id } }),
    prisma.flight.update({
      where: { id },
      data: {
        name,
        description,
        price,
        items: {
          create: productIds.map((productId, index) => ({
            productId,
            order: index,
          })),
        },
      },
    }),
  ]);

  redirect("/dashboard/flights");
}

export async function deleteFlight(formData: FormData) {
  const id = String(formData.get("id"));
  await getOwnedFlight(id); // ownership check

  await prisma.flight.delete({ where: { id } }); // items cascade-delete

  redirect("/dashboard/flights");
}
