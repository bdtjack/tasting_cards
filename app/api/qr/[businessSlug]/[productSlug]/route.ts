import { NextRequest, NextResponse } from "next/server";
import { generateProductQr } from "@/lib/qr";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string; productSlug: string }> }
) {
  const { businessSlug, productSlug } = await params;
  const baseUrl = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  const dataUrl = await generateProductQr(baseUrl, businessSlug, productSlug);

  // Strip the "data:image/png;base64," prefix and return raw PNG bytes so
  // this can be linked directly as a downloadable file.
  const base64 = dataUrl.split(",")[1];
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${productSlug}-qr.png"`,
    },
  });
}
