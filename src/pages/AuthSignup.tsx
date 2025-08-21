import { useState } from "react";
import { useAppConfig } from "@/lib/useAppConfig";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function AuthSignup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const config = useAppConfig();
  const navigate = useNavigate();

  function validateUsername(username: string) {
    return /^[a-z0-9_]{3,32}$/.test(username);
  }
  function validatePassword(password: string) {
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,64}$/.test(password);
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validateUsername(username)) {
      setError("Username must be 3-32 characters, a-z, 0-9, or _");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be 8-64 characters, include a letter and a number"
      );
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/auth/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      setLoading(false);
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("auth_jwt", data.token);
          navigate("/", { replace: true });
        } else {
          setError("No token received");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error");
    }
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Create a username"
                disabled={loading}
                className="h-11 text-base"
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
                className="h-11 text-base"
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
                className="h-11 text-base"
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
