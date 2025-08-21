import { HashRouter, Route, Routes } from "react-router-dom";
import AuthSetup from "./pages/AuthSetup";
import AuthHome from "./pages/AuthHome";
import AuthLogin from "./pages/AuthLogin";
import AuthSignup from "./pages/AuthSignup";
import Profile from "./pages/Profile";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AuthHome />} />
        <Route path="/setup" element={<AuthSetup />} />
        <Route path="/auth/login" element={<AuthLogin />} />
        <Route path="/auth/signup" element={<AuthSignup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<AuthHome />} />
      </Routes>
    </HashRouter>
  );
}
