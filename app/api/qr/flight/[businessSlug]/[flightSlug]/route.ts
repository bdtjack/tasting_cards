import { NextRequest } from "next/server";
import { generateFlightQr, qrDataUrlToPngResponse } from "@/lib/qr";
import { resolveBaseUrl } from "@/lib/baseUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string; flightSlug: string }> }
) {
  const { businessSlug, flightSlug } = await params;
  const baseUrl = resolveBaseUrl(new URL(request.url).origin);
  const dataUrl = await generateFlightQr(baseUrl, businessSlug, flightSlug);
  return qrDataUrlToPngResponse(dataUrl, `${flightSlug}-flight-qr.png`);
}
