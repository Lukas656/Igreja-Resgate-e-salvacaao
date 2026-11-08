import { randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminSession = { email: string; name: string; csrfToken: string };

const SESSION_COOKIE = "resgate_admin_session";
const SESSION_MAX_AGE = 8 * 60 * 60;
const SESSION_ISSUER = "resgate-admin";
const SESSION_AUDIENCE = "resgate-admin-panel";

function normalizedEmail(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

function secretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) return null;
  return new TextEncoder().encode(secret);
}

export function getAdminEmailAllowlist(): string | null {
  return normalizedEmail(process.env.ADMIN_EMAIL);
}

export function makeCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createAdminSessionToken(input: {
  email: string;
  name: string;
  csrfToken: string;
}): Promise<string> {
  const key = secretKey();
  const email = normalizedEmail(input.email);
  if (!key || !email || email !== getAdminEmailAllowlist() || !input.csrfToken) {
    throw new Error("Authentication unavailable");
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email, name: input.name, role: "admin", csrfToken: input.csrfToken })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setSubject(email)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE)
    .sign(key);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  const key = secretKey();
  const allowlist = getAdminEmailAllowlist();
  if (!key || !allowlist) return null;
  try {
    const { payload, protectedHeader } = await jwtVerify(cookie, key, {
      algorithms: ["HS256"],
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    });
    const email = normalizedEmail(payload.email);
    if (
      protectedHeader.alg !== "HS256" ||
      payload.role !== "admin" ||
      !email || email !== allowlist ||
      payload.sub !== email ||
      typeof payload.name !== "string" ||
      typeof payload.csrfToken !== "string" || !payload.csrfToken
    ) return null;
    return { email, name: payload.name, csrfToken: payload.csrfToken };
  } catch {
    return null;
  }
}

export async function isValidAdminCsrf(request: Request, session: AdminSession): Promise<boolean> {
  const submitted = request.headers.get("x-csrf-token");
  if (!submitted || !session.csrfToken) return false;
  const expectedBytes = Buffer.from(session.csrfToken);
  const submittedBytes = Buffer.from(submitted);
  return expectedBytes.length === submittedBytes.length && timingSafeEqual(expectedBytes, submittedBytes);
}

export function getAdminSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function getClearedAdminSessionCookieOptions() {
  return { ...getAdminSessionCookieOptions(), maxAge: 0 };
}
