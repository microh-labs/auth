import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { appConfigTable } from "../db/schema";

export type AppConfig = {
  appName: string;
  description?: string;
  logoUrl?: string;
  privateKey?: string;
  publicKey?: string;
};

// Upsert config as a single row with id 'singleton'
export async function saveAppConfig(config: AppConfig) {
  await db.delete(appConfigTable).where(eq(appConfigTable.id, "singleton"));
  await db.insert(appConfigTable).values({
    id: "singleton",
    appName: config.appName,
    description: config.description,
    logoUrl: config.logoUrl,
    privateKey: config.privateKey,
    publicKey: config.publicKey,
  });
}

export async function loadAppConfig(): Promise<AppConfig | null> {
  const row = await db
    .select()
    .from(appConfigTable)
    .where(eq(appConfigTable.id, "singleton"))
    .get();
  if (!row) return null;
  const { appName, description, logoUrl, privateKey, publicKey } = row;
  return {
    appName,
    description: description ?? undefined,
    logoUrl: logoUrl ?? undefined,
    privateKey: privateKey ?? undefined,
    publicKey: publicKey ?? undefined,
  };
}

export async function configExists() {
  const row = await db
    .select()
    .from(appConfigTable)
    .where(eq(appConfigTable.id, "singleton"))
    .get();
  return !!row;
}
