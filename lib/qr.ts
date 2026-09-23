import QRCode from "qrcode";
import { NextResponse } from "next/server";

/**
 * Generates a plain black-and-white QR code (as a data URL) pointing at
 * `${baseUrl}${path}`. Deliberately no logo/branding overlay — that was a
 * considered decision in favor of scan reliability over on-brand styling.
 */
export async function generateQr(baseUrl: string, path: string): Promise<string> {
  return QRCode.toDataURL(`${baseUrl}${path}`, {
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}

/** A product's guest-facing card QR — see generateQr for the shared logic. */
export async function generateProductQr(
  baseUrl: string,
  businessSlug: string,
  productSlug: string
): Promise<string> {
  return generateQr(baseUrl, `/${businessSlug}/${productSlug}`);
}

/** A business's full menu page QR — see generateQr for the shared logic. */
export async function generateMenuQr(baseUrl: string, businessSlug: string): Promise<string> {
  return generateQr(baseUrl, `/${businessSlug}`);
}

/** A flight's guest-facing page QR — see generateQr for the shared logic. */
export async function generateFlightQr(
  baseUrl: string,
  businessSlug: string,
  flightSlug: string
): Promise<string> {
  return generateQr(baseUrl, `/${businessSlug}/flights/${flightSlug}`);
}

/**
 * Turns a QR data URL into a downloadable PNG response — shared by the
 * product, menu, and flight QR route handlers so each one stays a
 * one-liner rather than repeating the base64-stripping boilerplate.
 */
export function qrDataUrlToPngResponse(dataUrl: string, filename: string): NextResponse {
  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
