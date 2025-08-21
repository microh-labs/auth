import { useState, useEffect } from "react";

export type AppConfig = {
  appName?: string;
  description?: string;
  logoUrl?: string;
  publicKey?: string;
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  useEffect(() => {
    fetch("/auth/api/app-config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);
  return config;
}
