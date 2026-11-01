import { ArrowUpRight, Facebook, Instagram, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ministryConfig } from "@/lib/config";

const icons: Record<string, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

export function SocialLinks() {
  return (
    <section className="social-section section-pad" id="social" aria-labelledby="social-title">
      <div className="section-shell">
        <span className="eyebrow">Conecte-se conosco</span>
        <h2 className="section-title" id="social-title">A fé também se <em>compartilha.</em></h2>
        <p className="section-lead">Acompanhe o ministério e fique por dentro das mensagens, encontros e novidades da comunidade.</p>
        <div className="social-grid">
          {ministryConfig.socials.map((social) => {
            const Icon = icons[social.kind];
            return (
              <article className="social-card" key={social.kind}>
                <span className="social-icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
                <h3>{social.name}</h3>
                <p>{social.description}</p>
                {social.href ? (
                  <a className="social-action" href={social.href} target="_blank" rel="noreferrer">
                    {social.label} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="social-action social-action-muted" aria-label={`${social.name}: endereço oficial a configurar`}>
                    Endereço oficial a configurar
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
