"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { checkBusinessSlug, signup, type SignupState } from "./actions";
import { BUSINESS_CATEGORY_OPTIONS } from "@/lib/types";
import { LIMITS } from "@/lib/validate";
import {
  BUSINESS_SLUG_MAX,
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  cleanBusinessSlug,
  localSlugProblem,
  typingBusinessSlug,
  type SlugStatus,
} from "@/lib/signupRules";

type CheckState = SlugStatus | "checking" | "error";

const SLUG_MESSAGES: Record<CheckState, { text: string; tone: string }> = {
  checking: { text: "Checking…", tone: "text-neutral-500" },
  available: { text: "Available", tone: "text-green-700" },
  taken: { text: "Already taken. Try another.", tone: "text-red-600" },
  reserved: { text: "Reserved by Pour Tags. Try another.", tone: "text-red-600" },
  invalid: { text: "Use at least 2 letters or numbers.", tone: "text-red-600" },
  error: { text: "Couldn't check right now. It'll be checked when you submit.", tone: "text-neutral-500" },
};

export default function SignupForm({ host }: { host: string }) {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, {});

  const [name, setName] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [slugCheck, setSlugCheck] = useState<CheckState | null>(null);

  // Until they touch the web-address box, it follows the business name.
  const slug = cleanBusinessSlug(slugEdited ? slugInput : name);
  const latestCheck = useRef(0);

  useEffect(() => {
    if (!slug) {
      setSlugCheck(null);
      return;
    }
    const local = localSlugProblem(slug);
    if (local) {
      setSlugCheck(local);
      return;
    }
    setSlugCheck("checking");
    const id = ++latestCheck.current;
    const timer = setTimeout(async () => {
      try {
        const status = await checkBusinessSlug(slug);
        if (id === latestCheck.current) setSlugCheck(status);
      } catch {
        if (id === latestCheck.current) setSlugCheck("error");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [slug]);

  const slugBlocked = slugCheck === "taken" || slugCheck === "reserved" || slugCheck === "invalid";
  const fieldError = (field: SignupState["field"]) =>
    state.field === field ? "border-red-400 focus:ring-red-300" : "";

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {state.error}
          {state.field === "email" && state.error.includes("Log in") && (
            <>
              {" "}
              <Link href="/login" className="underline">
                Go to login
              </Link>
            </>
          )}
        </p>
      )}

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Business name</span>
        <input
          name="name"
          required
          maxLength={LIMITS.name}
          autoComplete="organization"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`input ${fieldError("name")}`}
        />
      </label>

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Web address for your cards</span>
        <input
          name="slug"
          required
          maxLength={BUSINESS_SLUG_MAX}
          autoCapitalize="none"
          spellCheck={false}
          value={slugEdited ? slugInput : slug}
          onChange={(e) => {
            setSlugEdited(true);
            setSlugInput(typingBusinessSlug(e.target.value));
          }}
          className={`input ${fieldError("slug")}`}
        />
        <span className="block text-xs text-neutral-500 mt-1 break-all">
          {host}/<span className="text-neutral-800">{slug || "your-business"}</span>
        </span>
        <span className="block text-xs min-h-4">
          {slugCheck && (
            <span className={SLUG_MESSAGES[slugCheck].tone}>{SLUG_MESSAGES[slugCheck].text}</span>
          )}
        </span>
        <span className="block text-xs text-neutral-500 mt-1">
          This goes into every QR code you print, so it can&apos;t be changed later.
        </span>
      </label>

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Type of business</span>
        <select
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`input ${fieldError("category")}`}
        >
          <option value="" disabled>
            Choose one
          </option>
          {BUSINESS_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="block text-xs text-neutral-500 mt-1">
          Pick Mixed if you serve more than one kind, like wine and spirits.
        </span>
      </label>

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={EMAIL_MAX_LENGTH}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`input ${fieldError("email")}`}
        />
        <span className="block text-xs text-neutral-500 mt-1">You&apos;ll use this to log in.</span>
      </label>

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`input ${fieldError("password")}`}
        />
        <span className="block text-xs text-neutral-500 mt-1">
          At least {PASSWORD_MIN_LENGTH} characters.
        </span>
      </label>

      <label className="block">
        <span className="block text-sm text-neutral-600 mb-1">Confirm password</span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`input ${fieldError("confirm")}`}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-neutral-600">
        <input
          name="terms"
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="underline">
            Privacy Policy
          </Link>
          , and I&apos;m authorized to sign up on behalf of this business.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending || slugBlocked || slugCheck === "checking"}
        className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md text-sm disabled:opacity-50"
      >
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
