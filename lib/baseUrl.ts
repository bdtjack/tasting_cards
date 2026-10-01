import { headers } from "next/headers";

/**
 * The address baked into QR codes and shown in the dashboard.
 *
 * QR codes get printed, so they must always point at the real production
 * domain — never at whatever address the dashboard happened to be opened
 * on (a Vercel preview URL, or the *.vercel.app address once a custom
 * domain exists). In order of preference:
 *
 *   1. APP_BASE_URL, if set — set this in Vercel's Production environment
 *      variables to your custom domain (e.g. https://pourtags.com) once you
 *      have one. It always wins.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — set automatically by Vercel on every
 *      deployment (preview ones too) to the project's production domain.
 *   3. The address of the current request (local development).
 */
export function resolveBaseUrl(requestOrigin: string): string {
  const explicit = process.env.APP_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;
  return requestOrigin;
}

/** resolveBaseUrl() for Server Components, which have no Request object. */
export async function baseUrlForPage(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return resolveBaseUrl(`${proto}://${host}`);
}

/** "https://pourtags.com" → "pourtags.com", for showing addresses to people. */
export function displayHost(baseUrl: string): string {
  return baseUrl.replace(/^https?:\/\//, "");
}
