import { NextRequest, NextResponse } from "next/server";
import { oauthStateNonce } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";
const STATE_COOKIE = "webdev_oauth_state";

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function allowedOrigin(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.origin !== value || parsed.username || parsed.password) return false;
  if (parsed.protocol === "https:") {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured) {
      try {
        const configuredUrl = new URL(configured);
        if (configuredUrl.origin === parsed.origin) return true;
      } catch {
        // Invalid public URL does not authorize an origin.
      }
    }
    return parsed.hostname.endsWith(".manus.computer");
  }
  return process.env.NODE_ENV !== "production" && parsed.protocol === "http:" &&
    (parsed.origin === "http://localhost:3000" || parsed.origin === "http://127.0.0.1:3000");
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get("origin") || "";
  const portal = process.env.MANUS_OAUTH_PORTAL_URL;
  const appId = process.env.MANUS_PROJECT_ID;
  if (!allowedOrigin(origin) || !portal || !appId) {
    return noStore(NextResponse.json({ error: "Authentication unavailable" }, { status: 400 }));
  }

  const redirectUri = `${origin}/api/auth/callback`;
  const nonce = oauthStateNonce();
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce }), "utf8").toString("base64url");
  const authorization = new URL(`${portal.replace(/\/$/, "")}/app-auth`);
  authorization.searchParams.set("appId", appId);
  authorization.searchParams.set("redirectUri", redirectUri);
  authorization.searchParams.set("state", state);
  authorization.searchParams.set("responseType", "code");

  const response = NextResponse.redirect(authorization, 302);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https://"),
    sameSite: origin.startsWith("https://") ? "none" : "lax",
    path: "/api/auth/callback",
    maxAge: 10 * 60,
  });
  return noStore(response);
}
