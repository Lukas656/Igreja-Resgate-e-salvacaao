"use client";

import { useState, type FormEvent } from "react";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        window.location.assign("/admin");
        return;
      }
      if (response.status === 429) setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      else if (response.status === 503 || data.error === "login_unavailable") setError("Não foi possível validar o acesso agora. Verifique a conexão do servidor com o MongoDB Atlas e tente novamente.");
      else setError("E-mail ou senha inválidos.");
    } catch {
      setError("Falha de comunicação. Verifique sua conexão e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card" aria-labelledby="admin-login-title">
        <span className="admin-auth-mark"><LockKeyhole size={22} aria-hidden="true" /></span>
        <span className="admin-eyebrow">Área administrativa</span>
        <h1 id="admin-login-title">Gerencie o conteúdo do ministério.</h1>
        <p>Acesse com o e-mail administrativo autorizado e a senha cadastrada no MongoDB Atlas.</p>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-label" htmlFor="admin-email">E-mail</label>
          <input
            className="admin-login-input"
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            maxLength={254}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoCapitalize="none"
            spellCheck={false}
          />
          <label className="admin-login-label" htmlFor="admin-password">Senha</label>
          <input
            className="admin-login-input"
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={72}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="admin-alert admin-alert-error" role="alert">{error}</p> : null}
          <button className="admin-login-submit" type="submit" disabled={busy}>
            {busy ? <span className="admin-login-spinner" aria-hidden="true" /> : <KeyRound size={17} aria-hidden="true" />}
            {busy ? "Validando acesso…" : "Entrar no painel"}
            {!busy ? <ShieldCheck size={16} aria-hidden="true" /> : null}
          </button>
        </form>
        <p className="admin-security-note">Acesso restrito · sem cadastro público · senha protegida por hash</p>
      </section>
    </main>
  );
}
