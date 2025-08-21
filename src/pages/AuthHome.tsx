import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function AuthHome() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<{
    appName?: string;
    description?: string;
    logoUrl?: string;
  } | null>(null);
  useEffect(() => {
    fetch("/auth/api/app-config")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.appName || !data.publicKey) {
          navigate("/setup", { replace: true });
        } else {
          setConfig(data);
        }
      })
      .catch(() => navigate("/setup", { replace: true }));
  }, [navigate]);
  const fallbackLogo =
    "https://avatars.githubusercontent.com/u/227540007?s=200&v=4";
  const appName = config?.appName || "Auth Service";
  const description =
    config?.description || "Authentication for your ecosystem of apps.";
  const logoUrl = config?.logoUrl || fallbackLogo;
  return (
    <div className="flex flex-col items-center justify-center min-h-svh w-full bg-background px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <Avatar className="w-20 h-20 mb-2 border border-border shadow bg-white">
            <AvatarImage
              src={logoUrl}
              alt="App Logo"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== fallbackLogo) target.src = fallbackLogo;
              }}
            />
            <AvatarFallback className="text-lg">
              {appName[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            {appName}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full h-11 text-base">
            <Link to="/auth/signup">Sign Up</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full h-11 text-base">
            <Link to="/auth/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
