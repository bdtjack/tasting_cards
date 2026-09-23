import { NextRequest } from "next/server";
import { generateProductQr, qrDataUrlToPngResponse } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string; productSlug: string }> }
) {
  const { businessSlug, productSlug } = await params;
  const baseUrl = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  const dataUrl = await generateProductQr(baseUrl, businessSlug, productSlug);
  return qrDataUrlToPngResponse(dataUrl, `${productSlug}-qr.png`);
}
