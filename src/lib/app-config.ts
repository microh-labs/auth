import fs from "fs";
import path from "path";

const CONFIG_PATH = path.resolve(process.cwd(), "auth-app-config.json");

export type AppConfig = {
  appName: string;
  description?: string;
  logoUrl?: string;
};

export function saveAppConfig(config: AppConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

export function loadAppConfig(): AppConfig | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
}

export function configExists() {
  return fs.existsSync(CONFIG_PATH);
}
