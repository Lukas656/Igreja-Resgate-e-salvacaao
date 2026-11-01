import { Facebook, Instagram, Youtube } from "lucide-react";
import { ministryConfig } from "@/lib/config";
import { BrandLockup } from "@/components/brand-lockup";

const footerNav = [
  ["O Ministério", "#about"],
  ["Cultos", "#worship"],
  ["Pregações e eventos", "#videos"],
  ["Contato", "#contact"],
] as const;

const socialIcons = { instagram: Instagram, facebook: Facebook, youtube: Youtube };

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="section-shell footer-main">
        <div className="footer-brand">
          <BrandLockup ariaLabel="Voltar ao início" />
          <p>{ministryConfig.footerStatement}</p>
        </div>
        <div>
          <h2 className="footer-heading">Navegue</h2>
          <nav className="footer-links" aria-label="Links do rodapé">
            {footerNav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
        </div>
        <div>
          <h2 className="footer-heading">Redes sociais</h2>
          <div className="footer-links">
            {ministryConfig.socials.map((social) => {
              const Icon = socialIcons[social.kind];
              return social.href ? (
                <a key={social.kind} href={social.href} target="_blank" rel="noreferrer" className="icon-inline" style={{ justifyContent: "flex-start", gap: ".5rem" }}>
                  <Icon size={14} aria-hidden="true" /> {social.name}
                </a>
              ) : <span key={social.kind}>{social.name} · link a configurar</span>;
            })}
            {ministryConfig.contact.phoneDisplay ? <a href={`tel:${ministryConfig.contact.phoneDisplay.replace(/[^+\d]/g, "")}`}>{ministryConfig.contact.phoneDisplay}</a> : <span>Contato oficial a configurar</span>}
          </div>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <p>© {year} {ministryConfig.name}. Todos os direitos reservados.</p>
        <p>Fé, esperança e transformação em Cristo Jesus.</p>
      </div>
    </footer>
  );
}
