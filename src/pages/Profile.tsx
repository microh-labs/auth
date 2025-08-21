import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAppConfig } from "@/lib/useAppConfig";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const config = useAppConfig();
  const navigate = useNavigate();
  const [jwtData, setJwtData] = React.useState<any>(null);
  // jwtError removed (unused)

  React.useEffect(() => {
    // Try to verify JWT if present
    const token = localStorage.getItem("auth_jwt");
    if (token && config?.publicKey) {
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        setJwtData(decoded);
      } catch (e) {
        setJwtData(null);
      }
    } else {
      setJwtData(null);
    }
  }, [config]);

  if (!jwtData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh w-full bg-background px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <CardTitle className="text-center text-2xl font-bold tracking-tight">
              Not signed in
            </CardTitle>
            <CardDescription className="text-center text-base">
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate("/auth/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh w-full bg-background px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <Avatar className="w-20 h-20 mb-2 border border-border shadow bg-white">
            <AvatarFallback className="text-lg">
              {jwtData.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            {jwtData.username || "User"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            Profile
          </CardDescription>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground mb-1">JWT Claims</div>
          <pre className="whitespace-pre-wrap break-all bg-background rounded p-2 border text-xs">
            {JSON.stringify(jwtData, null, 2)}
          </pre>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => {
              localStorage.removeItem("auth_jwt");
              window.location.href = "/";
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
