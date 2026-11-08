import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getAdminEmailAllowlist,
  getAdminSessionCookieName,
  makeCsrfToken,
  type AdminSession,
} from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";
const STATE_COOKIE = "webdev_oauth_state";

type OAuthState = { redirectUri: string; nonce: string };
type TokenReply = { accessToken?: unknown };
type UserReply = { openId?: unknown; email?: unknown; name?: unknown };

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function isAllowedCallbackOrigin(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.origin !== value || url.username || url.password) return false;
  if (url.protocol === "https:") {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured) {
      try {
        if (new URL(configured).origin === url.origin) return true;
      } catch {
        // Invalid public URL does not authorize an origin.
      }
    }
    return url.hostname.endsWith(".manus.computer");
  }
  return process.env.NODE_ENV !== "production" && url.protocol === "http:" &&
    (url.origin === "http://localhost:3000" || url.origin === "http://127.0.0.1:3000");
}

function readState(encoded: string | undefined): OAuthState | null {
  if (!encoded || encoded.length > 4096) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<OAuthState>;
    return typeof parsed.redirectUri === "string" && typeof parsed.nonce === "string" && parsed.nonce.length >= 32
      ? { redirectUri: parsed.redirectUri, nonce: parsed.nonce }
      : null;
  } catch {
    return null;
  }
}

function errorRedirect(origin: string | null): NextResponse {
  const target = origin && isAllowedCallbackOrigin(origin) ? `${origin}/admin?auth=error` : "/admin?auth=error";
  const response = NextResponse.redirect(target, 303);
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: !!origin?.startsWith("https://"), sameSite: origin?.startsWith("https://") ? "none" : "lax", path: "/api/auth/callback", maxAge: 0 });
  return noStore(response);
}

export async function GET(request: NextRequest) {
  const returnedState = request.nextUrl.searchParams.get("state") || undefined;
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  const parsed = readState(returnedState);
  const origin = parsed ? (() => { try { return new URL(parsed.redirectUri).origin; } catch { return null; } })() : null;
  if (!returnedState || !cookieState || returnedState !== cookieState || !parsed || !origin ||
      !isAllowedCallbackOrigin(origin) || parsed.redirectUri !== `${origin}/api/auth/callback` ||
      !request.nextUrl.searchParams.get("code")) {
    return errorRedirect(origin);
  }

  const code = request.nextUrl.searchParams.get("code")!;
  const apiBase = process.env.MANUS_OAUTH_API_URL;
  const appId = process.env.MANUS_PROJECT_ID;
  const allowedEmail = getAdminEmailAllowlist();
  if (!apiBase || !appId || !allowedEmail) return errorRedirect(origin);

  try {
    const tokenResponse = await fetch(`${apiBase.replace(/\/$/, "")}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ clientId: appId, grantType: "authorization_code", code, redirectUri: parsed.redirectUri }),
    });
    if (!tokenResponse.ok) return errorRedirect(origin);
    const tokenData = await tokenResponse.json() as TokenReply;
    if (typeof tokenData.accessToken !== "string" || !tokenData.accessToken) return errorRedirect(origin);

    const userResponse = await fetch(`${apiBase.replace(/\/$/, "")}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ accessToken: tokenData.accessToken }),
    });
    if (!userResponse.ok) return errorRedirect(origin);
    const user = await userResponse.json() as UserReply;
    if (typeof user.openId !== "string" || !user.openId || typeof user.email !== "string" ||
        user.email.trim().toLowerCase() !== allowedEmail) return errorRedirect(origin);

    const csrfToken = makeCsrfToken();
    const session: AdminSession = { email: user.email.trim().toLowerCase(), name: typeof user.name === "string" ? user.name : "", csrfToken };
    const jwt = await createAdminSessionToken({ openId: user.openId, ...session });
    const response = NextResponse.redirect(`${origin}/admin`, 303);
    response.cookies.set(getAdminSessionCookieName(), jwt, {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: origin.startsWith("https://") ? "none" : "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: origin.startsWith("https://"), sameSite: origin.startsWith("https://") ? "none" : "lax", path: "/api/auth/callback", maxAge: 0 });
    return noStore(response);
  } catch {
    return errorRedirect(origin);
  }
}
