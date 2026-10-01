"use client";

import { useCardShare } from "@/lib/useCardShare";
import { buildShareCaption } from "@/lib/shareCaption";
import { cardPalette } from "@/lib/color";
import CardHeader from "@/components/CardHeader";
import { cardFontStyle } from "@/lib/cardFonts";

type Business = {
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  cardFont: string;
  mailingListLink: string | null;
  sharePhrase: string | null;
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
  const p = cardPalette(business.primaryColor, business.accentColor);

  const shareCaption = buildShareCaption({
    sharePhrase: business.sharePhrase,
    itemName: flight.name,
    businessName: business.name,
  });

  const { cardRef, saving, copied, handleSaveCard, handleShare } = useCardShare({
    fileName: `${business.name.replace(/\s+/g, "-").toLowerCase()}-${flight.name
      .replace(/\s+/g, "-")
      .toLowerCase()}.png`,
    title: `${flight.name} — ${business.name}`,
    text: shareCaption ?? `${flight.name} from ${business.name}`,
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: p.background, ...cardFontStyle(business.cardFont) }}
      >
        <CardHeader name={business.name} logoUrl={business.logoUrl} palette={p} />

        <div className="px-6 pt-7 pb-1">
          <p className="font-serif text-[34px] leading-tight" style={{ color: p.heading }}>
            {flight.name}
          </p>
          {flight.description && (
            <p className="text-base mt-1.5" style={{ color: `${p.accentText}CC` }}>
              {flight.description}
            </p>
          )}
        </div>

        <div className="px-6 pb-1 pt-4">
          <div
            className="h-px mb-4"
            style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }}
          />
        </div>

        <div className="px-6 pb-2">
          {flight.items.length === 0 ? (
            <p className="text-base" style={{ color: `${p.accentText}AA` }}>
              This flight doesn&apos;t have any products yet.
            </p>
          ) : (
            <div>
              {flight.items.map((product, i) => (
                <a
                  key={product.slug}
                  href={`/${business.slug}/${product.slug}`}
                  className={`flex items-center justify-between gap-3 py-3 ${i > 0 ? "border-t" : ""}`}
                  style={{ borderColor: `${p.accent}20` }}
                >
                  <span>
                    <span className="block text-base" style={{ color: p.heading }}>
                      {product.name}
                    </span>
                    <span className="block text-sm" style={{ color: `${p.accentText}AA` }}>
                      {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  {product.status === "ARCHIVED" && (
                    <span
                      className="text-xs px-2.5 py-1 rounded-md flex-shrink-0"
                      style={{ backgroundColor: `${p.accent}20`, color: p.accentText }}
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
            style={{ borderColor: `${p.accent}30` }}
          >
            <span className="text-base" style={{ color: p.accentText }}>
              Flight
            </span>
            <span className="font-serif text-base" style={{ color: p.heading }}>
              {flight.price}
            </span>
          </div>
        )}

        {shareCaption && (
          <div className="px-6 pt-4">
            <p
              className="font-serif italic text-sm text-center"
              style={{ color: `${p.accentText}CC` }}
            >
              {shareCaption}
            </p>
          </div>
        )}

        {/* data-no-snapshot: left out of the saved/shared image — buttons in a picture are just noise. */}
        <div className="px-6 pb-2.5 pt-3" data-no-snapshot>
          <button
            onClick={handleSaveCard}
            disabled={saving}
            className="w-full text-center text-sm px-4 py-2.5 rounded-md font-medium disabled:opacity-60"
            style={{ backgroundColor: p.accent, color: p.onAccent }}
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
              style={{ borderColor: `${p.accent}80`, color: p.accentText }}
            >
              Join the list
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
            style={{ borderColor: `${p.accent}80`, color: p.accentText }}
          >
            {copied ? "Link copied" : "Share"}
          </button>
        </div>
      </div>
    </main>
  );
}
