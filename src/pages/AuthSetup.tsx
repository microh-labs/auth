import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSetup() {
  const [status, setStatus] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  // Removed unused genResult state
  const [manualPriv, setManualPriv] = useState("");
  const [manualPub, setManualPub] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("/auth/api/app-config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.appName) {
          setAppName(data.appName || "");
          setDescription(data.description || "");
          setLogoUrl(data.logoUrl || "");
          setManualPriv(data.privateKey || "");
          setManualPub(data.publicKey || "");
          setStatus(true);
        } else {
          setStatus(false);
        }
      })
      .catch(() => setStatus(false))
      .finally(() => setLoading(false));
  }, []);

  // Always redirect to home if config exists (after a short delay)
  useEffect(() => {
    if (status) {
      const timeout = setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [status, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh w-full bg-background px-4">
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Auth Key Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <Alert>
              <AlertTitle>Loading...</AlertTitle>
            </Alert>
          ) : status ? (
            <Alert>
              <AlertTitle>Config already exists. Redirecting...</AlertTitle>
            </Alert>
          ) : (
            <>
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>No config found</AlertTitle>
                <AlertDescription>
                  Please set up your app and keys.
                </AlertDescription>
              </Alert>
              <form className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="appName">
                    App Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. My Company Auth Portal"
                    required
                    minLength={2}
                    maxLength={64}
                    aria-invalid={!appName.trim()}
                    className={
                      !appName.trim()
                        ? "border-destructive focus-visible:ring-destructive/40"
                        : ""
                    }
                    disabled={!!status}
                  />
                  {!appName.trim() && (
                    <span className="text-xs text-destructive">
                      App name is required.
                    </span>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of your auth portal (optional)"
                    rows={2}
                    maxLength={256}
                    disabled={!!status}
                  />
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Logo image URL (optional)"
                    type="url"
                    disabled={!!status}
                  />
                </div>
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Keypair</Label>
                    <Button
                      type="button"
                      onClick={async () => {
                        setSaveMsg(null);
                        setLoading(true);
                        const res = await fetch("/auth/api/keys/generate", {
                          method: "POST",
                        });
                        const data = await res.json();
                        setManualPriv(data.privateKey);
                        setManualPub(data.publicKey);
                        setLoading(false);
                      }}
                      disabled={loading || !!status}
                      variant="secondary"
                      size="sm"
                    >
                      Auto-generate Keypair
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="privateKey">
                      Private Key <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="privateKey"
                      value={manualPriv}
                      onChange={(e) => setManualPriv(e.target.value)}
                      rows={5}
                      required
                      minLength={100}
                      placeholder="Paste your PEM-encoded private key here (required)"
                      aria-invalid={!manualPriv.trim()}
                      className={
                        !manualPriv.trim()
                          ? "border-destructive focus-visible:ring-destructive/40"
                          : ""
                      }
                      disabled={!!status}
                    />
                    {!manualPriv.trim() && (
                      <span className="text-xs text-destructive">
                        Private key is required.
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="publicKey">
                      Public Key <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="publicKey"
                      value={manualPub}
                      onChange={(e) => setManualPub(e.target.value)}
                      rows={3}
                      required
                      minLength={50}
                      placeholder="Paste your PEM-encoded public key here (required)"
                      aria-invalid={!manualPub.trim()}
                      className={
                        !manualPub.trim()
                          ? "border-destructive focus-visible:ring-destructive/40"
                          : ""
                      }
                      disabled={!!status}
                    />
                    {!manualPub.trim() && (
                      <span className="text-xs text-destructive">
                        Public key is required.
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    onClick={async () => {
                      setSaveMsg(null);
                      setSaving(true);
                      if (
                        !appName.trim() ||
                        !manualPriv.trim() ||
                        !manualPub.trim()
                      ) {
                        setSaveMsg("App name and both keys are required.");
                        setSaving(false);
                        return;
                      }
                      const res = await fetch("/auth/api/app-config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          appName,
                          description,
                          logoUrl,
                          privateKey: manualPriv,
                          publicKey: manualPub,
                        }),
                      });
                      const data = await res.json();
                      setSaveMsg(
                        data.success
                          ? "Config saved!"
                          : data.error || "Failed to save"
                      );
                      setSaving(false);
                      if (data.success) setStatus(true);
                    }}
                    disabled={
                      saving ||
                      !appName.trim() ||
                      !manualPriv.trim() ||
                      !manualPub.trim() ||
                      !!status
                    }
                  >
                    Save Config
                  </Button>
                </div>
                {saveMsg && (
                  <Alert
                    className="mt-2"
                    variant={
                      saveMsg.includes("saved") ? "default" : "destructive"
                    }
                  >
                    <AlertTitle>{saveMsg}</AlertTitle>
                  </Alert>
                )}
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
