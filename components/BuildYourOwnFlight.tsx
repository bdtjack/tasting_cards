"use client";

import { useEffect, useRef, useState } from "react";
import { useCardShare } from "@/lib/useCardShare";
import { ordinalWord } from "@/lib/ordinal";

type Business = {
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  mailingListLink: string | null;
};

type Flight = {
  name: string;
  description: string | null;
  price: string | null;
  selectionCount: number;
};

export type PickableProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subtitle: string | null;
};

/**
 * The guest side of a build-your-own flight: "First Selection", "Second
 * Selection", … one pick per step, then a finished flight card they can
 * save or share as an image. Picks live only in this component's state —
 * nothing about them is sent to the server. The one thing reported back is
 * that a flight was finished (onComplete), for the business's count.
 */
export default function BuildYourOwnFlight({
  business,
  flight,
  products,
  onComplete,
}: {
  business: Business;
  flight: Flight;
  products: PickableProduct[];
  onComplete: () => Promise<void>;
}) {
  const [picks, setPicks] = useState<PickableProduct[]>([]);
  const isDone = picks.length >= flight.selectionCount;

  // Count a completion once per visit, even if the guest goes back, changes
  // a pick, and finishes again.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (isDone && !reportedRef.current) {
      reportedRef.current = true;
      onComplete().catch(() => {
        // A missed count isn't worth bothering the guest about.
      });
    }
  }, [isDone, onComplete]);

  function pick(product: PickableProduct) {
    setPicks((current) =>
      current.length < flight.selectionCount ? [...current, product] : current
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isDone) {
    return (
      <BuiltFlightCard
        business={business}
        flight={flight}
        picks={picks}
        onChangeLastPick={() => setPicks((current) => current.slice(0, -1))}
        onStartOver={() => setPicks([])}
      />
    );
  }

  const step = picks.length;

  return (
    <main className="min-h-screen flex items-start sm:items-center justify-center p-6">
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <CardHeader business={business} />

        <div className="px-6 pt-7 pb-1">
          <p className="font-serif text-[34px] leading-tight" style={{ color: "#F5F1E8" }}>
            {flight.name}
          </p>
          {flight.description && step === 0 && (
            <p className="text-base mt-1.5" style={{ color: `${business.accentColor}CC` }}>
              {flight.description}
            </p>
          )}
        </div>

        {/* Progress: one segment per selection, filled as picks are made. */}
        <div className="px-6 pt-5">
          <div className="flex gap-1.5">
            {Array.from({ length: flight.selectionCount }, (_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor: i <= step ? business.accentColor : `${business.accentColor}30`,
                }}
              />
            ))}
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <p className="text-xl font-serif" style={{ color: "#F5F1E8" }}>
              {ordinalWord(step)} Selection
            </p>
            <p className="text-sm" style={{ color: `${business.accentColor}AA` }}>
              {step + 1} of {flight.selectionCount}
            </p>
          </div>
        </div>

        <div className="px-6 pt-3 pb-2">
          {products.length === 0 ? (
            <p className="text-base py-3" style={{ color: `${business.accentColor}AA` }}>
              Nothing is available to pick right now — ask your server what&apos;s pouring.
            </p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => pick(product)}
                  className="w-full text-left rounded-md px-4 py-3 transition-opacity active:opacity-70"
                  style={{ backgroundColor: `${business.accentColor}15` }}
                >
                  <span className="block text-base" style={{ color: "#F5F1E8" }}>
                    {product.name}
                  </span>
                  <span className="block text-sm" style={{ color: `${business.accentColor}AA` }}>
                    {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {picks.length > 0 && (
          <div className="px-6 pt-4 pb-2">
            <p
              className="text-xs tracking-wider uppercase mb-2"
              style={{ color: business.accentColor }}
            >
              Your picks so far
            </p>
            <ol className="space-y-1">
              {picks.map((product, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: "#E8DFC8" }}>
                  <span style={{ color: business.accentColor }}>{i + 1}.</span>
                  {product.name}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="px-6 pt-3 pb-6 flex gap-2.5">
          {picks.length > 0 && (
            <>
              <button
                onClick={() => setPicks((current) => current.slice(0, -1))}
                className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
                style={{ borderColor: `${business.accentColor}80`, color: business.accentColor }}
              >
                Back
              </button>
              <button
                onClick={() => setPicks([])}
                className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
                style={{ borderColor: `${business.accentColor}40`, color: `${business.accentColor}AA` }}
              >
                Start over
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function BuiltFlightCard({
  business,
  flight,
  picks,
  onChangeLastPick,
  onStartOver,
}: {
  business: Business;
  flight: Flight;
  picks: PickableProduct[];
  onChangeLastPick: () => void;
  onStartOver: () => void;
}) {
  const shareText = `Look at the flight I just built at ${business.name}`;

  // Mounted only once the flight is complete, so the image the hook
  // prepares ahead of time already has every pick on it.
  const { cardRef, saving, handleSaveCard, handleShare } = useCardShare({
    fileName: `${business.name.replace(/\s+/g, "-").toLowerCase()}-my-flight.png`,
    title: `${flight.name} — ${business.name}`,
    text: shareText,
    imageOnly: true,
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div
        ref={cardRef}
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{ backgroundColor: business.primaryColor }}
      >
        <CardHeader business={business} />

        <div className="px-6 pt-7 pb-1">
          <p className="text-xs tracking-wider uppercase" style={{ color: business.accentColor }}>
            My flight
          </p>
          <p className="font-serif text-[34px] leading-tight mt-1" style={{ color: "#F5F1E8" }}>
            {flight.name}
          </p>
        </div>

        <div className="px-6 pb-1 pt-4">
          <div
            className="h-px mb-2"
            style={{ background: `linear-gradient(90deg, ${business.accentColor}, transparent)` }}
          />
        </div>

        <div className="px-6 pb-2">
          <div>
            {picks.map((product, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 py-3 ${i > 0 ? "border-t" : ""}`}
                style={{ borderColor: `${business.accentColor}25` }}
              >
                <span
                  className="font-serif text-2xl w-6 text-center flex-shrink-0"
                  style={{ color: business.accentColor }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-base" style={{ color: "#F5F1E8" }}>
                    {product.name}
                  </span>
                  <span className="block text-sm" style={{ color: `${business.accentColor}AA` }}>
                    {[product.category, product.subtitle].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </div>
            ))}
          </div>
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

        {/* Part of the saved/shared image on purpose, so the line travels
            with the picture however the guest shares it. */}
        <div className="px-6 pt-5 pb-6">
          <p className="font-serif italic text-lg text-center" style={{ color: "#E8DFC8" }}>
            {shareText}
          </p>
        </div>

        <div className="px-6 pb-2.5 flex gap-2.5" data-no-snapshot>
          <button
            onClick={handleSaveCard}
            disabled={saving}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium disabled:opacity-60"
            style={{ backgroundColor: business.accentColor, color: "#0D0D0D" }}
          >
            {saving ? "Saving…" : "Save card"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md font-medium border"
            style={{ borderColor: `${business.accentColor}80`, color: business.accentColor }}
          >
            Share
          </button>
        </div>

        <div className="px-6 pb-6 flex gap-2.5" data-no-snapshot>
          <button
            onClick={onChangeLastPick}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md border"
            style={{ borderColor: `${business.accentColor}40`, color: `${business.accentColor}AA` }}
          >
            Back
          </button>
          <button
            onClick={onStartOver}
            className="flex-1 text-center text-sm px-4 py-2.5 rounded-md border"
            style={{ borderColor: `${business.accentColor}40`, color: `${business.accentColor}AA` }}
          >
            Start over
          </button>
        </div>

        {business.mailingListLink && (
          <div className="px-6 pb-6 -mt-3" data-no-snapshot>
            <a
              href={business.mailingListLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm"
              style={{ color: business.accentColor }}
            >
              Join the list
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

function CardHeader({ business }: { business: Business }) {
  return (
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
  );
}
