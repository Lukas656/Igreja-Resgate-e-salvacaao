import { randomBytes } from "node:crypto";
import { isIP } from "node:net";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMongoDb } from "@/lib/mongodb";
import {
  createAdminSessionToken,
  getAdminEmailAllowlist,
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  makeCsrfToken,
} from "@/lib/auth/admin-auth";
import {
  clearAdminLoginAttempts,
  getAdminLoginRateLimit,
  getAdminLoginRateLimitKeys,
  recordFailedAdminLogin,
} from "@/lib/auth/admin-login-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
}).strict();

type AdminUser = {
  email: string;
  passwordHash: string;
  role: "admin";
  active: boolean;
};

let dummyHashPromise: Promise<string> | undefined;
function getDummyPasswordHash(): Promise<string> {
  dummyHashPromise ??= bcrypt.hash(randomBytes(32).toString("hex"), 12);
  return dummyHashPromise;
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function requestIp(request: NextRequest): string {
  const real = request.headers.get("x-real-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",").map((value) => value.trim()).at(-1);
  if (real && isIP(real)) return real;
  if (forwarded && isIP(forwarded)) return forwarded;
  return "unknown";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStore(NextResponse.json({ error: "invalid_request" }, { status: 400 }));
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success || Buffer.byteLength(parsed.data?.password ?? "", "utf8") > 72) {
    return noStore(NextResponse.json({ error: "invalid_request" }, { status: 400 }));
  }

  const email = parsed.data.email.toLowerCase();
  const allowedEmail = getAdminEmailAllowlist();
  const keys = getAdminLoginRateLimitKeys(email, requestIp(request));

  try {
    if (!allowedEmail || !process.env.ADMIN_SESSION_SECRET || Buffer.byteLength(process.env.ADMIN_SESSION_SECRET, "utf8") < 32) {
      return noStore(NextResponse.json({ error: "login_unavailable" }, { status: 503 }));
    }

    const lockedFor = await getAdminLoginRateLimit(keys);
    if (lockedFor > 0) {
      const response = NextResponse.json({ error: "rate_limited" }, { status: 429 });
      response.headers.set("Retry-After", String(lockedFor));
      return noStore(response);
    }

    const db = await getMongoDb();
    const user = email === allowedEmail
      ? await db.collection<AdminUser>("admin_users").findOne({ email })
      : null;
    const passwordHash = user && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.passwordHash)
      ? user.passwordHash
      : await getDummyPasswordHash();
    const passwordMatches = await bcrypt.compare(parsed.data.password, passwordHash).catch(() => false);
    const authenticated = Boolean(
      user && user.email === allowedEmail && user.active === true && user.role === "admin" && passwordMatches,
    );

    if (!authenticated) {
      await recordFailedAdminLogin(keys);
      return noStore(NextResponse.json({ error: "invalid_credentials" }, { status: 401 }));
    }

    await clearAdminLoginAttempts(keys);
    const csrfToken = makeCsrfToken();
    const token = await createAdminSessionToken({ email, name: "Administrador", csrfToken });
    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(getAdminSessionCookieName(), token, getAdminSessionCookieOptions());
    return noStore(response);
  } catch {
    return noStore(NextResponse.json({ error: "login_unavailable" }, { status: 503 }));
  }
}
