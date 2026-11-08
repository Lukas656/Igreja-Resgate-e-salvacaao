import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSession,
  getAdminSessionCookieName,
  getClearedAdminSessionCookieOptions,
  isValidAdminCsrf,
} from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  if (!await isValidAdminCsrf(request, session)) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });

  const response = NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  response.cookies.set(getAdminSessionCookieName(), "", getClearedAdminSessionCookieOptions());
  return response;
}
