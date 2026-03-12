import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FactoryLogin from "./pages/FactoryLogin.tsx";
import FactoryDashboard from "./pages/FactoryDashboard.tsx";
import BookSlot from "./pages/BookSlot.tsx";
import Gateway from "./pages/Gateway.tsx";
import FarmerLogin from "./pages/FarmerLogin.tsx";
import RegisterFactory from "./pages/RegisterFactory.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gateway />} />
          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/farmer/dashboard" element={<Index />} />
          <Route path="/factory/login" element={<FactoryLogin />} />
          <Route path="/factory/dashboard" element={<FactoryDashboard />} />
          <Route path="/farmer/book-slot" element={<BookSlot />} />
          <Route path="/register-factory" element={<RegisterFactory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
