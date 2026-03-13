import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import FactoryLogin from "./pages/FactoryLogin.tsx";
import FactoryDashboard from "./pages/FactoryDashboard.tsx";
import FactoryRequests from "./pages/FactoryRequests.tsx";
import BookSlot from "./pages/BookSlot.tsx";
import Gateway from "./pages/Gateway.tsx";
import FarmerLogin from "./pages/FarmerLogin.tsx";
import RegisterFactory from "./pages/RegisterFactory.tsx";
import RegisterFarmer from "./pages/RegisterFarmer.tsx";
import CategoryHubs from "./pages/CategoryHubs.tsx";
import HubBooking from "./pages/HubBooking.tsx";
<<<<<<< HEAD
import HubCategoriesPage from "./pages/HubCategoriesPage.tsx";
=======
import FarmerChatbot from "./components/FarmerChatbot.tsx";
>>>>>>> 98dad052d72e1e3f264a711e5fe568dae5ce4a16


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
          <Route path="/factory/requests" element={<FactoryRequests />} />
          <Route path="/farmer/book-slot" element={<BookSlot />} />
          <Route path="/farmer/category/:category" element={<CategoryHubs />} />
          <Route path="/register-factory" element={<RegisterFactory />} />
          <Route path="/register-farmer" element={<RegisterFarmer />} />
          <Route path="/farmer/hub-booking/:hubId" element={<HubBooking />} />
          <Route path="/hub-categories" element={<HubCategoriesPage />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FarmerChatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
