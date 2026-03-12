import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import GLSLHills from "./GLSLHills";
import FloatingShapes from "./FloatingShapes";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <GLSLHills />
      <FloatingShapes />
      <div className="absolute inset-0 bg-dotted opacity-40 z-[1]" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[2]" style={{
        background: "linear-gradient(135deg, hsl(150 10% 97% / 0.7) 0%, hsl(152 68% 96% / 0.5) 100%)"
      }} />

      <div className="container relative z-10">
        <div className="max-w-3xl">
          <div className="inline-block glass rounded-full px-5 py-2 mb-8">
            <span className="font-ui text-xs font-semibold uppercase tracking-widest text-primary">
              AI-Powered Logistics
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95] tracking-tight mb-6">
            Smart Crop
            <br />
            Delivery for
            <br />
            <span className="text-primary">Farmers</span>
          </h1>
          
          <p className="font-ui text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
            Avoid long waiting queues and deliver crops efficiently using AI-powered scheduling and real-time hub data.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="font-ui font-semibold text-sm h-13 px-8 rounded-xl shadow-lg shadow-primary/25" onClick={() => navigate("/farmer/book-slot")}>
              Book Arrival Slot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-ui font-semibold text-sm h-13 px-8 rounded-xl glass border-border hover:bg-muted transition-all duration-200"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Explore Nearby Hubs
            </Button>
          </div>
        </div>

        {/* Floating data card */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
          <div className="glass rounded-2xl p-0 w-72 shadow-xl shadow-foreground/5 animate-float">
            <div className="border-b border-border px-5 py-3.5 rounded-t-2xl">
              <span className="font-display text-sm font-bold tracking-wide">Live Hub Data</span>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { name: "Kolhapur Sugar Mill", queue: 12, wait: "2.5 hrs", status: "medium" },
                { name: "Pune APMC Market", queue: 4, wait: "45 min", status: "low" },
                { name: "Nashik Cold Storage", queue: 28, wait: "5+ hrs", status: "high" },
              ].map((hub) => (
                <div key={hub.name} className="glass rounded-xl p-3.5">
                  <p className="font-ui text-xs font-semibold">{hub.name}</p>
                  <div className="flex justify-between mt-2 items-end">
                    <span className="font-display text-2xl font-bold">{hub.queue}</span>
                    <span className="font-ui text-xs text-muted-foreground font-medium">{hub.wait}</span>
                  </div>
                  <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        hub.status === "low" ? "bg-queue-low w-1/4" :
                        hub.status === "medium" ? "bg-queue-medium w-1/2" :
                        "bg-queue-high w-full"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
