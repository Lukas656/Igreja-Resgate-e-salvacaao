import { stdin, stdout } from "node:process";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readSecret(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Execute este comando em um terminal interativo para que a senha não apareça na tela.");
  }
  stdout.write(prompt);
  return new Promise((resolve, reject) => {
    let value = "";
    const finish = (error) => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };
    const onData = (input) => {
      const chunk = input.toString("utf8");
      for (const character of chunk) {
        if (character === "\u0003") return finish(new Error("Operação cancelada."));
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u007f" || character === "\b") value = value.slice(0, -1);
        else if (character >= " ") value += character;
      }
    };
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

const uri = process.env.MONGODB_URI;
const email = normalizeEmail(process.env.ADMIN_EMAIL);
const databaseName = process.env.MONGODB_DB_NAME?.trim();

if (!uri || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Configure MONGODB_URI e ADMIN_EMAIL no ambiente local antes de continuar.");
  process.exit(1);
}

let client;
try {
  const password = await readSecret("Nova senha do administrador (entrada oculta): ");
  const confirmation = await readSecret("Confirme a senha: ");
  if (password !== confirmation) throw new Error("As senhas não coincidem.");
  if (password.length < 10) throw new Error("A senha precisa ter pelo menos 10 caracteres; recomenda-se uma senha única com 16 ou mais.");
  if (Buffer.byteLength(password, "utf8") > 72) throw new Error("A senha excede o limite seguro de 72 bytes do bcrypt.");

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(databaseName || undefined);
  const admins = db.collection("admin_users");
  try {
    await admins.createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      throw new Error("A coleção admin_users contém e-mails duplicados. Corrija-os no Compass antes do seed.");
    }
    throw error;
  }
  await db.collection("admin_login_attempts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  await admins.updateOne(
    { email },
    {
      $set: { passwordHash, role: "admin", active: true, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  console.log("Conta administrativa configurada no MongoDB. Nenhuma senha em texto puro foi gravada.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Não foi possível configurar a conta administrativa.");
  process.exitCode = 1;
} finally {
  if (client) await client.close().catch(() => undefined);
}
