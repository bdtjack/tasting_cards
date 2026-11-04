/**
 * Public signup stays off until SIGNUP_OPEN is set to "true" in Vercel's
 * environment variables. Leave it off in Production until the Terms of
 * Service and Privacy Policy pages (/terms and /privacy) are live and
 * Stripe billing is connected — otherwise anyone could create a free
 * account with no card on file.
 */
export function isSignupOpen(): boolean {
  return process.env.SIGNUP_OPEN === "true";
}
