"use client";

import { useState } from "react";
import { Facebook, Instagram, Menu, X, Youtube } from "lucide-react";
import { ministryConfig } from "@/lib/config";
import { BrandLockup } from "@/components/brand-lockup";

const navigation = [
  ["Início", "#home"],
  ["O Ministério", "#about"],
  ["Cultos", "#worship"],
  ["Pregações e eventos", "#videos"],
  ["Contato", "#contact"],
] as const;

const socialIcons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
};

export function Header() {
  const [open, setOpen] = useState(false);

  return (
      <header className="site-header">
      <div className="header-inner">
        <BrandLockup ariaLabel="Ministério Resgate & Salvação — início" priority onClick={() => setOpen(false)} />

        <nav id="primary-menu" className="nav-links" aria-label="Navegação principal" data-open={open}>
          {navigation.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>

        <div className="header-socials" aria-label="Redes sociais">
          {ministryConfig.socials.map((social) => {
            const Icon = socialIcons[social.kind];
            return social.href ? (
              <a className="header-social" href={social.href} key={social.kind} target="_blank" rel="noreferrer" aria-label={social.name}>
                <Icon size={15} aria-hidden="true" />
              </a>
            ) : (
              <span className="header-social" key={social.kind} role="img" aria-label={`${social.name}: link oficial a configurar`} title={`${social.name}: link oficial a configurar`}>
                <Icon size={15} aria-hidden="true" />
              </span>
            );
          })}
        </div>

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
    </header>
  );
}
