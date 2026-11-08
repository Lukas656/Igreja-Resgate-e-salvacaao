import "server-only";
import type { Collection, Document } from "mongodb";
import { getMongoDb } from "@/lib/mongodb";
import { defaultSiteContent, SiteContentSchema, type SiteContent } from "@/lib/site-content-model";

type ContentRecord = Document & {
  _id: "main"; draft: SiteContent; published: SiteContent;
  draftUpdatedAt: Date; publishedAt: Date | null; draftRevision: number; publishedRevision: number;
};
export class DatabaseUnavailableError extends Error {
  readonly code = "database_unavailable";
  constructor() { super("DATABASE_UNAVAILABLE"); this.name = "DatabaseUnavailableError"; }
}
const genericDbLog = () => console.error("[site-content] Database unavailable");
async function collection(): Promise<Collection<ContentRecord>> {
  try {
    const db = await getMongoDb();
    return db.collection<ContentRecord>("site_content");
  } catch { throw new DatabaseUnavailableError(); }
}
export async function ensureSeeded(): Promise<void> {
  try {
    const col = await collection();
    const now = new Date();
    await col.updateOne({ _id: "main" }, { $setOnInsert: { draft: defaultSiteContent, published: defaultSiteContent, draftUpdatedAt: now, publishedAt: now, draftRevision: 1, publishedRevision: 1 } }, { upsert: true });
  } catch { throw new DatabaseUnavailableError(); }
}
export async function getPublishedSiteContent(): Promise<SiteContent> {
  try {
    await ensureSeeded();
    const col = await collection();
    const record = await col.findOne({ _id: "main" }, { readPreference: "primary" });
    if (!record) return defaultSiteContent;
    const parsed = SiteContentSchema.safeParse(record.published);
    return parsed.success ? parsed.data : defaultSiteContent;
  } catch {
    genericDbLog();
    return defaultSiteContent;
  }
}
export type AdminContentSnapshot = { draft: SiteContent; publishedAt: Date | null; draftUpdatedAt: Date; draftRevision: number; publishedRevision: number };
export async function getAdminContentSnapshot(): Promise<AdminContentSnapshot> {
  try {
    await ensureSeeded();
    const record = await (await collection()).findOne({ _id: "main" });
    if (!record) throw new DatabaseUnavailableError();
    return { draft: SiteContentSchema.parse(record.draft), publishedAt: record.publishedAt ?? null, draftUpdatedAt: record.draftUpdatedAt, draftRevision: record.draftRevision, publishedRevision: record.publishedRevision };
  } catch { throw new DatabaseUnavailableError(); }
}
export async function saveDraft(content: SiteContent): Promise<AdminContentSnapshot> {
  const parsed = SiteContentSchema.safeParse(content);
  if (!parsed.success) throw new TypeError("INVALID_SITE_CONTENT");
  try {
    await ensureSeeded();
    const col = await collection();
    await col.updateOne({ _id: "main" }, { $set: { draft: parsed.data, draftUpdatedAt: new Date() }, $inc: { draftRevision: 1 } });
    return await getAdminContentSnapshot();
  } catch { throw new DatabaseUnavailableError(); }
}
export async function publishDraft(): Promise<AdminContentSnapshot> {
  try {
    await ensureSeeded();
    const col = await collection();
    await col.updateOne({ _id: "main" }, [{ $set: { published: "$draft", publishedAt: "$$NOW", publishedRevision: { $add: ["$publishedRevision", 1] } } }]);
    return await getAdminContentSnapshot();
  } catch { throw new DatabaseUnavailableError(); }
}
