import type { WorshipColor, WorshipKind, WorshipSchedule } from "@/lib/worship-schedule";

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
  worshipTimeZone: string;
  worshipVerse: { text: string; reference: string };
  worshipServices: Array<{
    id: string;
    name: string;
    kind: WorshipKind;
    description: string;
    badge: string;
    time: string;
    durationMinutes: number;
    color: WorshipColor;
    schedule: WorshipSchedule;
    location?: string;
    mapsUrl?: string;
  }>;
  youtube: {
    channelId: string;
    playlists: { sermons: string; services: string; events: string; worship: string };
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
  worshipTimeZone: "America/Sao_Paulo",
  worshipVerse: {
    text: "Ebenézer — Até aqui nos ajudou o Senhor.",
    reference: "1 Samuel 7:12",
  },
  worshipServices: [
     {
      id: "culto-domingo",
      name: "Domingo",
      kind: "culto",
      description: "Um tempo de louvor, Palavra e comunhão para toda a família.",
      badge: "Toda semana",
      time: "09:00",
      durationMinutes: 120,
      color: "blue",
      schedule: { type: "weekly", weekdays: ["sunday"] },
      skipWhenSameDayAs: ["culto-ceia"],
      location:  "Resgate & salvação - Feliciano de mendonça 251, JD Soares",
      mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.55307534877826%2C-46.40007463177939",
    },
    {
      id: "culto-ceia",
      name: "Santa Ceia",
      kind: "culto",
      description: "Celebração da Ceia do Senhor e comunhão da igreja.",
      badge: "2º domingo do mês",
      time: "09:00",
      durationMinutes: 120,
      color: "gold",
      schedule: { type: "monthlyNthWeekday", weekday: "sunday", nth: 2 },
      location:  "Resgate & salvação - Feliciano de mendonça 251, JD Soares",
      mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.55307534877826%2C-46.40007463177939",
    },
     {
      id: "culto-missoes-2026-11-14",
      name: "Missões",
      kind: "evento",
      description: "Uma noite dedicada à obra missionária e ao anúncio do Evangelho.",
      badge: "Culto especial · 14/11",
      time: "18:00",
      durationMinutes: 120,
      color: "teal",
      schedule: { type: "once", date: "2026-11-14" },
      location:  "Resgate & salvação - Feliciano de mendonça 251, JD Soares",
      mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.55307534877826%2C-46.40007463177939",
    },,
  ],
  youtube: {
    channelId: "UCOdAqwVy0cqNU7mmL4O-Ybg",
    playlists: { sermons: "", services: "", events: "", worship: "" },
  },
};

export const siteDescription =
  "Conheça o Ministério Resgate & Salvação: uma igreja comprometida em anunciar o Evangelho de Jesus Cristo, acolher pessoas e compartilhar esperança através da Palavra de Deus.";
