import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import path from "path";
import os from "os";

const homeDir = os.homedir();
const dbDir = path.join(homeDir, ".microh-auth");
const dbPath = path.join(dbDir, "drizzle.db");

const client = createClient({ url: `file:${dbPath}` });

export const db = drizzle({ client });
