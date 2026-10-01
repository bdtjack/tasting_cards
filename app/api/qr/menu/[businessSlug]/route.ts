import { NextRequest } from "next/server";
import { generateMenuQr, qrDataUrlToPngResponse } from "@/lib/qr";
import { resolveBaseUrl } from "@/lib/baseUrl";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string }> }
) {
  const { businessSlug } = await params;
  const baseUrl = resolveBaseUrl(new URL(request.url).origin);
  const dataUrl = await generateMenuQr(baseUrl, businessSlug);
  return qrDataUrlToPngResponse(dataUrl, `${businessSlug}-menu-qr.png`);
}
