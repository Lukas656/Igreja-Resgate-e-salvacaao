import { ArrowUpRight, CalendarDays, Clock3, MapPin, Sparkles } from "lucide-react";
import { WorshipCountdown } from "@/components/worship-countdown";
import { ministryConfig } from "@/lib/config";

export function Worship() {
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
          {ministryConfig.worshipServices.map((service) => {
            const mapsUrl = service.mapsUrl || ministryConfig.contact.mapsUrl;
            const place = service.location || ministryConfig.contact.address || "Endereço da igreja a confirmar.";
            return (
              <article className={`worship-card worship-card--${service.color}`} key={service.id}>
                <div>
                  <div className="worship-card-top">
                    <span className="worship-icon"><CalendarDays size={24} aria-hidden="true" /></span>
                    <span className="service-badge">{service.badge}</span>
                  </div>
                  <span className="worship-kind">{service.kind === "evento" ? "Evento" : "Culto"}</span>
                  <h3>{service.name}</h3>
                  <p className="worship-description">{service.description}</p>
                  <div className="worship-time"><Clock3 size={15} aria-hidden="true" /><strong>{service.time}</strong><span>horário local</span></div>
                  <WorshipCountdown
                    schedule={service.schedule}
                    time={service.time}
                    timeZone={ministryConfig.worshipTimeZone}
                    durationMinutes={service.durationMinutes}
                    skipIfSameDayAs={(service.skipWhenSameDayAs ?? [])
                      .map((relatedId) => ministryConfig.worshipServices.find((item) => item.id === relatedId))
                      .filter((item) => item !== undefined)
                      .map((item) => ({
                        schedule: item.schedule,
                        time: item.time,
                        durationMinutes: item.durationMinutes,
                      }))}
                  />
                  <p className="worship-place"><MapPin size={16} aria-hidden="true" /><span>{place}</span></p>
                </div>
                <div className="worship-card-foot">
                  {mapsUrl ? (
                    <a className="button-line" href={mapsUrl} target="_blank" rel="noreferrer">
                      Como chegar <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <span className="button-line" aria-disabled="true">Como chegar <ArrowUpRight size={14} aria-hidden="true" /></span>
                  )}
                </div>
              </article>
            );
          })}
          {ministryConfig.worshipServices.length === 0 ? (
            <p className="worship-empty">Os próximos encontros serão informados em breve.</p>
          ) : null}
          <aside className="worship-verse" aria-label={`Versículo de ${ministryConfig.worshipVerse.reference}`}>
            <Sparkles className="verse-symbol" size={22} aria-hidden="true" />
            <blockquote>“{ministryConfig.worshipVerse.text}”</blockquote>
            <cite>{ministryConfig.worshipVerse.reference}</cite>
          </aside>
        </div>
      </div>
    </section>
  );
}
