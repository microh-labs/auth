import { HashRouter, Route, Routes } from "react-router-dom";
import AuthSetup from "./pages/AuthSetup";
import AuthHome from "./pages/AuthHome";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthHome />} />
        <Route path="*" element={<AuthSetup />} />
      </Routes>
    </HashRouter>
  );
}
