import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getAdminSessionCookieName, isValidAdminCsrf } from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!await isValidAdminCsrf(request, session)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });

  let secure = false;
  try { secure = new URL(request.headers.get("origin") || "").protocol === "https:"; }
  catch { secure = request.nextUrl.hostname !== "localhost" && request.nextUrl.hostname !== "127.0.0.1"; }
  const response = NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  response.cookies.set(getAdminSessionCookieName(), "", {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
