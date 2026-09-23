"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type Business = {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
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
  mailingListLink: string | null;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveCard() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      // Snapshot the actual rendered card DOM, not a re-created version of
      // it — so what gets saved always matches what the guest is looking
      // at, including any theme changes, with no separate template to
      // keep in sync.
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        filter: (node) =>
          !(node instanceof HTMLElement && node.hasAttribute("data-share-row")),
      });
      const link = document.createElement("a");
      link.download = `${business.name.replace(/\s+/g, "-").toLowerCase()}-${product.slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      // A failed save shouldn't be a dead end for the guest — most likely
      // cause is a cross-origin logo image without CORS headers, which
      // html-to-image can't read pixel data from.
      console.error("Couldn't save card image:", err);
      alert("Sorry, couldn't save the card image. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: `${product.name} — ${business.name}`,
      text: `Check out ${product.name} from ${business.name}`,
      url: window.location.href,
    };
    // On phones, this opens the native share sheet (Messages, WhatsApp,
    // email, etc). Desktop browsers often don't support it, so fall back to
    // copying the link.
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User closed the share sheet — not an error worth reporting.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(window.location.href);
    }
  }

  const priceEntries = Object.entries(product.prices).filter(([, value]) => value);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2.5 border-b"
          style={{ borderColor: `${business.accentColor}40` }}
        >
          {business.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt="" className="w-7 h-7 rounded-full" crossOrigin="anonymous" />
          ) : (
            <div
              className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-serif"
              style={{ borderColor: business.accentColor, color: business.accentColor }}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs tracking-wider uppercase" style={{ color: business.accentColor }}>
            {business.name}
          </span>
        </div>

        <div className="px-5 pt-6 pb-1">
          <p className="font-serif text-3xl" style={{ color: "#F5F1E8" }}>
            {product.name}
          </p>
          <p className="text-sm mt-1" style={{ color: business.accentColor }}>
            {[product.category, product.subtitle].filter(Boolean).join(" · ").toUpperCase()}
          </p>
        </div>

        {isArchived ? (
          <ArchivedBody accentColor={business.accentColor} mailingListLink={product.mailingListLink} />
        ) : (
          <>
            <div className="px-5 pb-1">
              <div
                className="h-px my-3"
                style={{ background: `linear-gradient(90deg, ${business.accentColor}, transparent)` }}
              />
            </div>

            <div className="px-5 pb-2 space-y-3.5">
              {product.showAbv && product.proofAbv && (
                <NoteRow label="Proof / ABV" value={product.proofAbv} accentColor={business.accentColor} />
              )}
              {product.aroma && <NoteRow label="Aroma" value={product.aroma} accentColor={business.accentColor} />}
              {product.palate && <NoteRow label="Palate" value={product.palate} accentColor={business.accentColor} />}
              {product.finish && <NoteRow label="Finish" value={product.finish} accentColor={business.accentColor} />}
            </div>

            <div
              className="px-5 pt-4 pb-2 flex items-center justify-between border-t"
              style={{ borderColor: `${business.accentColor}30` }}
            >
              {priceEntries.length > 0 ? (
                <div className="flex items-baseline gap-3">
                  {priceEntries.map(([label, value]) => (
                    <span key={label} className="text-sm">
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
                disabled={saving}
                className="text-xs px-3.5 py-2 rounded-md font-medium disabled:opacity-60"
                style={{ backgroundColor: business.accentColor, color: "#0D0D0D" }}
              >
                {saving ? "Saving…" : "Save card"}
              </button>
            </div>

            {/* Excluded from the saved image — buttons in a screenshot are just noise. */}
            <div className="px-5 pb-5 pt-1 flex gap-2" data-share-row>
              {product.mailingListLink && (
                <a
                  href={product.mailingListLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-xs px-3.5 py-2 rounded-md font-medium border"
                  style={{ borderColor: `${business.accentColor}80`, color: business.accentColor }}
                >
                  Join the list
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex-1 text-center text-xs px-3.5 py-2 rounded-md font-medium border"
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
      <div className="px-5 pb-1">
        <span
          className="inline-block text-xs px-2.5 py-1 rounded-md"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          No longer available
        </span>
      </div>
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm leading-relaxed" style={{ color: `${accentColor}CC` }}>
          This vintage sold out. Join the list below to hear first when the next release
          drops.
        </p>
      </div>
      {mailingListLink && (
        <div className="px-5 pt-3 pb-5">
          <a
            href={mailingListLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-sm py-2.5 rounded-md font-medium"
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
      <p className="text-[11px] tracking-wider uppercase mb-0.5" style={{ color: accentColor }}>
        {label}
      </p>
      <p className="text-sm text-neutral-100">{value}</p>
    </div>
  );
}
