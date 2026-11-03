"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

/**
 * iPhone/iPad (including iPads that report themselves as a Mac).
 * iOS Safari drops the attached image if navigator.share() is also given
 * any title or text, so on these devices the image has to go out alone.
 */
function isAppleMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Handles "Save card" (download a PNG snapshot of the referenced element)
 * and "Share" (send that same image via the phone's native share sheet,
 * falling back to sharing the link, then to copying the link) for any
 * card-shaped element. Used by both the product guest card and the flight
 * card — keeping this in one place means a fix here fixes both.
 *
 * `imageOnly` is for cards that have no page of their own to link back to
 * (a guest's build-your-own flight is never stored, so its URL would just
 * open an empty builder). In that mode Share only ever sends the image,
 * and falls back to downloading it rather than to sharing a link.
 */
export function useCardShare({
  fileName,
  title,
  text,
  imageOnly = false,
}: {
  fileName: string;
  title: string;
  text: string;
  imageOnly?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Made ahead of time once the page has loaded. Phones (especially
  // iPhones) only allow the share sheet to open right after a tap; if the
  // image were made AFTER the tap, that window can close before it
  // finishes and the share would silently fail.
  const cachedFileRef = useRef<File | null>(null);

  async function makeCardPng(): Promise<string> {
    if (!cardRef.current) throw new Error("Card not rendered yet");
    const options = {
      pixelRatio: 2,
      filter: (node: HTMLElement) =>
        !(node instanceof HTMLElement && node.hasAttribute("data-no-snapshot")),
    };
    // iOS Safari often leaves the logo, photo or fonts out of the FIRST
    // snapshot (they haven't been decoded yet). A throwaway warm-up render
    // makes the real one come out complete.
    if (isAppleMobile()) {
      await toPng(cardRef.current, options).catch(() => {});
    }
    return toPng(cardRef.current, options);
  }

  async function makeCardFile(): Promise<File> {
    const dataUrl = await makeCardPng();
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], fileName, { type: "image/png" });
  }

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        await document.fonts?.ready; // so the snapshot uses the real fonts
        const file = await makeCardFile();
        if (!cancelled) cachedFileRef.current = file;
      } catch {
        // Not fatal: Share will try again on tap, then fall back to the link.
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSaveCard() {
    setSaving(true);
    try {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = await makeCardPng();
      link.click();
    } catch (err) {
      // Most likely cause: a logo image hosted somewhere that blocks other
      // sites from reading it, which the snapshot tool can't work around.
      console.error("Couldn't save card image:", err);
      alert("Sorry, couldn't save the card image. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;

    // 1. Phones: share the card itself as an image, so it posts to Stories,
    //    Messages, etc. looking exactly like the card. The link rides along
    //    in the text for apps that keep text (some, like Stories, drop it).
    if (navigator.share && navigator.canShare) {
      let file = cachedFileRef.current;
      if (!file) {
        try {
          file = await makeCardFile();
          cachedFileRef.current = file;
        } catch {
          file = null;
        }
      }
      if (file && navigator.canShare({ files: [file] })) {
        try {
          // iPhones: image only. Adding a title or text makes iOS drop the
          // image and send just the text (so Facebook etc. got no picture).
          // Android keeps both, so it still gets the caption and link.
          await navigator.share(
            isAppleMobile()
              ? { files: [file] }
              : { files: [file], title, text: imageOnly ? text : `${text} ${url}` },
          );
          return;
        } catch (err) {
          // Guest closed the share sheet: done, nothing to report.
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Anything else (e.g. the phone refused the image): try the link.
        }
      }
    }

    // Image-only cards have no link worth sharing, so save the picture
    // instead — the guest can post it from their photos.
    if (imageOnly) {
      await handleSaveCard();
      return;
    }

    // 2. Share sheet without image support: share the link. The link
    //    preview uses the branded thumbnail from opengraph-image.tsx.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Guest closed the share sheet.
      }
      return;
    }

    // 3. No share sheet at all (most desktop browsers): copy the link.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(url);
    }
  }

  return { cardRef, saving, copied, handleSaveCard, handleShare };
}
