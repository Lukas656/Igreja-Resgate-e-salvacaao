import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { SocialLinks } from "@/components/social-links";
import { VideoLibrary } from "@/components/video-library";
import { Worship } from "@/components/worship";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <Header />
      <main id="main-content">
        <Hero />
        <section className="scripture-band" aria-labelledby="scripture-title">
          <div className="section-shell scripture-inner">
            <span className="eyebrow" id="scripture-title">Uma palavra de esperança</span>
            <blockquote>
              “Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.”
            </blockquote>
            <cite>Mateus 11:28</cite>
          </div>
        </section>
        <About />
        <Worship />
        <VideoLibrary />
        <SocialLinks />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
