import { Sparkles, ArrowRight, MapPin, Clock, Truck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { fetchAllHubs } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const AIRecommendedHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: hubs, isLoading } = useQuery({
    queryKey: ['all-hubs'],
    queryFn: fetchAllHubs,
    refetchInterval: 10000, // Refresh every 10s for real-time feel
  });

  // Calculate Best Hub (highest price + lowest wait)
  const bestHub = hubs?.length ? [...hubs].sort((a, b) => {
    // Formula: (Price * 0.7) - (WaitTimeMinutes * 0.3)
    const aPrice = a.price_per_ton || 0;
    const bPrice = b.price_per_ton || 0;
    
    // Simulating distance/wait impact for dashboard sorting
    const aWait = (a.total_load || 0) / (a.processing_capacity_per_hour || 1) * 60;
    const bWait = (b.total_load || 0) / (b.processing_capacity_per_hour || 1) * 60;

    const aScore = aPrice - (aWait * 2); // Simple heuristic
    const bScore = bPrice - (bWait * 2);
    
    return bScore - aScore;
  })[0] : null;

  if (isLoading || !bestHub) return null;

  const totalLoad = bestHub.total_load || 0;
  const hourlyCapacity = bestHub.processing_capacity_per_hour || 1;
  const waitTimeRaw = (totalLoad / hourlyCapacity) * 60;
  
  let waitTimeString = "0 min";
  if (waitTimeRaw > 0) {
    if (waitTimeRaw >= 60) {
      const hrs = Math.floor(waitTimeRaw / 60);
      const mins = Math.round(waitTimeRaw % 60);
      waitTimeString = mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hrs`;
    } else {
      waitTimeString = `${Math.round(waitTimeRaw)} min`;
    }
  }

  const capacityPercent = Math.min(100, Math.round((totalLoad / (hourlyCapacity * 8)) * 100));

  return (
    <section className="relative bg-dotted">
      <div className="container py-20">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 mx-auto w-fit">
            <Sparkles className="h-3 w-3" />
            {t("aiRecommendation")}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">{t("bestHubRightNow")}</h2>
        </div>

        <div className="glass-strong rounded-3xl overflow-hidden border-primary/20 shadow-2xl shadow-primary/20 max-w-5xl mx-auto group hover:scale-[1.01] transition-all duration-500">
          <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-b border-primary/10 px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-lg font-bold text-primary tracking-tight">
                Recommended for Maximum Earning
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-queue-low/10 border border-queue-low/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-queue-low rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-queue-low uppercase tracking-wider">Live Analysis</span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <h3 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">{bestHub.name}</h3>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-ui text-sm font-semibold text-muted-foreground">{bestHub.location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-display text-lg font-bold text-primary">₹ {bestHub.price_per_ton?.toLocaleString()} / Ton</span>
                    </div>
                  </div>
                </div>

                <p className="font-ui text-lg text-muted-foreground leading-relaxed max-w-xl">
                  {bestHub.name} is currently offering the <strong>highest price per ton</strong> in the region with an optimized queue. Booking now ensures maximum profit for your current load.
                </p>

                <Button 
                  size="lg" 
                  className="mt-4 font-display font-bold text-lg h-16 px-10 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all gap-3"
                  onClick={() => navigate(`/farmer/hub-booking/${bestHub.id}`)}
                >
                  {t("bookSlotNow")}
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Truck, value: `${totalLoad}T`, label: t("inQueue"), color: "text-blue-400" },
                    { icon: Clock, value: waitTimeString, label: t("estWait"), color: "text-amber-400" },
                    { icon: Sparkles, value: `${capacityPercent}%`, label: t("capacity"), color: "text-primary" },
                    { icon: MapPin, value: "12km", label: t("distance"), color: "text-emerald-400" },
                  ].map((item) => (
                    <div key={item.label} className="glass-strong rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-colors">
                      <item.icon className={`h-6 w-6 ${item.color} mb-3`} />
                      <p className="font-display text-3xl font-bold">{item.value}</p>
                      <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1 opacity-70">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-12 pb-12">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regional Load Optimization</span>
              <span className="text-[10px] font-bold font-display text-primary">{capacityPercent}% Utilized</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendedHub;
