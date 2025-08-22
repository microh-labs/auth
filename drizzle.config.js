import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import path from "path";
import os from "os";

const homeDir = os.homedir();
const dbDir = path.join(homeDir, ".microh-auth");
const dbPath = path.join(dbDir, "drizzle.db");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
});
