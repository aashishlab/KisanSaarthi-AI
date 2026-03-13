import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import IndustryCategories from "@/components/IndustryCategories";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import FarmerChatbot from "@/components/ui/chat";

// Map short chatbot category slugs to full category names used in the routing system
const CATEGORY_SLUG_MAP: Record<string, string> = {
  sugar: "Sugar Mill",
  dairy: "Dairy Plant",
  food: "Food Processing",
  apmc: "APMC Market",
  fruits: "Fruits & Vegetables",
  vegetables: "Fruits & Vegetables",
};

const HubCategoriesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categorySlug = params.get("category");
  const quantity = params.get("quantity");

  // If a category query param is present (set by chatbot), auto-navigate to that category
  useEffect(() => {
    if (categorySlug) {
      const categoryName = CATEGORY_SLUG_MAP[categorySlug.toLowerCase()];
      if (categoryName) {
        const target = quantity
          ? `/farmer/category/${encodeURIComponent(categoryName)}?quantity=${quantity}`
          : `/farmer/category/${encodeURIComponent(categoryName)}`;
        navigate(target, { replace: true });
      }
    }
  }, [categorySlug, quantity, navigate]);

  // If we are about to redirect, show a brief loading indicator
  if (categorySlug && CATEGORY_SLUG_MAP[categorySlug.toLowerCase()]) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
      <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="font-ui text-muted-foreground animate-pulse">Opening hub category...</p>
          </div>
        </div>
        <FarmerChatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/farmer/dashboard")}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <IndustryCategories />
        </div>
      </div>
      <FarmerChatbot />
    </div>
  );
};

export default HubCategoriesPage;
