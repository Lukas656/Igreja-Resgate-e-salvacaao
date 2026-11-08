import "server-only";
import { createHmac } from "node:crypto";
import type { Collection, Document } from "mongodb";
import { getAdminMongoDb } from "@/lib/mongodb";

type LoginAttempt = Document & { _id: string; attempts: number; expiresAt: Date };
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
let indexPromise: Promise<string> | undefined;

function hashIdentifier(value: string): string {
  const key = process.env.ADMIN_SESSION_SECRET || "resgate-admin-unconfigured";
  return createHmac("sha256", key).update(value).digest("hex");
}

async function attemptsCollection(): Promise<Collection<LoginAttempt>> {
  const collection = (await getAdminMongoDb()).collection<LoginAttempt>("admin_login_attempts");
  indexPromise ??= collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch((error) => {
    indexPromise = undefined;
    throw error;
  });
  await indexPromise;
  return collection;
}

export function getAdminLoginRateLimitKeys(email: string, ip: string): string[] {
  return [
    `pair:${hashIdentifier(`${email}\u0000${ip}`)}`,
    `ip:${hashIdentifier(ip)}`,
  ];
}

export async function getAdminLoginRateLimit(keys: string[]): Promise<number> {
  const now = new Date();
  const active = await (await attemptsCollection())
    .find({ _id: { $in: keys }, expiresAt: { $gt: now } })
    .toArray();
  const blocked = active.filter((item) => item.attempts >= MAX_ATTEMPTS);
  if (!blocked.length) return 0;
  return Math.max(1, ...blocked.map((item) => Math.ceil((item.expiresAt.getTime() - now.getTime()) / 1000)));
}

export async function recordFailedAdminLogin(keys: string[]): Promise<void> {
  const collection = await attemptsCollection();
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS);
  for (const key of keys) {
    const update = [{
        $set: {
          attempts: {
            $cond: [
              { $gt: ["$expiresAt", now] },
              { $add: [{ $ifNull: ["$attempts", 0] }, 1] },
              1,
            ],
          },
          expiresAt: { $cond: [{ $gt: ["$expiresAt", now] }, "$expiresAt", resetAt] },
        },
      }];
    try {
      await collection.updateOne({ _id: key }, update, { upsert: true });
    } catch (error) {
      if (!error || typeof error !== "object" || !("code" in error) || error.code !== 11000) throw error;
      await collection.updateOne({ _id: key }, update);
    }
  }
}

export async function clearAdminLoginAttempts(keys: string[]): Promise<void> {
  await (await attemptsCollection()).deleteMany({ _id: { $in: keys } });
}
