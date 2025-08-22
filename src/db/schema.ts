import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
});

export const appConfigTable = sqliteTable("app_config", {
  id: text("id").primaryKey().default("singleton"), // always "singleton"
  appName: text("app_name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  privateKey: text("private_key"),
  publicKey: text("public_key"),
});
