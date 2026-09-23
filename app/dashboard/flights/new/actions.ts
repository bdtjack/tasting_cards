"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function createFlight(formData: FormData) {
  const business = await getCurrentBusiness();
  if (!business) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Flight name is required");

  const description = String(formData.get("description") ?? "").trim() || null;
  const productIds = formData.getAll("productIds").map(String);

  await prisma.flight.create({
    data: {
      businessId: business.id,
      slug: slugify(name),
      name,
      description,
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
