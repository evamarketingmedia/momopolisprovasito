import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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

function checkLegacyAdminCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME?.trim() || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;

  return (
    safeEqual(username.trim(), expectedUsername) &&
    safeEqual(password, expectedPassword)
  );
}

export async function checkAdminCredentials(
  emailOrUsername: string,
  password: string
): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  // Once Supabase Auth is configured it becomes the authoritative login
  // source. The legacy environment credentials remain only as a migration
  // fallback for installations that have not enabled Auth yet.
  if (!supabaseUrl || !supabaseAnonKey || !supabase) {
    return checkLegacyAdminCredentials(emailOrUsername, password);
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.signInWithPassword({
    email: emailOrUsername.trim(),
    password,
  });

  if (error || !data.user) return false;

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("active")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    console.error("[admin-auth] unable to verify admin allowlist", adminError);
    return false;
  }

  return adminUser?.active === true;
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
