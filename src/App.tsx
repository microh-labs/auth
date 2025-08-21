import AppRouter from "./AppRouter";
import Footer from "@/components/Footer";
import AppMeta from "@/components/AppMeta";

export default function App() {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <AppMeta />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 max-w-2xl w-full mx-auto mt-8 mb-4">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
