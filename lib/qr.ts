import QRCode from "qrcode";

/**
 * Generates a plain black-and-white QR code (as a data URL) pointing at a
 * product's guest-facing card. Deliberately no logo/branding overlay —
 * that was a considered decision in favor of scan reliability over
 * on-brand styling.
 */
export async function generateProductQr(
  baseUrl: string,
  businessSlug: string,
  productSlug: string
): Promise<string> {
  const url = `${baseUrl}/${businessSlug}/${productSlug}`;
  return QRCode.toDataURL(url, {
    color: { dark: "#000000", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });
}
