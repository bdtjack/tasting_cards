import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { logout } from "@/app/logout/actions";

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-800",
  DRAFT: "bg-neutral-200 text-neutral-700",
  ARCHIVED: "bg-neutral-100 text-neutral-500",
};

export default async function DashboardPage() {
  const currentBusiness = await getCurrentBusiness();
  if (!currentBusiness) redirect("/login");

  const business = await prisma.business.findUniqueOrThrow({
    where: { id: currentBusiness.id },
    include: {
      products: { orderBy: { createdAt: "desc" }, include: { _count: { select: { scans: true } } } },
    },
  });

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Products</h1>
          <p className="text-sm text-neutral-500">{business.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="text-sm px-3 py-2 border border-neutral-300 rounded-md"
          >
            Settings
          </Link>
          <Link
            href="/dashboard/flights"
            className="text-sm px-3 py-2 border border-neutral-300 rounded-md"
          >
            Flights
          </Link>
          <Link
            href="/dashboard/products/new"
            className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-md"
          >
            Add product
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm px-3 py-2 text-neutral-500">
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 border border-neutral-200 rounded-xl p-4 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/qr/menu/${business.slug}`}
          alt="Menu QR code"
          className="w-16 h-16 border border-neutral-200 rounded-md bg-white p-1 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Full menu QR code</p>
          <p className="text-xs text-neutral-500">
            One QR for everything currently published — separate from each
            product's own code.
          </p>
        </div>
        <a
          href={`/api/qr/menu/${business.slug}`}
          download
          className="text-sm px-3 py-1.5 border border-neutral-300 rounded-md flex-shrink-0"
        >
          Download PNG
        </a>
      </div>

      {business.products.length === 0 ? (
        <div className="border border-neutral-200 rounded-xl p-12 text-center">
          <p className="font-medium mb-1">Add your first product</p>
          <p className="text-sm text-neutral-500 mb-5 max-w-sm mx-auto">
            Enter a wine&apos;s details once and get a QR code guests can scan to see
            it. Edit anytime without reprinting anything.
          </p>
          <Link
            href="/dashboard/products/new"
            className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-md"
          >
            Add product
          </Link>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200 bg-white">
          {business.products.map((product: (typeof business.products)[number]) => (
            <div key={product.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-neutral-500">{product.category}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-md ${STATUS_STYLES[product.status]}`}
              >
                {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
              </span>
              <span className="text-sm text-neutral-500 w-12 text-right">
                {product.status === "DRAFT" ? "—" : product._count.scans}
              </span>
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="text-sm px-3 py-1.5 border border-neutral-300 rounded-md"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
