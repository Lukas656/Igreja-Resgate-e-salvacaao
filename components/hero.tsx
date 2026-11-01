import Image from "next/image";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ministryConfig } from "@/lib/config";

export function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <Image
          src={ministryConfig.heroImage}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          fetchPriority="high"
        />
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-orbit" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker">Ministério Resgate &amp; Salvação</p>
          <h1 id="hero-title">
            Um lugar de <span>fé,</span><br />
            <span>esperança</span> e<br />
            <span>transformação.</span>
          </h1>
          <p className="hero-description">
            Conheça o Ministério Resgate &amp; Salvação. Uma igreja comprometida em anunciar o Evangelho de Jesus Cristo e transformar vidas através da Palavra de Deus.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#about">
              Conheça nosso ministério <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a className="button-quiet" href="#videos">
              Assista às pregações <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-note"><span className="hero-note-mark" aria-hidden="true" />Há um lugar para você.</div>
        </div>
      </div>
      <a className="hero-bottom" href="#scripture-title" aria-label="Desça para conhecer uma palavra de esperança">
        Uma palavra de esperança <ArrowDown size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
