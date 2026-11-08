"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, LockKeyhole, ShieldCheck } from "lucide-react";

export function AdminLogin() {
  const [authError, setAuthError] = useState(false);
  const [starting, setStarting] = useState(false);
  useEffect(() => setAuthError(new URLSearchParams(window.location.search).get("auth") === "error"), []);

  function startLogin() {
    setStarting(true);
    const origin = window.location.origin;
    window.location.assign(`/api/auth/login?origin=${encodeURIComponent(origin)}`);
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card" aria-labelledby="admin-login-title">
        <span className="admin-auth-mark"><LockKeyhole size={22} aria-hidden="true" /></span>
        <span className="admin-eyebrow">Área administrativa</span>
        <h1 id="admin-login-title">Gerencie o conteúdo do ministério.</h1>
        <p>Acesse com sua conta Manus autorizada. Apenas a conta configurada pelo administrador poderá editar e publicar este site.</p>
        {authError ? <p className="admin-alert admin-alert-error" role="alert">Não foi possível confirmar a conta autorizada. Entre com a conta Manus configurada para este projeto.</p> : null}
        <button className="admin-button admin-button-primary admin-login-button" type="button" disabled={starting} onClick={startLogin}>
          <ShieldCheck size={17} aria-hidden="true" />{starting ? "Redirecionando…" : "Entrar com a Manus"}<ArrowUpRight size={15} aria-hidden="true" />
        </button>
        <p className="admin-security-note">Autenticação segura · sem senha armazenada neste site</p>
      </section>
    </main>
  );
}
