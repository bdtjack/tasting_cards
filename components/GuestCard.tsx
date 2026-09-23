"use client";

import { useCardShare } from "@/lib/useCardShare";

type Business = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  mailingListLink: string | null;
};

type Product = {
  slug: string;
  name: string;
  category: string;
  subtitle: string | null;
  showAbv: boolean;
  proofAbv: string | null;
  aroma: string | null;
  palate: string | null;
  finish: string | null;
  prices: Record<string, string>;
};

export default function GuestCard({
  business,
  product,
  isArchived,
}: {
  business: Business;
  product: Product;
  isArchived: boolean;
}) {
  const { cardRef, saving, copied, handleSaveCard, handleShare } = useCardShare({
    fileName: `${business.name.replace(/\s+/g, "-").toLowerCase()}-${product.slug}.png`,
    title: `${product.name} — ${business.name}`,
    text: `${product.name} from ${business.name}`,
  });

  const priceEntries = Object.entries(product.prices).filter(([, value]) => value);

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

        <div className="px-6 pt-8 pb-1">
          <p className="font-serif text-[40px] leading-tight" style={{ color: "#F5F1E8" }}>
            {product.name}
          </p>
          <p className="text-base mt-1.5" style={{ color: business.accentColor }}>
            {[product.category, product.subtitle].filter(Boolean).join(" · ").toUpperCase()}
          </p>
        </div>

        {isArchived ? (
          <ArchivedBody accentColor={business.accentColor} mailingListLink={business.mailingListLink} />
        ) : (
          <>
            <div className="px-6 pb-1">
              <div
                className="h-px my-4"
                style={{ background: `linear-gradient(90deg, ${business.accentColor}, transparent)` }}
              />
            </div>

            <div className="px-6 pb-2 space-y-5">
              {product.showAbv && product.proofAbv && (
                <NoteRow label="Proof / ABV" value={product.proofAbv} accentColor={business.accentColor} />
              )}
              {product.aroma && <NoteRow label="Aroma" value={product.aroma} accentColor={business.accentColor} />}
              {product.palate && <NoteRow label="Palate" value={product.palate} accentColor={business.accentColor} />}
              {product.finish && <NoteRow label="Finish" value={product.finish} accentColor={business.accentColor} />}
            </div>

            <div
              className="px-6 pt-5 pb-2.5 flex items-center justify-between border-t"
              style={{ borderColor: `${business.accentColor}30` }}
            >
              {priceEntries.length > 0 ? (
                <div className="flex items-baseline gap-4">
                  {priceEntries.map(([label, value]) => (
                    <span key={label} className="text-base">
                      <span style={{ color: business.accentColor }}>{label}</span>{" "}
                      <span className="font-serif text-white">{value}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span />
              )}
              <button
                onClick={handleSaveCard}
                data-no-snapshot
                disabled={saving}
                className="text-sm px-4 py-2.5 rounded-md font-medium disabled:opacity-60"
                style={{ backgroundColor: business.accentColor, color: "#0D0D0D" }}
              >
                {saving ? "Saving…" : "Save card"}
              </button>
            </div>

            {/* data-no-snapshot: left out of the saved/shared image — buttons in a picture are just noise. */}
            <div className="px-6 pb-6 pt-1.5 flex gap-2.5" data-no-snapshot>
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
          </>
        )}
      </div>
    </main>
  );
}

function ArchivedBody({
  accentColor,
  mailingListLink,
}: {
  accentColor: string;
  mailingListLink: string | null;
}) {
  return (
    <>
      <div className="px-6 pb-1">
        <span
          className="inline-block text-sm px-3 py-1.5 rounded-md"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          No longer available
        </span>
      </div>
      <div className="px-6 pt-5 pb-2">
        <p className="text-base leading-relaxed" style={{ color: `${accentColor}CC` }}>
          This vintage sold out. Join the list below to hear first when the next release
          drops.
        </p>
      </div>
      {mailingListLink && (
        <div className="px-6 pt-4 pb-6">
          <a
            href={mailingListLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-base py-3 rounded-md font-medium"
            style={{ backgroundColor: accentColor, color: "#0D0D0D" }}
          >
            Join the list
          </a>
        </div>
      )}
    </>
  );
}

function NoteRow({ label, value, accentColor }: { label: string; value: string; accentColor: string }) {
  return (
    <div>
      <p className="text-sm tracking-wider uppercase mb-1" style={{ color: accentColor }}>
        {label}
      </p>
      <p className="text-base text-neutral-100">{value}</p>
    </div>
  );
}
