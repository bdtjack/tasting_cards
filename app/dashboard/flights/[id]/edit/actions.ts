"use server";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";

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
  await getOwnedFlight(id); // ownership check

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Flight name is required");

  const description = String(formData.get("description") ?? "").trim() || null;
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
