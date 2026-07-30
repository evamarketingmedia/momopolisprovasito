import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "momo_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set — required to run the /admin panel. See .env.example."
    );
  }
  return secret;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", getSecret()).update(`momo-admin:${expiresAt}`).digest("hex");
}

function buildToken(expiresAt: number): string {
  return `${expiresAt}.${sign(expiresAt)}`;
}

function isValidToken(token: string): boolean {
  const [expiresAtStr, signature] = token.split(".");
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !signature || Number.isNaN(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;

  const expected = sign(expiresAt);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function safeEqual(value: string, expected: string): boolean {
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;

  return (
    safeEqual(username.trim(), expectedUsername) &&
    safeEqual(password, expectedPassword)
  );
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const store = await cookies();
  store.set(COOKIE_NAME, buildToken(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    return isValidToken(token);
  } catch {
    return false;
  }
}

/** Call at the top of any admin Server Action or page. Redirects (throws) if
 * the caller isn't authenticated — never trust the client-side UI gating. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
