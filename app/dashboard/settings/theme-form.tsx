"use client";

import { useState } from "react";
import { updateBusinessTheme } from "./actions";

const CATEGORIES = [
  { value: "WINERY", label: "Winery" },
  { value: "BREWERY", label: "Brewery" },
  { value: "DISTILLERY", label: "Distillery" },
  { value: "MIXED", label: "Mixed" },
];

export default function ThemeForm({
  business,
}: {
  business: {
    name: string;
    category: string;
    logoUrl: string | null;
    primaryColor: string;
    accentColor: string;
    mailingListLink: string | null;
  };
}) {
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.category);
  const [logoUrl, setLogoUrl] = useState(business.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(business.primaryColor);
  const [accentColor, setAccentColor] = useState(business.accentColor);
  const [mailingListLink, setMailingListLink] = useState(business.mailingListLink ?? "");

  const initials = name.trim().slice(0, 2).toUpperCase() || "??";

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form action={updateBusinessTheme} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-neutral-600 mb-1">Business name</span>
          <input
            name="name"
            required
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

          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Logo URL (image link)
            </span>
            <input
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://"
              className="input"
            />
            <span className="block text-xs text-neutral-500 mt-1">
              Paste a link to your logo image. File upload is coming later — for
              now, host the image anywhere (your website, an image host) and
              paste the link here.
            </span>
          </label>

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
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-4">
          <label className="block">
            <span className="block text-sm text-neutral-600 mb-1">
              Newsletter / mailing list link
            </span>
            <input
              name="mailingListLink"
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
            style={{ backgroundColor: primaryColor }}
          >
            <div
              className="px-4 py-3.5 flex items-center gap-2.5 border-b"
              style={{ borderColor: `${accentColor}40` }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-serif flex-shrink-0"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  {initials}
                </div>
              )}
              <span
                className="text-xs tracking-wider uppercase truncate"
                style={{ color: accentColor }}
              >
                {name || "Your business name"}
              </span>
            </div>

            <div className="px-4 pt-5 pb-1">
              <p className="font-serif text-2xl" style={{ color: "#F5F1E8" }}>
                Sample wine
              </p>
              <p className="text-xs mt-1" style={{ color: accentColor }}>
                VARIETAL · VINTAGE
              </p>
            </div>

            <div className="px-4 pb-4">
              <div
                className="h-px my-3"
                style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
              />
              <p className="text-[11px] tracking-wider uppercase mb-0.5" style={{ color: accentColor }}>
                Aroma
              </p>
              <p className="text-sm" style={{ color: "#E8DFC8" }}>
                This is how tasting notes will look
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-2">Updates as you edit the fields.</p>
      </div>
    </div>
  );
}
