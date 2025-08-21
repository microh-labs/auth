import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAppConfig } from "@/lib/useAppConfig";

export default function AuthHome() {
  const navigate = useNavigate();
  const config = useAppConfig();
  const [jwtData, setJwtData] = React.useState<any>(null);
  const [jwtError, setJwtError] = React.useState<string | null>(null);
  const fallbackLogo =
    "https://avatars.githubusercontent.com/u/227540007?s=200&v=4";
  const appName = config?.appName || "Auth Service";
  const description =
    config?.description || "Authentication for your ecosystem of apps.";
  const logoUrl = config?.logoUrl || fallbackLogo;

  React.useEffect(() => {
    if (config && (!config.appName || !config.publicKey)) {
      navigate("/setup", { replace: true });
    }
    // Try to verify JWT if present
    const token = localStorage.getItem("auth_jwt");
    if (token && config?.publicKey) {
      // Use browser crypto.subtle for verification (assume JWT is RS256)
      // Fallback: decode payload without verification
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        setJwtData(decoded);
        setJwtError(null);
      } catch (e) {
        setJwtError("Invalid token");
      }
    } else {
      setJwtData(null);
    }
  }, [config, navigate]);

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
          {jwtData ? (
            <Card className="bg-muted/60 border-none shadow-none">
              <CardHeader className="flex flex-col items-center gap-2 pb-0">
                <Avatar className="w-16 h-16 mb-2 border border-border shadow bg-white">
                  <AvatarFallback className="text-lg">
                    {jwtData.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-center text-xl font-semibold">
                  {jwtData.username || "User"}
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  Signed in
                </CardDescription>
              </CardHeader>
              <Separator className="my-2" />
              <CardContent className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground mb-1">
                  JWT Claims
                </div>
                <pre className="whitespace-pre-wrap break-all bg-background rounded p-2 border text-xs">
                  {JSON.stringify(jwtData, null, 2)}
                </pre>
                <Button
                  className="mt-4"
                  variant="secondary"
                  onClick={() => {
                    localStorage.removeItem("auth_jwt");
                    window.location.reload();
                  }}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          ) : jwtError ? (
            <div className="text-destructive">{jwtError}</div>
          ) : (
            <>
              <Button asChild className="w-full h-11 text-base">
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full h-11 text-base"
              >
                <Link to="/auth/login">Login</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
