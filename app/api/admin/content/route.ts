import { NextResponse } from "next/server";
import { getAdminSession, isValidAdminCsrf } from "@/lib/auth/admin-auth";
import { SiteContentSchema } from "@/lib/site-content-model";
import { DatabaseUnavailableError, getAdminContentSnapshot, saveDraft } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const noStore = { "Cache-Control": "no-store, max-age=0" };
const unavailable = () => NextResponse.json({ code: "database_unavailable" }, { status: 503, headers: noStore });
async function authorized(request: Request) {
  const session = await getAdminSession();
  if (!session) return { response: NextResponse.json({ error: "unauthorized" }, { status: 401, headers: noStore }) };
  if (!(await isValidAdminCsrf(request, session))) return { response: NextResponse.json({ error: "forbidden" }, { status: 403, headers: noStore }) };
  return { session };
}
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: noStore });
  try { return NextResponse.json(await getAdminContentSnapshot(), { headers: noStore }); }
  catch (error) { if (error instanceof DatabaseUnavailableError) return unavailable(); throw error; }
}
export async function PUT(request: Request) {
  const auth = await authorized(request);
  if (auth.response) return auth.response;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: noStore }); }
  const shape = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const result = SiteContentSchema.safeParse(shape.content);
  if (!result.success) return NextResponse.json({ error: "invalid_content", issues: result.error.issues.slice(0, 30).map(({ path, message, code }) => ({ path: path.join("."), message, code })) }, { status: 400, headers: noStore });
  try { return NextResponse.json(await saveDraft(result.data), { headers: noStore }); }
  catch (error) { if (error instanceof DatabaseUnavailableError) return unavailable(); if (error instanceof TypeError) return NextResponse.json({ error: "invalid_content" }, { status: 400, headers: noStore }); throw error; }
}
