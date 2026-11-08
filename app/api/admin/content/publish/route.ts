import { NextResponse } from "next/server";
import { getAdminSession, isValidAdminCsrf } from "@/lib/auth/admin-auth";
import { DatabaseUnavailableError, publishDraft } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const noStore = { "Cache-Control": "no-store, max-age=0" };
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: noStore });
  if (!(await isValidAdminCsrf(request, session))) return NextResponse.json({ error: "forbidden" }, { status: 403, headers: noStore });
  try { return NextResponse.json(await publishDraft(), { headers: noStore }); }
  catch (error) { if (error instanceof DatabaseUnavailableError) return NextResponse.json({ code: "database_unavailable" }, { status: 503, headers: noStore }); throw error; }
}
