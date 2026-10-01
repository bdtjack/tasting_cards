"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

// Picks an image, shrinks it in the browser, uploads it to Vercel Blob, and
// keeps the resulting URL in a hidden input so the surrounding <form> saves
// it like any other field. Re-encoding through a canvas also drops EXIF
// metadata (including GPS location) from phone photos.

const ACCEPTED = "image/jpeg,image/png,image/webp";

export type UploadFormat = "image/webp" | "image/png";

async function shrinkImage(file: File, maxDimension: number, format: UploadFormat): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WebP keeps photos small. Browsers that can't encode it (older Safari)
  // silently return PNG instead, which the upload route also accepts.
  // Logos are always PNG: they're small anyway, and the share-thumbnail
  // generator (lib/og.tsx) can't draw WebP.
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, format, format === "image/webp" ? 0.85 : undefined)
  );
  if (!blob) throw new Error("Could not process that image");
  return blob;
}

export default function ImageUpload({
  name,
  label,
  folder,
  initialUrl,
  maxDimension,
  help,
  shape = "square",
  format = "image/webp",
  onChange,
}: {
  name: string;
  label: string;
  /** The business's upload folder — see uploadFolderFor() in lib/blob.ts. */
  folder: string;
  initialUrl: string | null;
  maxDimension: number;
  help?: string;
  shape?: "round" | "square";
  /** Encoding for the uploaded file. Use PNG for anything drawn into share thumbnails (logos). */
  format?: UploadFormat;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(next: string) {
    setUrl(next);
    onChange?.(next);
  }

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPTED.split(",").includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    setBusy(true);
    try {
      const shrunk = await shrinkImage(file, maxDimension, format);
      const ext = shrunk.type === "image/png" ? "png" : "webp";
      const result = await upload(`${folder}/${name}.${ext}`, shrunk, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: shrunk.type,
      });
      update(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="block text-sm text-neutral-600 mb-1">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        <div
          className={`w-20 h-20 shrink-0 border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center text-xs text-neutral-400 ${
            shape === "round" ? "rounded-full" : "rounded-md"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-contain" />
          ) : (
            "No image"
          )}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm disabled:opacity-50"
            >
              {busy ? "Uploading…" : url ? "Replace" : "Upload"}
            </button>
            {url && !busy && (
              <button
                type="button"
                onClick={() => update("")}
                className="px-3 py-1.5 text-sm text-neutral-500"
              >
                Remove
              </button>
            )}
          </div>
          {help && <span className="text-xs text-neutral-500">{help}</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
