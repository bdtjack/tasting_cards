import { del } from "@vercel/blob";

// Uploaded images (logos, product photos) live in Vercel Blob under a
// folder named after the business's slug — "hidden-hills/photo-ab12.webp".
// The upload route (app/api/upload) only hands out upload tokens for the
// signed-in business's own folder.

/** The Blob folder a business's uploads go in. */
export function uploadFolderFor(businessSlug: string): string {
  return businessSlug;
}

function isOwnBlob(url: string, businessSlug: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".blob.vercel-storage.com") &&
      parsed.pathname.startsWith(`/${uploadFolderFor(businessSlug)}/`)
    );
  } catch {
    return false;
  }
}

/**
 * Deletes an image that was just replaced or removed, so storage doesn't
 * fill up with old uploads. Only ever deletes files in this business's own
 * folder — a URL that points anywhere else (an older upload from before
 * per-business folders, an outside link, or another business's file) is
 * left alone. Never throws: a leftover file is harmless.
 */
export async function deleteReplacedImage(
  oldUrl: string | null,
  newUrl: string | null,
  businessSlug: string
): Promise<void> {
  if (!oldUrl || oldUrl === newUrl || !isOwnBlob(oldUrl, businessSlug)) return;
  try {
    await del(oldUrl);
  } catch (err) {
    console.error("Couldn't delete replaced image:", err);
  }
}
