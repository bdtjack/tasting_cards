import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";

export default async function FlightsPage() {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) redirect("/login");

  const flights = await prisma.flight.findMany({
    where: { businessId: currentBusiness.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-medium">Flights</h1>
        <Link href="/dashboard" className="text-sm text-neutral-500">
          Back to dashboard
        </Link>
      </div>
      <p className="text-sm text-neutral-500 mb-6">
        A tasting selection with its own QR code. Pick the products yourself,
        or let guests build their own.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/flights/new"
          className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-md"
        >
          Create flight
        </Link>
        <Link
          href="/dashboard/flights/new?type=build-your-own"
          className="text-sm px-4 py-2 border border-neutral-300 rounded-md bg-white"
        >
          Create build-your-own flight
        </Link>
      </div>

      {flights.length === 0 ? (
        <div className="border border-neutral-200 rounded-xl p-12 text-center">
          <p className="font-medium mb-1">No flights yet</p>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Group a few products into a themed tasting, like a &quot;Reserve
            Flight&quot;, or set up a build-your-own flight where guests pick
            their own pours.
          </p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200 bg-white">
          {flights.map((flight: (typeof flights)[number]) => {
            const isBuildYourOwn = flight.kind === "BUILD_YOUR_OWN";
            const details = isBuildYourOwn
              ? [
                  `Build your own · ${flight.selectionCount ?? 0} selections`,
                  flight.price,
                  `Built ${flight.completedCount} time${flight.completedCount === 1 ? "" : "s"}`,
                ]
              : [
                  `${flight._count.items} product${flight._count.items === 1 ? "" : "s"}`,
                  flight.price,
                ];
            return (
              <div key={flight.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{flight.name}</p>
                  <p className="text-xs text-neutral-500">
                    {details.filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Link
                  href={`/dashboard/flights/${flight.id}/edit`}
                  className="text-sm px-3 py-1.5 border border-neutral-300 rounded-md"
                >
                  Edit
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
