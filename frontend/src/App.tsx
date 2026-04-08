import { HeadContent, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { LoadingPage } from "@/components/loading-page";
import { TooltipProvider } from "@/components/ui/tooltip";

const App = () => {
  const { isLoading } = useSelector((state: RootState) => state.auth);

  // Show loading page while auth is initializing
  if (isLoading) {
    return (
      <ThemeProvider storageKey="vite-ui-theme">
        <LoadingPage />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    );
  }

  return (
    <>
      <ThemeProvider storageKey="vite-ui-theme">
        <HeadContent />
        <TooltipProvider>
          <Outlet />
        </TooltipProvider>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </>
  );
};

export default App;
