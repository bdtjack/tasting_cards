import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getCurrentBusiness } from "@/lib/auth";

// Client-upload token endpoint for Vercel Blob. The browser uploads the file
// straight to Blob storage (so it never passes through a serverless function
// and doesn't hit Vercel's request body limit); this route only decides
// whether that upload is allowed and hands back a short-lived token.
//
// Requires BLOB_READ_WRITE_TOKEN, which Vercel adds to the project when a
// Blob store is connected to it.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only logged-in businesses may upload.
        const business = await getCurrentBusiness();
        if (!business) throw new Error("Not signed in");

        return {
          allowedContentTypes: ["image/webp", "image/jpeg", "image/png"],
          // The client resizes before uploading, so real files are far
          // smaller than this; it is a backstop, not the target.
          maximumSizeInBytes: 4 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ businessId: business.id }),
        };
      },
      // Nothing to do on completion: the form saves the returned URL with
      // the rest of the record when the business hits Save.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
