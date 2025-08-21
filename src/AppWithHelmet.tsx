import { HelmetProvider } from "react-helmet-async";
import App from "./App";

export default function AppWithHelmet() {
  return (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
