import { Fragment } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentBusiness } from "@/lib/auth";
import { baseUrlForPage, displayHost } from "@/lib/baseUrl";
import { groupProductsForMenu } from "@/lib/menuGroups";
import type { BusinessCategory } from "@/lib/types";

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
      products: { orderBy: { name: "asc" }, include: { _count: { select: { scans: true } } } },
    },
  });

  // Grouped exactly like the guest menu (Wine → Red / White …, Spirits →
  // Whiskey / Gin …), alphabetical within each group. Drafts sit alongside
  // published products in the group they'll appear in once published.
  const sections = groupProductsForMenu(business.products, business.category as BusinessCategory);

  const menuQrTarget = `${displayHost(await baseUrlForPage())}/${business.slug}`;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">Products</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/products/new"
            className="text-sm px-4 py-2 bg-neutral-900 text-white rounded-md"
          >
            Add product
          </Link>
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
            product&apos;s own code.
          </p>
          <p className="text-xs text-neutral-400 truncate">Points to {menuQrTarget}</p>
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
        <div>
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.key}>
                {/* Section name on the left; column labels lined up with the rows below. */}
                <div className="flex items-end gap-4 px-4 mb-2">
                  <h2 className="flex-1 min-w-0">
                    <span className="text-base font-medium text-neutral-900">{section.label}</span>
                    <span className="text-xs text-neutral-400 ml-2">
                      {section.count} product{section.count === 1 ? "" : "s"}
                    </span>
                  </h2>
                  <span className="w-20 text-center text-xs text-neutral-400">Status</span>
                  <span
                    className="w-12 text-right text-xs text-neutral-400"
                    title="Guest page views — not counting link-preview bots or your own visits while logged in"
                  >
                    Views
                  </span>
                  <span className="w-[52px]" />
                </div>
                <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-200 bg-white overflow-hidden">
                  {section.groups.map((group) => (
                    <Fragment key={group.key}>
                      {group.label && (
                        <div className="px-4 py-1.5 bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
                          {group.label}
                        </div>
                      )}
                      {group.products.map((product) => (
                        <div key={product.id} className="flex items-center gap-4 p-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-neutral-500">
                              {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <span
                            className={`text-xs w-20 text-center py-1 rounded-md ${STATUS_STYLES[product.status]}`}
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
                    </Fragment>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
