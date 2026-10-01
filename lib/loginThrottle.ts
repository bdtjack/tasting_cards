import { headers } from "next/headers";
import { prisma } from "./prisma";

// Limits password guessing. Every failed login is recorded against both the
// email that was tried and the IP address it came from; once either has too
// many failures in the window, further attempts are refused until it passes.
//
// Kept in the database (LoginAttempt) rather than in memory because Vercel
// runs many short-lived server instances — an in-memory counter would reset
// constantly and be split across them.
//
// Every function here "fails open": if the table is missing (e.g. the code
// deployed before `npm run db:push` added it) or the query errors, login
// still works normally rather than locking everyone out.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_EMAIL = 8;
const MAX_FAILURES_PER_IP = 30;
const KEEP_RECORDS_MS = 24 * 60 * 60 * 1000;

export const LOGIN_LOCKOUT_MINUTES = WINDOW_MS / 60000;

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function isLoginBlocked(email: string, ip: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - WINDOW_MS);
    const [byEmail, byIp] = await Promise.all([
      email
        ? prisma.loginAttempt.count({ where: { key: `email:${email}`, createdAt: { gte: since } } })
        : 0,
      prisma.loginAttempt.count({ where: { key: `ip:${ip}`, createdAt: { gte: since } } }),
    ]);
    return byEmail >= MAX_FAILURES_PER_EMAIL || byIp >= MAX_FAILURES_PER_IP;
  } catch (err) {
    console.error("Login throttle check failed (allowing login):", err);
    return false;
  }
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  try {
    await prisma.loginAttempt.createMany({
      data: [...(email ? [{ key: `email:${email}` }] : []), { key: `ip:${ip}` }],
    });
    // Housekeeping: nothing older than a day is ever looked at again.
    await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - KEEP_RECORDS_MS) } },
    });
  } catch (err) {
    console.error("Couldn't record failed login:", err);
  }
}

/** A successful login wipes that email's failures, so typos earlier don't linger. */
export async function clearFailedLogins(email: string): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({ where: { key: `email:${email}` } });
  } catch {
    // Not important enough to surface.
  }
}
