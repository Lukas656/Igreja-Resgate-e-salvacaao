import Image from "next/image";
import type { MouseEventHandler } from "react";
import { ministryConfig } from "@/lib/config";

type BrandLockupProps = {
  ariaLabel: string;
  priority?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function BrandLockup({ ariaLabel, priority = false, onClick }: BrandLockupProps) {
  const logoPath = ministryConfig.officialLogoPath || "/images/logo.png";

  return (
    <a className="brand-lockup" href="#home" aria-label={ariaLabel} onClick={onClick}>
      <span className="brand-symbol official-brand-symbol" aria-hidden="true">
        <Image src={logoPath} alt="" width={42} height={42} priority={priority} unoptimized className="brand-logo-image" />
      </span>
      <span className="brand-copy">
        <span className="brand-name">RESGATE &amp; SALVAÇÃO</span>
        <span className="brand-caption">Ministério</span>
      </span>
    </a>
  );
}
