import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AuthSetup() {
  const [status, setStatus] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/auth/api/keys/status")
      .then((res) => res.json())
      .then((data) => setStatus(data.exists))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4">
      <h1 className="text-2xl font-bold">Auth Key Setup</h1>
      {loading ? (
        <div>Loading...</div>
      ) : status ? (
        <div className="text-green-600">Keypair already exists.</div>
      ) : (
        <div className="text-red-600">
          No keypair found. Please set up your keys.
        </div>
      )}
      {/* Add more UI for key generation/upload here */}
      <Button disabled>Continue</Button>
    </div>
  );
}
