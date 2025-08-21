import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSetup() {
  const [status, setStatus] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [genResult, setGenResult] = useState<{
    privateKey: string;
    publicKey: string;
  } | null>(null);
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
          navigate("/auth", { replace: true });
        } else {
          setStatus(false);
        }
      })
      .catch(() => setStatus(false))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4">
      <h1 className="text-2xl font-bold">Auth Key Setup</h1>
      {loading ? (
        <div>Loading...</div>
      ) : status ? (
        <div className="text-green-600">Config already exists.</div>
      ) : (
        <>
          <div className="text-red-600">
            No config found. Please set up your app and keys.
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xl mt-4">
            <h2 className="font-semibold">App Display Config</h2>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="appName"
                className="text-xs font-medium text-muted-foreground"
              >
                App Name <span className="text-destructive">*</span>
              </label>
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
              />
              {!appName.trim() && (
                <span className="text-xs text-destructive">
                  App name is required.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label
                htmlFor="description"
                className="text-xs font-medium text-muted-foreground"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of your auth portal (optional)"
                rows={2}
                maxLength={256}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label
                htmlFor="logoUrl"
                className="text-xs font-medium text-muted-foreground"
              >
                Logo URL
              </label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Logo image URL (optional)"
                type="url"
              />
            </div>
            <h2 className="font-semibold mt-6">Keypair</h2>
            <div className="flex flex-col gap-2">
              <Button
                onClick={async () => {
                  setGenResult(null);
                  setSaveMsg(null);
                  setLoading(true);
                  const res = await fetch("/auth/api/keys/generate", {
                    method: "POST",
                  });
                  const data = await res.json();
                  setGenResult(data);
                  setManualPriv(data.privateKey);
                  setManualPub(data.publicKey);
                  setLoading(false);
                }}
                disabled={loading}
                variant="secondary"
              >
                Auto-generate Keypair
              </Button>
              {genResult && (
                <div className="bg-muted rounded p-2 text-xs">
                  <div className="mb-2 font-mono">Private Key:</div>
                  <Textarea
                    value={genResult.privateKey}
                    readOnly
                    rows={5}
                    className="mb-2"
                  />
                  <div className="mb-2 font-mono">Public Key:</div>
                  <Textarea value={genResult.publicKey} readOnly rows={3} />
                </div>
              )}
              <div className="flex flex-col gap-1 mt-2">
                <label
                  htmlFor="privateKey"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Private Key <span className="text-destructive">*</span>
                </label>
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
                />
                {!manualPriv.trim() && (
                  <span className="text-xs text-destructive">
                    Private key is required.
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <label
                  htmlFor="publicKey"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Public Key <span className="text-destructive">*</span>
                </label>
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
                  !manualPub.trim()
                }
              >
                Save Config
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Go back to home
                  navigate("/", { replace: true });
                }}
              >
                Back to Home
              </Button>
            </div>
            {saveMsg && <div className="text-sm mt-1">{saveMsg}</div>}
          </div>
        </>
      )}
    </div>
  );
}
