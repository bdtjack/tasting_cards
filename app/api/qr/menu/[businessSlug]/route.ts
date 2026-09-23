import { NextRequest } from "next/server";
import { generateMenuQr, qrDataUrlToPngResponse } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string }> }
) {
  const { businessSlug } = await params;
  const baseUrl = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  const dataUrl = await generateMenuQr(baseUrl, businessSlug);
  return qrDataUrlToPngResponse(dataUrl, `${businessSlug}-menu-qr.png`);
}
