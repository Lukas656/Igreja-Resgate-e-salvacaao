import "server-only";
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
function requiredUri(): string { if (!uri) throw new Error("DATABASE_UNAVAILABLE"); return uri; }

type MongoGlobal = typeof globalThis & { __resgateMongoClient?: MongoClient; __resgateMongoPromise?: Promise<MongoClient> };
const globalMongo = globalThis as MongoGlobal;

export function getMongoClient(): Promise<MongoClient> {
  if (globalMongo.__resgateMongoClient) return Promise.resolve(globalMongo.__resgateMongoClient);
  if (!globalMongo.__resgateMongoPromise) {
    const client = new MongoClient(requiredUri(), { serverSelectionTimeoutMS: 5000 });
    globalMongo.__resgateMongoPromise = client.connect().then((connected) => {
      globalMongo.__resgateMongoClient = connected;
      return connected;
    }).catch((error) => {
      globalMongo.__resgateMongoPromise = undefined;
      throw error;
    });
  }
  return globalMongo.__resgateMongoPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  const databaseName = process.env.MONGODB_DB_NAME?.trim();
  return databaseName ? client.db(databaseName) : client.db();
}
