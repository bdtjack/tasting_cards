import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SESSION_COOKIE = "session_token";
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a session row and sets its token as an httpOnly cookie. Must be
 * called from a Server Action or Route Handler (cookies() is read-only in
 * a plain Server Component render).
 */
export async function createSession(businessId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({ data: { token, businessId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Reads the session cookie and returns the logged-in business, or null if
 * there isn't a valid one. Safe to call from Server Components, Server
 * Actions, or Route Handlers.
 *
 * This is the ONLY place a dashboard page/action should determine which
 * business is acting — never a hardcoded slug, never a value trusted from
 * the request body or URL. That's what makes tenant isolation real rather
 * than assumed.
 */
export async function getCurrentBusiness() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { business: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session.business;
}

/** Ends the current session, both in the database and the browser cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {
      // Already gone — fine, that's the end state we wanted anyway.
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}
