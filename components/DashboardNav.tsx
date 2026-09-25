"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/logout/actions";

const SECTIONS = [
  { href: "/dashboard", label: "Products" },
  { href: "/dashboard/flights", label: "Flights" },
  { href: "/dashboard/settings", label: "Settings" },
];

/**
 * The bar across the top of every dashboard page, so every section is one
 * click away no matter how deep you are (e.g. editing a flight).
 */
export default function DashboardNav({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  // Products lives at /dashboard itself, so it also owns /dashboard/products/*;
  // the other sections own their own path prefix.
  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/products");
    }
    return pathname.startsWith(href);
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 h-14 flex items-center gap-3 sm:gap-6">
        {/* Hidden on phones, where the three section links need the room. */}
        <span className="hidden sm:block text-sm font-medium truncate min-w-0">{businessName}</span>
        <nav className="flex items-center gap-0.5 sm:gap-1 flex-1">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`text-sm px-2.5 sm:px-3 py-1.5 rounded-md whitespace-nowrap ${
                isActive(section.href)
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900 whitespace-nowrap">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
