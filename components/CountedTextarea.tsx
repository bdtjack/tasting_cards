"use client";

import { useState } from "react";

// A textarea with a live "n / max" counter, so a business sees the limit
// coming instead of just having typing silently stop. The server trims to
// the same limit as a backstop (see lib/validate.ts).
export default function CountedTextarea({
  name,
  maxLength,
  rows = 2,
  defaultValue = "",
}: {
  name: string;
  maxLength: number;
  rows?: number;
  defaultValue?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);
  const over = length > maxLength;

  return (
    <>
      <textarea
        name={name}
        maxLength={maxLength}
        rows={rows}
        defaultValue={defaultValue}
        onChange={(e) => setLength(e.target.value.length)}
        className="input"
      />
      <span className={`block text-xs mt-1 text-right ${over ? "text-red-600" : "text-neutral-500"}`}>
        {length} / {maxLength}
        {over && " — over the limit, extra text will be trimmed when you save"}
      </span>
    </>
  );
}
