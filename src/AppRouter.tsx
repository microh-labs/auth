import { HashRouter, Route, Routes } from "react-router-dom";
import AuthSetup from "./pages/AuthSetup.tsx";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<AuthSetup />} />
      </Routes>
    </HashRouter>
  );
}
