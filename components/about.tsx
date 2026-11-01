import { ArrowUpRight, BookOpen, Compass, HeartHandshake, Sparkles } from "lucide-react";

const values = [
  {
    title: "Nossa missão",
    text: "Anunciar o Evangelho de Jesus Cristo com amor, acolhendo cada pessoa.",
    Icon: HeartHandshake,
  },
  {
    title: "Nossa fé",
    text: "Jesus Cristo no centro e a Palavra de Deus como direção para a vida.",
    Icon: BookOpen,
  },
  {
    title: "Nossa visão",
    text: "Compartilhar esperança e ver vidas transformadas pela mensagem de Cristo.",
    Icon: Compass,
  },
];

export function About() {
  return (
    <section className="about-section section-pad" id="about" aria-labelledby="about-title">
      <div className="section-shell about-grid">
        <div className="about-copy">
          <span className="eyebrow">O ministério</span>
          <h2 className="section-title" id="about-title">Mais que uma igreja, <em>uma família</em> em Cristo.</h2>
          <p className="section-lead">
            Somos uma comunidade comprometida em anunciar o Evangelho, acolher pessoas e compartilhar o amor de Jesus Cristo. Um lugar para caminhar junto, encontrar esperança e ser fortalecido pela Palavra.
          </p>
          <div className="about-quote">
            <Sparkles size={17} aria-hidden="true" />
            <span>Fé que acolhe. Palavra que transforma. Esperança em Cristo.</span>
          </div>
        </div>
        <div className="values-stack" aria-label="Nossa missão, fé e visão">
          {values.map(({ title, text, Icon }) => (
            <article className="value-card" key={title}>
              <span className="value-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
              <span>
                <h3>{title}</h3>
                <p>{text}</p>
              </span>
              <ArrowUpRight className="value-arrow" size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
