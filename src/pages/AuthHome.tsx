import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function AuthHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4">
      <h1 className="text-2xl font-bold">Welcome to Auth</h1>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/auth/signup">Sign Up</Link>
        </Button>
        <Button asChild>
          <Link to="/auth/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
