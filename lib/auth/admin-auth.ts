import { randomBytes, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminSession = { email: string; name: string; csrfToken: string };

const SESSION_COOKIE = "webdev_app_session";
const SESSION_MAX_AGE = 8 * 60 * 60;

function normalizedEmail(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

function secretKey(): Uint8Array | null {
  const secret = process.env.MANUS_JWT_SECRET;
  return secret ? new TextEncoder().encode(secret) : null;
}

function projectId(): string | null {
  return process.env.MANUS_PROJECT_ID || null;
}

export function getAdminEmailAllowlist(): string | null {
  return normalizedEmail(process.env.ADMIN_EMAIL);
}

export function makeCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createAdminSessionToken(input: {
  openId: string;
  email: string;
  name: string;
  csrfToken: string;
}): Promise<string> {
  const key = secretKey();
  const appId = projectId();
  const email = normalizedEmail(input.email);
  if (!key || !appId || !email || !input.openId || !input.csrfToken) {
    throw new Error("Authentication unavailable");
  }
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    appId,
    openId: input.openId,
    email,
    name: input.name,
    role: "admin",
    csrfToken: input.csrfToken,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(input.openId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE)
    .sign(key);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  const key = secretKey();
  const appId = projectId();
  const allowlist = getAdminEmailAllowlist();
  if (!key || !appId || !allowlist) return null;
  try {
    const { payload, protectedHeader } = await jwtVerify(cookie, key, { algorithms: ["HS256"] });
    const email = normalizedEmail(payload.email);
    if (
      protectedHeader.alg !== "HS256" ||
      payload.appId !== appId ||
      payload.role !== "admin" ||
      !email || email !== allowlist ||
      typeof payload.openId !== "string" || !payload.openId ||
      payload.sub !== payload.openId ||
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

export function oauthStateNonce(): string {
  return randomBytes(32).toString("base64url");
}
