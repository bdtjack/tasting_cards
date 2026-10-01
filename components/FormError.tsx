/**
 * The red "not saved" banner shown when a form action redirects back with
 * ?error=<code>. Unknown codes show nothing.
 */
export default function FormError({
  code,
  messages,
}: {
  code: string | undefined;
  messages: Record<string, string>;
}) {
  const message = code ? messages[code] : undefined;
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
      Not saved. {message}
    </p>
  );
}

/**
 * Browser-side check that a required text field isn't just spaces (plain
 * `required` accepts "   "), so the person sees the problem before
 * submitting instead of losing what they typed.
 */
export const NOT_BLANK = { pattern: ".*\\S.*", title: "This can't be blank" } as const;
