import type { Metadata, Viewport } from "next";
import { ministryConfig, siteDescription } from "@/lib/config";
import { safePublicUrl } from "@/lib/utils";
import "./globals.css";

const publicOrigin = safePublicUrl(ministryConfig.siteUrl);

export const metadata: Metadata = {
  metadataBase: publicOrigin ? new URL(publicOrigin) : undefined,
  title: "Ministério Resgate & Salvação | Uma casa de fé",
  description: siteDescription,
  applicationName: ministryConfig.name,
  icons: { icon: "https://i.ibb.co/L7GZksj/logo.png", shortcut: "https://i.ibb.co/L7GZksj/logo.png" },
  ...(publicOrigin
    ? {
        alternates: { canonical: publicOrigin },
        openGraph: {
          type: "website" as const,
          url: publicOrigin,
          siteName: ministryConfig.name,
          title: "Ministério Resgate & Salvação | Uma casa de fé",
          description: siteDescription,
          images: [{ url: ministryConfig.heroImage, width: 1200, height: 675, alt: ministryConfig.name }],
          locale: "pt_BR",
        },
        twitter: {
          card: "summary_large_image" as const,
          title: "Ministério Resgate & Salvação | Uma casa de fé",
          description: siteDescription,
          images: [ministryConfig.heroImage],
        },
      }
    : {}),
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#061638",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
