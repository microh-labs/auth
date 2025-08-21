import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch("/auth/api/keys/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.exists);
        if (data.exists) {
          navigate("/auth", { replace: true });
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4">
      <h1 className="text-2xl font-bold">Auth Key Setup</h1>
      {loading ? (
        <div>Loading...</div>
      ) : status ? (
        <div className="text-green-600">Keypair already exists.</div>
      ) : (
        <>
          <div className="text-red-600">
            No keypair found. Please set up your keys.
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xl mt-4">
            <h2 className="font-semibold">Option 1: Auto-generate keypair</h2>
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
                setLoading(false);
              }}
              disabled={loading}
            >
              Generate Keypair
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
            <h2 className="font-semibold mt-6">
              Option 2: Upload your own keypair
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaveMsg(null);
                setSaving(true);
                const res = await fetch("/auth/api/keys/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    privateKey: manualPriv,
                    publicKey: manualPub,
                  }),
                });
                const data = await res.json();
                setSaveMsg(
                  data.success
                    ? "Keypair saved!"
                    : data.error || "Failed to save"
                );
                setSaving(false);
                if (data.success) setStatus(true);
              }}
              className="flex flex-col gap-2"
            >
              <label className="font-mono text-xs">Private Key</label>
              <Textarea
                value={manualPriv}
                onChange={(e) => setManualPriv(e.target.value)}
                rows={5}
                required
                placeholder="Paste your private key here"
              />
              <label className="font-mono text-xs">Public Key</label>
              <Textarea
                value={manualPub}
                onChange={(e) => setManualPub(e.target.value)}
                rows={3}
                required
                placeholder="Paste your public key here"
              />
              <Button type="submit" disabled={saving}>
                Save Keypair
              </Button>
              {saveMsg && <div className="text-sm mt-1">{saveMsg}</div>}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
