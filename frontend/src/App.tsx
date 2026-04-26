import { HeadContent, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const App = () => {
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <HeadContent />
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
};

export default App;
