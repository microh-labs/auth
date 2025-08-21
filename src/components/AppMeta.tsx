import { Helmet } from "react-helmet-async";
import { useAppConfig } from "@/lib/useAppConfig";

export default function AppMeta() {
  const config = useAppConfig();
  const appName = config?.appName || "Auth Service";
  const description =
    config?.description || "Authentication for your ecosystem of apps.";
  const logoUrl =
    config?.logoUrl ||
    "https://avatars.githubusercontent.com/u/227540007?s=200&v=4";

  return (
    <Helmet>
      <title>{appName} | Auth</title>
      <meta name="description" content={description} />
      <link rel="icon" type="image/png" href={logoUrl} />
    </Helmet>
  );
}
