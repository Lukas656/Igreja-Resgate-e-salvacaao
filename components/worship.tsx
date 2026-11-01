import { ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { ministryConfig } from "@/lib/config";

export function Worship() {
  const service = ministryConfig.worshipServices[0];
  const hasMap = Boolean(ministryConfig.contact.mapsUrl);

  return (
    <section className="worship-section section-pad" id="worship" aria-labelledby="worship-title">
      <div className="section-shell">
        <div className="worship-top">
          <div>
            <span className="eyebrow">Nossos encontros</span>
            <h2 className="section-title" id="worship-title">Há um lugar à mesa <em>para você.</em></h2>
          </div>
          <p className="section-lead">Reunimo-nos para adorar, aprender da Palavra e compartilhar a vida em comunidade.</p>
        </div>

        <div className="worship-grid">
          <article className="worship-card">
            <div>
              <div className="worship-card-top">
                <span className="worship-icon"><CalendarDays size={24} aria-hidden="true" /></span>
                <span className="service-badge">Encontro semanal</span>
              </div>
              <h3>{service.name}</h3>
              <div className="worship-time"><Clock3 size={15} aria-hidden="true" /><strong>{service.time}</strong><span>horário local</span></div>
              <p className="worship-place"><MapPin size={16} aria-hidden="true" /><span>{ministryConfig.contact.address || "Endereço da igreja a confirmar."}</span></p>
            </div>
            <div className="worship-card-foot">
              <span className="service-badge">Todos são bem-vindos</span>
              {hasMap ? (
                <a className="button-line" href={ministryConfig.contact.mapsUrl} target="_blank" rel="noreferrer">
                  Como chegar <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ) : (
                <span className="button-line" aria-disabled="true">
                  Como chegar <ArrowUpRight size={14} aria-hidden="true" />
                </span>
              )}
            </div>
          </article>

          <aside className="worship-verse" aria-label="Versículo de 1 Samuel 7:12">
            <Sparkles className="verse-symbol" size={22} aria-hidden="true" />
            <blockquote>“{service.verse}”</blockquote>
            <cite>{service.reference}</cite>
          </aside>
        </div>
      </div>
    </section>
  );
}
