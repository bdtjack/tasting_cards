"use client";

import { useCardShare } from "@/lib/useCardShare";
import { buildShareCaption } from "@/lib/shareCaption";
import { cardPalette, type CardPalette } from "@/lib/color";
import CardHeader from "@/components/CardHeader";
import { cardFontStyle } from "@/lib/cardFonts";

type Business = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  cardFont: string;
  mailingListLink: string | null;
  sharePhrase: string | null;
};

type Product = {
  slug: string;
  name: string;
  category: string;
  subtitle: string | null;
  showAbv: boolean;
  proofAbv: string | null;
  photoUrl: string | null;
  description: string | null;
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
  const p = cardPalette(business.primaryColor, business.accentColor);

  const shareCaption = buildShareCaption({
    sharePhrase: business.sharePhrase,
    itemName: product.name,
    businessName: business.name,
  });

  const { cardRef, saving, copied, handleSaveCard, handleShare } = useCardShare({
    fileName: `${business.name.replace(/\s+/g, "-").toLowerCase()}-${product.slug}.png`,
    title: `${product.name} — ${business.name}`,
    text: shareCaption ?? `${product.name} from ${business.name}`,
  });

  const hasPhoto = Boolean(product.photoUrl);
  const priceEntries = Object.entries(product.prices).filter(([, value]) => value);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: p.background, ...cardFontStyle(business.cardFont) }}
      >
        <CardHeader name={business.name} logoUrl={business.logoUrl} palette={p} />

        {/*
          With a photo: photo on the right, name + tasting notes beside it.
          Without one: the original single-column layout (same markup, just
          with the padding on each piece instead of on the row).
        */}
        <div className={hasPhoto ? "px-6 pt-6 flex flex-row-reverse gap-5 items-start" : undefined}>
          {product.photoUrl && (
            // crossOrigin lets the "keep for later" image export include the photo
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.photoUrl}
              alt={product.name}
              crossOrigin="anonymous"
              className="w-[34%] shrink-0 h-auto max-h-96 object-contain rounded-md"
            />
          )}

          <div className={hasPhoto ? "min-w-0 flex-1" : undefined}>
            <div className={hasPhoto ? undefined : "px-6 pt-8 pb-1"}>
              <p
                className={`font-serif leading-tight ${hasPhoto ? "text-3xl" : "text-[40px]"}`}
                style={{ color: p.heading }}
              >
                {product.name}
              </p>
              <p
                className={`mt-1.5 ${hasPhoto ? "text-sm tracking-wide leading-snug" : "text-base"}`}
                style={{ color: p.accentText }}
              >
                {[product.category, product.subtitle].filter(Boolean).join(" · ").toUpperCase()}
              </p>
            </div>

            {!isArchived && (
              <>
                <div className={hasPhoto ? undefined : "px-6 pb-1"}>
                  <div
                    className="h-px my-4"
                    style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }}
                  />
                </div>

                <div className={`${hasPhoto ? "" : "px-6 "}pb-2 space-y-5`}>
                  {product.showAbv && product.proofAbv && (
                    <NoteRow label="Proof / ABV" value={product.proofAbv} palette={p} />
                  )}
                  {!hasPhoto && product.description && (
                    <NoteRow label="Description" value={product.description} palette={p} />
                  )}
                  {product.aroma && <NoteRow label="Aroma" value={product.aroma} palette={p} />}
                  {product.palate && <NoteRow label="Palate" value={product.palate} palette={p} />}
                  {product.finish && <NoteRow label="Finish" value={product.finish} palette={p} />}
                </div>
              </>
            )}
          </div>
        </div>

        {isArchived ? (
          <ArchivedBody palette={p} mailingListLink={business.mailingListLink} />
        ) : (
          <>
            {hasPhoto && product.description && (
              <div className="px-6 pt-5">
                <NoteRow label="Description" value={product.description} palette={p} />
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

            <div
              className="px-6 pt-5 pb-2.5 flex items-center justify-between border-t"
              style={{ borderColor: `${p.accent}30` }}
            >
              {priceEntries.length > 0 ? (
                <div className="flex items-baseline gap-4 flex-wrap">
                  {priceEntries.map(([label, value]) => (
                    <span key={label} className="text-base">
                      <span style={{ color: p.accentText }}>{label}</span>{" "}
                      <span className="font-serif" style={{ color: p.heading }}>
                        {value}
                      </span>
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
                className="text-sm px-4 py-2.5 rounded-md font-medium disabled:opacity-60 flex-shrink-0"
                style={{ backgroundColor: p.accent, color: p.onAccent }}
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
          </>
        )}
      </div>
    </main>
  );
}

function ArchivedBody({
  palette: p,
  mailingListLink,
}: {
  palette: CardPalette;
  mailingListLink: string | null;
}) {
  return (
    <>
      <div className="px-6 pt-4 pb-1">
        <span
          className="inline-block text-sm px-3 py-1.5 rounded-md"
          style={{ backgroundColor: `${p.accent}20`, color: p.accentText }}
        >
          No longer available
        </span>
      </div>
      <div className="px-6 pt-5 pb-6">
        <p className="text-base leading-relaxed" style={{ color: `${p.accentText}CC` }}>
          {mailingListLink
            ? "This one's sold out. Join the list below to hear first when the next release drops."
            : "This one's sold out. Ask your server what's pouring today."}
        </p>
      </div>
      {mailingListLink && (
        <div className="px-6 pb-6">
          <a
            href={mailingListLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-base py-3 rounded-md font-medium"
            style={{ backgroundColor: p.accent, color: p.onAccent }}
          >
            Join the list
          </a>
        </div>
      )}
    </>
  );
}

function NoteRow({ label, value, palette: p }: { label: string; value: string; palette: CardPalette }) {
  return (
    <div>
      <p className="text-sm tracking-wider uppercase mb-1" style={{ color: p.accentText }}>
        {label}
      </p>
      <p className="text-base whitespace-pre-line" style={{ color: p.heading }}>
        {value}
      </p>
    </div>
  );
}
