import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Agreement from "./pages/Agreement";
import Download from "./pages/Download";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <header className="w-full p-4 flex border-b">
          <img 
            src="/lovable-uploads/3566aaf8-4e73-46fc-a3fb-e08cdf947660.png" 
            alt="Sustainable Brand Index Logo" 
            className="h-16 object-contain"
          />
        </header>
        <main className="flex-1">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/agreement" replace />} />
              <Route path="/agreement" element={<Agreement />} />
              <Route path="/download" element={<Download />} />
            </Routes>
          </BrowserRouter>
        </main>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;