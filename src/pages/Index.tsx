import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Timeline from "@/components/Timeline";
import IndustryCategories from "@/components/IndustryCategories";
import NearbyHubs from "@/components/NearbyHubs";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import QueueInsights from "@/components/QueueInsights";
import AIRecommendedHub from "@/components/AIRecommendedHub";
import QuickActions from "@/components/QuickActions";
import { FarmerBookings } from "@/components/FarmerBookings";

const Index = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFarmer = user.role === 'farmer';
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        {isFarmer && <FarmerBookings />}
        <Timeline />
        <IndustryCategories />
        <NearbyHubs />
        <QueueInsights />
        <AIRecommendedHub />
        <FeaturedCarousel />
        <QuickActions />
        
        {/* Footer */}
        <footer className="glass-strong mt-4 mx-4 mb-4 rounded-2xl">
          <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-display text-xl font-bold">KisanSaarthi AI</h3>
                <p className="font-ui text-sm text-muted-foreground mt-2">
                  Eliminating wait times at agro-industrial hubs through AI-powered scheduling.
                </p>
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Platform</h4>
                {["Dashboard", "Hub Directory", "Queue Analytics", "API"].map((l) => (
                  <a key={l} href="#" className="block font-ui text-sm text-muted-foreground py-1 hover:text-foreground transition-colors duration-200">
                    {l}
                  </a>
                ))}
              </div>
              <div>
                <h4 className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Support</h4>
                {["Documentation", "Contact", "Terms", "Privacy"].map((l) => (
                  <a key={l} href="#" className="block font-ui text-sm text-muted-foreground py-1 hover:text-foreground transition-colors duration-200">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
