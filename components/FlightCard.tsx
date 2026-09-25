"use client";

import { useCardShare } from "@/lib/useCardShare";

type Business = {
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  mailingListLink: string | null;
};

type FlightProduct = {
  slug: string;
  name: string;
  category: string;
  subtitle: string | null;
  status: string;
};

type Flight = {
  name: string;
  description: string | null;
  price: string | null;
  items: FlightProduct[];
};

export default function FlightCard({ business, flight }: { business: Business; flight: Flight }) {
  const { cardRef, saving, copied, handleSaveCard, handleShare } = useCardShare({
    fileName: `${business.name.replace(/\s+/g, "-").toLowerCase()}-${flight.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`,
    title: `${flight.name} — ${business.name}`,
    text: `${flight.name} from ${business.name}`,
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <div
          className="px-6 py-5 flex items-center gap-3 border-b"
          style={{ borderColor: `${business.accentColor}40` }}
        >
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt="" className="w-9 h-9 rounded-full" crossOrigin="anonymous" />
          ) : (
            <div
              className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-serif"
              style={{ borderColor: business.accentColor, color: business.accentColor }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm tracking-wider uppercase" style={{ color: business.accentColor }}>
            {business.name}
          </span>
        </div>

        <div className="px-6 pt-7 pb-1">
          <p className="font-serif text-[34px] leading-tight" style={{ color: "#F5F1E8" }}>
            {flight.name}
          </p>
          {flight.description && (
            <p className="text-base mt-1.5" style={{ color: `${business.accentColor}CC` }}>
              {flight.description}
            </p>
          )}
        </div>

        <div className="px-6 pb-1 pt-4">
          <div
            className="h-px mb-4"
            style={{ background: `linear-gradient(90deg, ${business.accentColor}, transparent)` }}
          />
        </div>

        <div className="px-6 pb-2">
          {flight.items.length === 0 ? (
            <p className="text-base" style={{ color: `${business.accentColor}AA` }}>
              This flight doesn&apos;t have any products yet.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: `${business.accentColor}20` }}>
              {flight.items.map((product) => (
                <a
                  key={product.slug}
                  href={`/${business.slug}/${product.slug}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <span>
                    <span className="block text-base" style={{ color: "#F5F1E8" }}>
                      {product.name}
                    </span>
                    <span className="block text-sm" style={{ color: `${business.accentColor}AA` }}>
                      {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {product.status === "ARCHIVED" && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${business.accentColor}20`, color: business.accentColor }}
                    >
                      Sold out
                    </span>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        {flight.price && (
          <div
            className="mx-6 mt-2 pt-3 border-t flex items-baseline gap-2"
            style={{ borderColor: `${business.accentColor}30` }}
          >
            <span className="text-base" style={{ color: business.accentColor }}>
              Flight
            </span>
            <span className="font-serif text-base text-white">{flight.price}</span>
          </div>
        )}

        {/* data-no-snapshot: left out of the saved/shared image — buttons in a picture are just noise. */}
        <div className="px-6 pb-2.5 pt-3" data-no-snapshot>
          <button
            onClick={handleSaveCard}
            disabled={saving}
            className="w-full text-center text-sm px-4 py-2.5 rounded-md font-medium disabled:opacity-60"
            style={{ backgroundColor: business.accentColor, color: "#0D0D0D" }}
          >
            {saving ? "Saving…" : "Save card"}
          </button>
        </div>

        <div className="px-6 pb-6 flex gap-2.5" data-no-snapshot>
          {business.mailingListLink && (
            <a
              href={business.mailingListLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
              style={{ borderColor: `${business.accentColor}80`, color: business.accentColor }}
            >
              Join the list
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
            style={{ borderColor: `${business.accentColor}80`, color: business.accentColor }}
          >
            {copied ? "Link copied" : "Share"}
          </button>
        </div>
      </div>
    </main>
  );
}
