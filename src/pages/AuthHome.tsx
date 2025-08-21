import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthHome() {
  const navigate = useNavigate();
  useEffect(() => {
    fetch("/auth/api/app-config")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.appName || !data.publicKey) {
          navigate("/setup", { replace: true });
        }
      })
      .catch(() => navigate("/setup", { replace: true }));
  }, [navigate]);
  return (
    <section className="flex flex-col items-center justify-center gap-6 w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Welcome to Auth
      </h1>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/auth/signup">Sign Up</Link>
        </Button>
        <Button asChild>
          <Link to="/auth/login">Login</Link>
        </Button>
      </div>
    </section>
  );
}
