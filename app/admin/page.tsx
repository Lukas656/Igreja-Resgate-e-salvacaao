import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminSession } from "@/lib/auth/admin-auth";
import { getAdminContentSnapshot } from "@/lib/site-content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Painel administrativo | Ministério Resgate & Salvação", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) return <AdminLogin />;
  let snapshot = null;
  try { snapshot = await getAdminContentSnapshot(); } catch { /* O painel apresenta estado de conexão indisponível sem publicar defaults. */ }
  const initialSnapshot = snapshot ? {
    draft: snapshot.draft,
    draftRevision: snapshot.draftRevision,
    publishedRevision: snapshot.publishedRevision,
    draftUpdatedAt: snapshot.draftUpdatedAt.toISOString(),
    publishedAt: snapshot.publishedAt?.toISOString() ?? null,
  } : null;
  return <AdminPanel session={session} initialSnapshot={initialSnapshot} />;
}
