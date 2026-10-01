import type { CardPalette } from "@/lib/color";

/**
 * The logo + business name row across the top of every guest-facing card
 * (product, flight, build-your-own, menu). No hooks, so it works in both
 * server and client components.
 */
export default function CardHeader({
  name,
  logoUrl,
  palette,
}: {
  name: string;
  logoUrl: string | null;
  palette: CardPalette;
}) {
  return (
    <div
      className="px-6 py-5 flex items-center gap-3 border-b"
      style={{ borderColor: `${palette.accent}40` }}
    >
      {logoUrl ? (
        // crossOrigin lets the "Save card" snapshot include the logo.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          crossOrigin="anonymous"
        />
      ) : (
        <div
          className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-serif flex-shrink-0"
          style={{ borderColor: palette.accentText, color: palette.accentText }}
        >
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className="text-sm tracking-wider uppercase min-w-0" style={{ color: palette.accentText }}>
        {name}
      </span>
    </div>
  );
}
