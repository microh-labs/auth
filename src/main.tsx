import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppWithHelmet from "./AppWithHelmet";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithHelmet />
  </StrictMode>
);
