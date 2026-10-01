"use client";

import { useState } from "react";

/**
 * A delete button that asks "are you sure?" inline before submitting —
 * deleting can't be undone and breaks any QR code already printed for it.
 * (Inline rather than a browser confirm() popup, which looks out of place
 * and is easy to tap through on a phone.)
 */
export default function ConfirmDeleteForm({
  action,
  id,
  label,
  warning,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  warning: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-sm text-red-600">
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="border border-red-200 bg-red-50 rounded-md p-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-red-700 mb-3">{warning}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-4 py-2 border border-neutral-300 bg-white rounded-md text-sm"
        >
          Keep it
        </button>
        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md text-sm">
          Yes, delete
        </button>
      </div>
    </form>
  );
}
