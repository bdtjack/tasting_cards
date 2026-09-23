"use client";

import { useEffect, useRef, useState } from "react";
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
  const [copied, setCopied] = useState(false);

  // The card image, made ahead of time once the page has loaded. Phones
  // (especially iPhones) only allow the share sheet to open right after a
  // tap; if the image were made AFTER the tap, that window can close
  // before it finishes and the share would silently fail.
  const cachedFileRef = useRef<File | null>(null);

  const fileName = `${business.name.replace(/\s+/g, "-").toLowerCase()}-${product.slug}.png`;

  // Snapshot the actual rendered card, not a re-created copy of it, so the
  // image always matches what the guest sees. Anything marked
  // data-no-snapshot (the buttons) is left out, since buttons in a picture
  // are just noise.
  async function makeCardPng(): Promise<string> {
    if (!cardRef.current) throw new Error("Card not rendered yet");
    return toPng(cardRef.current, {
      pixelRatio: 2,
      filter: (node) => !(node instanceof HTMLElement && node.hasAttribute("data-no-snapshot")),
    });
  }

  async function makeCardFile(): Promise<File> {
    const dataUrl = await makeCardPng();
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], fileName, { type: "image/png" });
  }

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        await document.fonts?.ready; // so the snapshot uses the real fonts
        const file = await makeCardFile();
        if (!cancelled) cachedFileRef.current = file;
      } catch {
        // Not fatal: Share will try again on tap, then fall back to the link.
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveCard() {
    setSaving(true);
    try {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = await makeCardPng();
      link.click();
    } catch (err) {
      // Most likely cause: a logo image hosted somewhere that blocks other
      // sites from reading it, which the snapshot tool can't work around.
      console.error("Couldn't save card image:", err);
      alert("Sorry, couldn't save the card image. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    const title = `${product.name} — ${business.name}`;
    const text = `${product.name} from ${business.name}`;

    // 1. Phones: share the card itself as an image, so it posts to Stories,
    //    Messages, etc. looking exactly like the card. The link rides along
    //    in the text for apps that keep text (some, like Stories, drop it).
    if (navigator.share && navigator.canShare) {
      let file = cachedFileRef.current;
      if (!file) {
        try {
          file = await makeCardFile();
          cachedFileRef.current = file;
        } catch {
          file = null;
        }
      }
      if (file && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title, text: `${text} ${url}` });
          return;
        } catch (err) {
          // Guest closed the share sheet: done, nothing to report.
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Anything else (e.g. the phone refused the image): try the link.
        }
      }
    }

    // 2. Share sheet without image support: share the link. The link
    //    preview uses the branded thumbnail from opengraph-image.tsx.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Guest closed the share sheet.
      }
      return;
    }

    // 3. No share sheet at all (most desktop browsers): copy the link.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(url);
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
                data-no-snapshot
                disabled={saving}
                className="text-xs px-3.5 py-2 rounded-md font-medium disabled:opacity-60"
                style={{ backgroundColor: business.accentColor, color: "#0D0D0D" }}
              >
                {saving ? "Saving…" : "Save card"}
              </button>
            </div>

            {/* data-no-snapshot: left out of the saved/shared image — buttons in a picture are just noise. */}
            <div className="px-5 pb-5 pt-1 flex gap-2" data-no-snapshot>
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
