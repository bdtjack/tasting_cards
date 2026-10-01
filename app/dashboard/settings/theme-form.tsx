"use client";

import { useState } from "react";
import { updateBusinessTheme } from "./actions";
import { MAX_SHARE_PHRASE_LENGTH } from "@/lib/shareCaption";
import { LIMITS } from "@/lib/validate";
import ImageUpload from "@/components/ImageUpload";
import { cardPalette } from "@/lib/color";
import { cardFontFamily, cardFontStyle } from "@/lib/cardFonts";
import { CARD_FONT_IDS, CARD_FONT_OPTIONS, resolveCardFont } from "@/lib/fontOptions";

const CATEGORIES = [
  { value: "WINERY", label: "Winery" },
  { value: "BREWERY", label: "Brewery" },
  { value: "DISTILLERY", label: "Distillery" },
  { value: "MIXED", label: "Mixed" },
];

export default function ThemeForm({
  business,
  uploadFolder,
}: {
  uploadFolder: string;
  business: {
    name: string;
    category: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    cardFont: string;
    mailingListLink: string | null;
    sharePhrase: string | null;
  };
}) {
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [logoUrl, setLogoUrl] = useState(business.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(business.primaryColor);
  const [accentColor, setAccentColor] = useState(business.accentColor);
  const [cardFont, setCardFont] = useState(resolveCardFont(business.cardFont));
  const [mailingListLink, setMailingListLink] = useState(business.mailingListLink ?? "");
  const [sharePhrase, setSharePhrase] = useState(business.sharePhrase ?? "");

  const initials = name.trim().slice(0, 2).toUpperCase() || "??";
  // Same color logic as the real guest cards, so the preview matches them.
  const palette = cardPalette(primaryColor, accentColor);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form action={updateBusinessTheme} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Business name</span>
          <input
            name="name"
            required
            maxLength={LIMITS.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Category</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="block text-xs text-neutral-500 mt-1">
            Changes here only affect new products — existing published cards keep
            the pricing/ABV setup they were created with.
          </span>
        </label>

        <div className="border-t border-neutral-200 pt-4 space-y-4">
          <p className="text-sm font-medium text-neutral-600">Theme</p>

          <ImageUpload
            name="logoUrl"
            label="Logo"
            folder={uploadFolder}
            initialUrl={business.logoUrl}
            maxDimension={256}
            shape="round"
            format="image/png"
            onChange={setLogoUrl}
            help="JPG, PNG or WebP. Shown small and round on your cards."
          />

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm text-neutral-600 mb-1">Primary color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-9 rounded-md border border-neutral-300 p-0.5 bg-white flex-shrink-0"
                />
                <input
                  name="primaryColor"
                  maxLength={7}
                  pattern="#[0-9a-fA-F]{6}"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input"
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-sm text-neutral-600 mb-1">Accent color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-9 rounded-md border border-neutral-300 p-0.5 bg-white flex-shrink-0"
                />
                <input
                  name="accentColor"
                  maxLength={7}
                  pattern="#[0-9a-fA-F]{6}"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="input"
                />
              </div>
            </label>
          </div>

          <fieldset>
            <legend className="block text-sm text-neutral-600 mb-1">Heading font</legend>
            <p className="text-xs text-neutral-500 mb-2">
              Used for product, flight and menu names and prices. Tasting notes
              stay in a plain font so they&apos;re easy to read.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CARD_FONT_IDS.map((id) => {
                const option = CARD_FONT_OPTIONS[id];
                const selected = cardFont === id;
                return (
                  <label
                    key={id}
                    className={`block cursor-pointer rounded-md border px-3 py-2 bg-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-400 ${
                      selected
                        ? "border-neutral-900 ring-1 ring-neutral-900"
                        : "border-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cardFont"
                      value={id}
                      checked={selected}
                      onChange={() => setCardFont(id)}
                      className="sr-only"
                    />
                    <span
                      className="block text-xl leading-tight truncate"
                      style={{ fontFamily: cardFontFamily(id) }}
                    >
                      {name.trim() || "Sample wine"}
                    </span>
                    <span className="block text-xs font-medium text-neutral-700 mt-1">
                      {option.label}
                    </span>
                    <span className="block text-[11px] text-neutral-500 leading-snug">
                      {option.hint}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Newsletter / mailing list link
            </span>
            <input
              name="mailingListLink"
              type="url"
              maxLength={LIMITS.url}
              value={mailingListLink}
              onChange={(e) => setMailingListLink(e.target.value)}
              placeholder="https://"
              className="input"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Shown as &quot;Join the list&quot; on every guest card and flight —
              set once here rather than per product.
            </span>
          </label>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <label className="block">
            <span className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-neutral-600">Share phrase (optional)</span>
              <span className="text-xs text-neutral-400">
                {sharePhrase.length}/{MAX_SHARE_PHRASE_LENGTH}
              </span>
            </span>
            <textarea
              name="sharePhrase"
              rows={2}
              maxLength={MAX_SHARE_PHRASE_LENGTH}
              value={sharePhrase}
              onChange={(e) => setSharePhrase(e.target.value)}
              placeholder="Check out this pour I just got!"
              className="input"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Added to the saved image and share text on every product and
              flight card, followed automatically by the product/flight name
              and your business name — e.g. &quot;Check out this pour I just
              got! Pinto at {name || "Your business name"}&quot;. Leave blank
              to skip this. Build-your-own flights don&apos;t use this, since
              a guest&apos;s specific picks aren&apos;t saved anywhere to
              caption.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm"
        >
          Save changes
        </button>
      </form>

      <div>
        <p className="text-sm text-neutral-500 mb-3">Live preview</p>
        <div className="bg-neutral-100 rounded-2xl p-4">
          <div
            className="rounded-xl overflow-hidden max-w-sm mx-auto"
            style={{ backgroundColor: palette.background, ...cardFontStyle(cardFont) }}
          >
            <div
              className="px-4 py-3.5 flex items-center gap-2.5 border-b"
              style={{ borderColor: `${palette.accent}40` }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-serif flex-shrink-0"
                  style={{ borderColor: palette.accentText, color: palette.accentText }}
                >
                  {initials}
                </div>
              )}
              <span
                className="text-xs tracking-wider uppercase truncate"
                style={{ color: palette.accentText }}
              >
                {name || "Your business name"}
              </span>
            </div>

            <div className="px-4 pt-5 pb-1">
              <p className="font-serif text-2xl" style={{ color: palette.heading }}>
                Sample wine
              </p>
              <p className="text-xs mt-1" style={{ color: palette.accentText }}>
                VARIETAL · VINTAGE
              </p>
            </div>

            <div className="px-4 pb-4">
              <div
                className="h-px my-3"
                style={{ background: `linear-gradient(90deg, ${palette.accent}, transparent)` }}
              />
              <p className="text-[11px] tracking-wider uppercase mb-0.5" style={{ color: palette.accentText }}>
                Aroma
              </p>
              <p className="text-sm" style={{ color: palette.heading }}>
                This is how tasting notes will look
              </p>
            </div>

            {sharePhrase.trim() && (
              <div className="px-4 pb-4">
                <p
                  className="font-serif italic text-sm text-center"
                  style={{ color: `${palette.accentText}CC` }}
                >
                  {sharePhrase.trim()} Sample wine at {name || "Your business name"}
                </p>
              </div>
            )}

            <div className="px-4 pb-4">
              <span
                className="inline-block text-xs px-3 py-1.5 rounded-md font-medium"
                style={{ backgroundColor: palette.accent, color: palette.onAccent }}
              >
                Save card
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-2">Updates as you edit the fields.</p>
        {palette.accentText.toLowerCase() !== palette.accent.toLowerCase() && (
          <p className="text-xs text-neutral-500 mt-1">
            Your accent color is a little hard to read on this background, so text
            in that color is shown slightly {palette.isDark ? "lighter" : "darker"} to stay readable.
            Borders and buttons still use your exact color.
          </p>
        )}
      </div>
    </div>
  );
}
