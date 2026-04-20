import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/theme/ThemeProvider";

/* ──────────────────────────────────────────────────────────────
 *  🎨 ACTIVE THEME — change this single line to swap themes:
 *
 *    "@/themes/midnight.css"      ← dark luxury (default)
 *    "@/themes/porcelain.css"     ← minimal Apple-style light
 *    "@/themes/neo-brutalist.css" ← bold, loud, high-contrast
 *    "@/themes/glassmorphic.css"  ← frosted, dreamy gradients
 *    "@/themes/carbon-sport.css"  ← racing red on carbon black
 * ────────────────────────────────────────────────────────────── */
import "@/themes/midnight.css";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
