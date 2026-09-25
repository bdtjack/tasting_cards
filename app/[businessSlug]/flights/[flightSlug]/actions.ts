"use server";

import { prisma } from "@/lib/prisma";

/**
 * Called when a guest finishes a build-your-own flight. Only the count is
 * kept — never which products they picked. updateMany (rather than update)
 * so an unknown or preset flight id is a silent no-op instead of an error.
 */
export async function recordFlightCompletion(flightId: string): Promise<void> {
  await prisma.flight.updateMany({
    where: { id: flightId, kind: "BUILD_YOUR_OWN" },
    data: { completedCount: { increment: 1 } },
  });
}
