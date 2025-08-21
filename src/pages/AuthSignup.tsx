import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function AuthSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{
    appName?: string;
    description?: string;
    logoUrl?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/auth/api/app-config")
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(() => setConfig(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    // TODO: Implement real signup logic
    setTimeout(() => {
      setLoading(false);
      setSuccess("Signup successful (demo only)");
    }, 1000);
  }

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
          <img
            src={logoUrl}
            alt="App Logo"
            className="w-16 h-16 rounded-full border border-border shadow bg-white object-cover mb-2"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackLogo) target.src = fallbackLogo;
            }}
          />
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            {appName}
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm mb-2">
            {description}
          </p>
          <Separator className="my-2" />
          <div className="w-full flex justify-center">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="underline hover:text-primary font-medium"
              >
                Sign In
              </Link>
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Repeat your password"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base mt-2"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
