import { z } from "zod";
import type { WorshipColor, WorshipKind, WorshipSchedule } from "@/lib/worship-schedule";

const text = (max = 2000) => z.string().max(max);
const safeHref = z.string().max(2048).refine((value) => {
  if (!value) return true;
  if (/^#[A-Za-z0-9_-]+$/.test(value)) return true;
  if (/^\/[A-Za-z0-9/_#?&=.%+-]*$/.test(value) && !value.startsWith("//")) return true;
  try { const url = new URL(value); return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol); } catch { return false; }
}, "Use âncora relativa ou URL http(s), mailto ou tel segura.");
const mediaUrl = z.string().max(2048).refine((value) => {
  if (!value) return true;
  if (/^\/(?!\/)[A-Za-z0-9/_#?&=.%+-]*$/.test(value)) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use URL http(s) ou caminho local seguro.");
const googleMapsEmbedUrl = z.string().max(2048).refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    const validHost = ["www.google.com", "maps.google.com"].includes(url.hostname.toLowerCase());
    const validPath = url.pathname === "/maps/embed" || url.pathname === "/maps/d/embed" || (url.pathname === "/maps" && url.searchParams.get("output") === "embed");
    return url.protocol === "https:" && validHost && validPath;
  } catch { return false; }
}, "Use URL HTTPS oficial de incorporação do Google Maps.");
const weekday = z.enum(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000 || year > 9999) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, "Informe uma data de calendário válida.");
const schedule = z.discriminatedUnion("type", [
  z.object({ type: z.literal("weekly"), weekdays: z.array(weekday).min(1).max(7) }).strict(),
  z.object({ type: z.literal("monthlyNthWeekday"), weekday, nth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(-1)]) }).strict(),
  z.object({ type: z.literal("monthlyDay"), day: z.number().int().min(1).max(31) }).strict(),
  z.object({ type: z.literal("once"), date: calendarDate }).strict(),
]);
const serviceSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/), name: text(120).min(1), kind: z.enum(["culto", "evento"]), description: text(500), badge: text(100), time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/), durationMinutes: z.number().int().min(1).max(1440), color: z.enum(["blue", "gold", "violet", "teal", "rose"]), schedule,
  skipWhenSameDayAs: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100)).max(20).optional(), location: text(300).optional(), mapsUrl: safeHref.optional(),
}).strict();
export const SiteContentSchema = z.object({
  brand: z.object({ name: text(120).min(1), shortName: text(30).min(1), logoUrl: mediaUrl }).strict(),
  navigation: z.array(z.object({ id: z.string().min(1).max(60).regex(/^[a-zA-Z0-9_-]+$/), label: text(80).min(1), href: safeHref }).strict()).max(20),
  hero: z.object({ backgroundUrl: mediaUrl, disclaimer: text(200), title: text(240), subtitle: text(500), note: text(160), buttons: z.array(z.object({ label: text(100).min(1), href: safeHref, variant: z.enum(["primary", "quiet"]) }).strict()).max(6) }).strict(),
  verse: z.object({ eyebrow: text(100), text: text(500), reference: text(100) }).strict(),
  about: z.object({ eyebrow: text(100), title: text(200), description: text(1000), quote: text(300), cards: z.array(z.object({ title: text(100), text: text(400), icon: z.enum(["heart", "book", "compass", "sparkles"]) }).strict()).max(12) }).strict(),
  worship: z.object({ eyebrow: text(100), title: text(200), description: text(500), timeZone: z.string().min(1).max(100).refine((v) => { try { Intl.DateTimeFormat("en", { timeZone: v }); return true; } catch { return false; } }), verse: z.object({ text: text(300), reference: text(100) }).strict(), services: z.array(serviceSchema).max(50).superRefine((items, ctx) => { const ids = new Set<string>(); items.forEach((v, i) => { if (ids.has(v.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [i, "id"], message: "IDs devem ser únicos." }); ids.add(v.id); }); }) }).strict(),
  videos: z.object({ eyebrow: text(100), title: text(200), subtitle: text(500) }).strict(),
  socialSection: z.object({ eyebrow: text(100), title: text(200), description: text(500) }).strict(),
  socials: z.array(z.object({ name: text(60).min(1), description: text(300), href: safeHref, label: text(100), kind: z.enum(["instagram", "facebook", "youtube"]) }).strict()).max(3),
  location: z.object({ eyebrow: text(100), title: text(200), description: text(500), address: text(300), phoneDisplay: text(60), whatsappUrl: safeHref, mapsUrl: safeHref, mapsEmbedUrl: googleMapsEmbedUrl, buttonText: text(80), mapPlaceholderTitle: text(150), mapPlaceholderDescription: text(300) }).strict(),
  footer: z.object({ logoUrl: mediaUrl, name: text(120), description: text(500), closingNote: text(200), copyrightText: text(200), links: z.array(z.object({ label: text(100), href: safeHref }).strict()).max(20) }).strict(),
}).strict();
export type SiteContent = z.infer<typeof SiteContentSchema>;

export const defaultSiteContent: SiteContent = {
  brand: { name: "Ministério Resgate & Salvação", shortName: "R&S", logoUrl: "/manus-storage/logo_1933ec48.png" },
  navigation: [{ id: "home", label: "Início", href: "#home" }, { id: "about", label: "O Ministério", href: "#about" }, { id: "worship", label: "Cultos", href: "#worship" }, { id: "videos", label: "Pregações e eventos", href: "#videos" }, { id: "contact", label: "Contato", href: "#contact" }],
  hero: { backgroundUrl: "/manus-storage/async-images/1qWIF5YtMoRUtUIVds0uI6/image-1.webp", disclaimer: "Ministério Resgate & Salvação", title: "Um lugar de fé, esperança e transformação.", subtitle: "Conheça o Ministério Resgate & Salvação. Uma igreja comprometida em anunciar o Evangelho de Jesus Cristo e transformar vidas através da Palavra de Deus.", note: "Há um lugar para você.", buttons: [{ label: "Conheça nosso ministério", href: "#about", variant: "primary" }, { label: "Assista às pregações", href: "#videos", variant: "quiet" }] },
  verse: { eyebrow: "Uma palavra de esperança", text: "Ebenézer — Até aqui nos ajudou o Senhor.", reference: "1 Samuel 7:12" },
  about: { eyebrow: "O ministério", title: "Mais que uma igreja, uma família em Cristo.", description: "Somos uma comunidade comprometida em anunciar o Evangelho, acolher pessoas e compartilhar o amor de Jesus Cristo. Um lugar para caminhar junto, encontrar esperança e ser fortalecido pela Palavra.", quote: "Fé que acolhe. Palavra que transforma. Esperança em Cristo.", cards: [{ title: "Nossa missão", text: "Anunciar o Evangelho de Jesus Cristo com amor, acolhendo cada pessoa.", icon: "heart" }, { title: "Nossa fé", text: "Jesus Cristo no centro e a Palavra de Deus como direção para a vida.", icon: "book" }, { title: "Nossa visão", text: "Compartilhar esperança e ver vidas transformadas pela mensagem de Cristo.", icon: "compass" }] },
  worship: { eyebrow: "Nossos encontros", title: "Há um lugar à mesa para você.", description: "Reunimo-nos para adorar, aprender da Palavra e compartilhar a vida em comunidade.", timeZone: "America/Sao_Paulo", verse: { text: "Ebenézer — Até aqui nos ajudou o Senhor.", reference: "1 Samuel 7:12" }, services: [
    { id: "culto-domingo", name: "Culto de Domingo", kind: "culto", description: "Um tempo de louvor, Palavra e comunhão para toda a família.", badge: "Toda semana", time: "09:00", durationMinutes: 120, color: "blue", schedule: { type: "weekly", weekdays: ["sunday"] }, skipWhenSameDayAs: ["culto-ceia"] },
    { id: "culto-ceia", name: "Culto de Ceia", kind: "culto", description: "Celebração da Ceia do Senhor e comunhão da igreja.", badge: "2º domingo do mês", time: "09:00", durationMinutes: 120, color: "gold", schedule: { type: "monthlyNthWeekday", weekday: "sunday", nth: 2 } },
    { id: "culto-missoes-2026-11-14", name: "Culto de Missões", kind: "evento", description: "Uma noite dedicada à obra missionária e ao anúncio do Evangelho.", badge: "Evento especial · 14/11", time: "18:00", durationMinutes: 120, color: "teal", schedule: { type: "once", date: "2026-11-14" } },
  ] as Array<{ id: string; name: string; kind: WorshipKind; description: string; badge: string; time: string; durationMinutes: number; color: WorshipColor; schedule: WorshipSchedule; skipWhenSameDayAs?: string[] }> },
  videos: { eyebrow: "Pregações e eventos", title: "Assista e seja edificado pela Palavra.", subtitle: "Acompanhe nossas pregações, cultos, eventos e mensagens que fortalecem nossa fé." },
  socialSection: { eyebrow: "Conecte-se conosco", title: "A fé também se compartilha.", description: "Acompanhe o ministério e fique por dentro das mensagens, encontros e novidades da comunidade." },
  socials: [{ name: "Instagram", description: "Acompanhe os registros e novidades do ministério.", href: "", label: "Acessar Instagram", kind: "instagram" }, { name: "Facebook", description: "Conecte-se à nossa comunidade e acompanhe as publicações.", href: "", label: "Acessar Facebook", kind: "facebook" }, { name: "YouTube", description: "Assista às pregações, cultos e eventos do ministério.", href: "https://www.youtube.com/channel/UCOdAqwVy0cqNU7mmL4O-Ybg", label: "Acessar YouTube", kind: "youtube" }],
  location: { eyebrow: "Localização e contato", title: "Será uma alegria receber você.", description: "Estamos preparando nossos canais de contato oficiais. Os dados serão atualizados assim que forem informados.", address: "", phoneDisplay: "", whatsappUrl: "", mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-23.55307534877826%2C-46.40007463177939", mapsEmbedUrl: "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s-23.55307534877826,-46.40007463177939!6i16", buttonText: "Como chegar", mapPlaceholderTitle: "Estamos preparando o caminho", mapPlaceholderDescription: "O mapa será exibido aqui quando o endereço oficial da igreja for configurado." },
  footer: { logoUrl: "/manus-storage/logo_1933ec48.png", name: "Ministério Resgate & Salvação", description: "Ministério Resgate & Salvação — Anunciando o Evangelho, resgatando vidas e proclamando a salvação em Cristo Jesus.", closingNote: "Fé, esperança e transformação em Cristo Jesus.", copyrightText: "Todos os direitos reservados.", links: [{ label: "O Ministério", href: "#about" }, { label: "Cultos", href: "#worship" }, { label: "Pregações e eventos", href: "#videos" }, { label: "Contato", href: "#contact" }] },
};
