import { ArrowUpRight, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { ministryConfig } from "@/lib/config";

export function Contact() {
  const contact = ministryConfig.contact;
  const hasAddress = Boolean(contact.address);
  const hasPhone = Boolean(contact.phoneDisplay);
  const hasMap = Boolean(contact.mapsUrl);
  const hasEmbed = Boolean(contact.mapsEmbedUrl);

  return (
    <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title">
      <div className="section-shell">
        <span className="eyebrow">Localização e contato</span>
        <h2 className="section-title" id="contact-title">Será uma alegria <em>receber você.</em></h2>
        <p className="section-lead">Estamos preparando nossos canais de contato oficiais. Os dados serão atualizados assim que forem informados.</p>

        <div className="contact-layout">
          <div className="contact-panel">
            <div className="contact-item">
              <span className="contact-icon"><MapPin size={19} aria-hidden="true" /></span>
              <div><strong>Endereço</strong><span>{hasAddress ? contact.address : "Endereço oficial a confirmar."}</span></div>
            </div>
            {/* <div className="contact-item">
              <span className="contact-icon"><Phone size={18} aria-hidden="true" /></span>
              <div><strong>Telefone</strong>
                {hasPhone ? <a href={`tel:${contact.phoneDisplay.replace(/[^+\d]/g, "")}`}>{contact.phoneDisplay}</a> : <span>Telefone oficial a confirmar.</span>}
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><MessageCircle size={18} aria-hidden="true" /></span>
              <div><strong>WhatsApp</strong>
                {contact.whatsappUrl ? <a href={contact.whatsappUrl} target="_blank" rel="noreferrer">Fale conosco pelo WhatsApp</a> : <span>Link oficial a configurar.</span>}
              </div>
            </div> */}
            <div className="contact-actions">
              {hasMap ? (
                <a className="button-primary" href={contact.mapsUrl} target="_blank" rel="noreferrer">
                  Como chegar <Navigation size={15} aria-hidden="true" />
                </a>
              ) : (
                <span className="button-primary" aria-disabled="true">
                  Como chegar <Navigation size={15} aria-hidden="true" />
                </span>
              )}
              {contact.whatsappUrl ? (
                <a className="button-line" href={contact.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14} aria-hidden="true" /></a>
              ) : null}
            </div>
          </div>

          <div className="map-panel" aria-label="Localização do ministério no Google Maps">
            {hasEmbed ? (
              <iframe
                src={contact.mapsEmbedUrl}
                title="Mapa da localização do Ministério Resgate & Salvação"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="map-placeholder">
                <span className="map-pin"><MapPin size={28} aria-hidden="true" /></span>
                <strong>Estamos preparando o caminho</strong>
                <span>O mapa será exibido aqui quando o endereço oficial da igreja for configurado.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
