export type SocialNetwork = {
  name: string;
  description: string;
  href: string;
  label: string;
  kind: "instagram" | "facebook" | "youtube";
};

type MinistryConfig = {
  name: string;
  shortName: string;
  tagline: string;
  footerStatement: string;
  heroImage: string;
  officialLogoPath: string;
  siteUrl: string;
  socials: SocialNetwork[];
  contact: {
    address: string;
    phoneDisplay: string;
    whatsappUrl: string;
    mapsUrl: string;
    mapsEmbedUrl: string;
  };
  worshipServices: Array<{
    name: string;
    time: string;
    note: string;
    verse: string;
    reference: string;
  }>;
  youtube: {
    channelId: string;
    playlists: { sermons: string; services: string; events: string };
  };
};

export const ministryConfig: MinistryConfig = {
  name: "Ministério Resgate & Salvação",
  shortName: "R&S",
  tagline: "Uma casa de fé, esperança e transformação.",
  footerStatement:
    "Ministério Resgate & Salvação — Anunciando o Evangelho, resgatando vidas e proclamando a salvação em Cristo Jesus.",
  heroImage: "/manus-storage/async-images/1qWIF5YtMoRUtUIVds0uI6/image-1.webp",
  officialLogoPath: "https://i.ibb.co/L7GZksj/logo.png",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "",
  socials: [
    {
      name: "Instagram",
      description: "Acompanhe os registros e novidades do ministério.",
      href: "https://www.instagram.com/ministerio_resgate_e_salvacao/",
      label: "Acessar Instagram",
      kind: "instagram",
    },
    {
      name: "Facebook",
      description: "Conecte-se à nossa comunidade e acompanhe as publicações.",
      href: "https://www.facebook.com/resgateesalvacao/",
      label: "Acessar Facebook",
      kind: "facebook",
    },
    {
      name: "YouTube",
      description: "Assista às pregações, cultos e eventos do ministério.",
      href: "https://www.youtube.com/@misterioresgatesalvacao213",
      label: "Acessar YouTube",
      kind: "youtube",
    },
  ],
  contact: {
    address: "R. Feliciano de Mendonça, 251 - Jardim São Paulo (Zona Leste) SP, 08460-365",
    phoneDisplay: "",
    whatsappUrl: "",
    mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.55307534877826%2C-46.40007463177939",
    mapsEmbedUrl: "https://www.google.com/maps?q=-23.55307534877826%2C-46.40007463177939&z=16&output=embed",
  },
  worshipServices: [
    {
      name: "Culto de Domingo",
      time: "09:00",
      note: "Encontro semanal",
      verse: "Ebenézer — Até aqui nos ajudou o Senhor.",
      reference: "1 Samuel 7:12",
    },
  ],
  youtube: {
    channelId: "UCOdAqwVy0cqNU7mmL4O-Ybg",
    playlists: { sermons: "", services: "PLtxhs7GCODCb1bP8VYrlEMu2jG8nz9QmT", events: "" },
  },
};

export const siteDescription =
  "Conheça o Ministério Resgate & Salvação: uma igreja comprometida em anunciar o Evangelho de Jesus Cristo, acolher pessoas e compartilhar esperança através da Palavra de Deus.";
