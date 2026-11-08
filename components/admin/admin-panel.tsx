"use client";

import { useState } from "react";
import { ArrowLeft, Check, Cloud, LogOut, Save, Send, ShieldCheck } from "lucide-react";
import type { SiteContent } from "@/lib/site-content-model";
import { defaultSiteContent } from "@/lib/site-content-model";
import { AdminSections, type AdminSectionKey } from "@/components/admin/admin-sections";

type ClientSnapshot = { draft: SiteContent; draftRevision: number; publishedRevision: number; draftUpdatedAt: string; publishedAt: string | null };
type AdminPanelProps = { session: { email: string; name: string; csrfToken: string }; initialSnapshot: ClientSnapshot | null };
const tabs: Array<{ id: AdminSectionKey; label: string }> = [
  { id: "identity", label: "Marca e navegação" }, { id: "hero", label: "Hero" }, { id: "verse", label: "Versículo" },
  { id: "about", label: "Sobre" }, { id: "worship", label: "Cultos e eventos" }, { id: "videos", label: "Pregações" },
  { id: "socials", label: "Contatos e redes" }, { id: "location", label: "Localização" }, { id: "footer", label: "Rodapé" },
];

export function AdminPanel({ session, initialSnapshot }: AdminPanelProps) {
  const [content, setContent] = useState<SiteContent>(initialSnapshot?.draft ?? defaultSiteContent);
  const [active, setActive] = useState<AdminSectionKey>("identity");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(Boolean(initialSnapshot));
  const [draftRevision, setDraftRevision] = useState(initialSnapshot?.draftRevision ?? 0);
  const [publishedRevision, setPublishedRevision] = useState(initialSnapshot?.publishedRevision ?? 0);
  const [notice, setNotice] = useState(initialSnapshot ? "Conteúdo carregado do MongoDB Atlas." : "");
  const [error, setError] = useState(initialSnapshot ? "" : "Não foi possível acessar o MongoDB Atlas. Verifique a Network Access do cluster e a conectividade do servidor.");

  function receiveSnapshot(snapshot: ClientSnapshot) {
    setContent(snapshot.draft);
    setDraftRevision(snapshot.draftRevision);
    setPublishedRevision(snapshot.publishedRevision);
    setDatabaseReady(true);
    setDirty(false);
  }

  async function saveDraft(): Promise<boolean> {
    const response = await fetch("/api/admin/content", {
      method: "PUT", credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-csrf-token": session.csrfToken },
      body: JSON.stringify({ content }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(response.status === 503 ? "O servidor não conseguiu acessar o MongoDB Atlas. Confirme Network Access, credenciais e rede do servidor." : response.status === 401 ? "Sua sessão administrativa expirou. Entre novamente." : response.status === 400 ? "Há um campo inválido. Revise os dados da seção e tente salvar novamente." : "Não foi possível salvar o rascunho.");
      setNotice("");
      return false;
    }
    receiveSnapshot(data as ClientSnapshot);
    setNotice("Rascunho salvo com segurança no MongoDB Atlas.");
    setError("");
    return true;
  }

  async function handleSave() {
    setBusy(true); setError(""); setNotice("");
    try { await saveDraft(); }
    catch { setError("Falha de comunicação ao salvar. Verifique a conexão e tente novamente."); }
    finally { setBusy(false); }
  }

  async function handlePublish() {
    setBusy(true); setError(""); setNotice("");
    try {
      if (!(await saveDraft())) return;
      const response = await fetch("/api/admin/content/publish", { method: "POST", credentials: "same-origin", headers: { "x-csrf-token": session.csrfToken } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(response.status === 503 ? "O Atlas ficou indisponível antes da publicação. Seu rascunho foi salvo; tente publicar novamente." : response.status === 401 ? "Sua sessão administrativa expirou. Entre novamente." : "Não foi possível publicar o conteúdo.");
        return;
      }
      receiveSnapshot(data as ClientSnapshot);
      setNotice("Publicado! O site já consulta a nova versão do conteúdo.");
    } catch { setError("Falha de comunicação ao publicar. O rascunho salvo não foi descartado."); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: { "x-csrf-token": session.csrfToken } });
      if (!response.ok) { setError("Não foi possível encerrar a sessão agora. Tente novamente."); setBusy(false); return; }
      window.location.assign("/admin");
    } catch {
      setError("Falha de comunicação ao sair. Sua sessão continua ativa; tente novamente.");
      setBusy(false);
    }
  }

  return <main className="admin-app">
    <header className="admin-topbar"><a className="admin-back-link" href="/"><ArrowLeft size={16} aria-hidden="true" />Voltar ao site</a><div className="admin-user"><span className="admin-user-mark"><ShieldCheck size={16} aria-hidden="true" /></span><span><strong>{session.name || "Administrador"}</strong><small>{session.email}</small></span><button className="admin-icon-button" type="button" onClick={logout} disabled={busy} aria-label="Sair"><LogOut size={17} /></button></div></header>
    <div className="admin-main"><div className="admin-page-heading"><div><span className="admin-eyebrow">Painel do ministério</span><h1>Gerenciar conteúdo</h1><p>Edite o rascunho, salve as mudanças e publique quando estiver pronto.</p></div><a className="admin-preview-link" href="/" target="_blank" rel="noreferrer">Ver site <ArrowLeft size={14} aria-hidden="true" /></a></div>
      {!databaseReady ? <div className="admin-alert admin-alert-error" role="alert"><strong>Banco indisponível.</strong> {error}<span>Enquanto isso, o editor permanece bloqueado para evitar mostrar ou salvar dados como se viessem do banco.</span></div> : null}
      <div className="admin-revision-row"><span><Cloud size={15} aria-hidden="true" /> MongoDB Atlas</span><span>Rascunho v{draftRevision}</span><span>Publicado v{publishedRevision}</span>{dirty ? <span className="admin-unsaved">Alterações não salvas</span> : <span className="admin-clean"><Check size={14} />Sincronizado</span>}</div>
      {error && databaseReady ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}
      {notice ? <div className="admin-alert admin-alert-success" role="status">{notice}</div> : null}
      <div className="admin-workspace"><nav className="admin-tabs" aria-label="Seções editáveis">{tabs.map((tab) => <button type="button" key={tab.id} className="admin-tab" aria-current={active === tab.id ? "page" : undefined} onClick={() => setActive(tab.id)}>{tab.label}</button>)}</nav>
        <div className="admin-editor"><fieldset className="admin-form-fieldset" disabled={!databaseReady || busy}><AdminSections active={active} content={content} onChange={(next) => { setContent(next); setDirty(true); setNotice(""); }} /></fieldset></div>
      </div>
      <footer className="admin-savebar"><div><strong>{dirty ? "Há mudanças aguardando salvamento" : "Rascunho pronto"}</strong><span>Salvar não altera o site público até você publicar.</span></div><div className="admin-save-actions"><button className="admin-button admin-button-secondary" type="button" onClick={handleSave} disabled={busy || !databaseReady || !dirty}><Save size={16} aria-hidden="true" />{busy ? "Salvando…" : "Salvar rascunho"}</button><button className="admin-button admin-button-primary" type="button" onClick={handlePublish} disabled={busy || !databaseReady}><Send size={15} aria-hidden="true" />{busy ? "Processando…" : "Publicar no site"}</button></div></footer>
    </div>
  </main>;
}
