import { Sparkles, ArrowRight, MapPin, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIRecommendedHub = () => {
  return (
    <section className="relative bg-dotted">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            AI Recommendation
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Best Hub Right Now</h2>
        </div>

        <div className="glass rounded-2xl overflow-hidden border-primary/20 shadow-xl shadow-primary/10 max-w-4xl mx-auto">
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-3.5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-ui text-sm font-semibold text-primary">
              AI Recommended — Lowest Congestion
            </span>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-display text-3xl font-bold">Pune APMC Market</h3>
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-ui text-sm text-muted-foreground">Market Yard, Pune, Maharashtra</span>
                </div>

                <p className="font-ui text-sm text-muted-foreground mt-4 leading-relaxed">
                  Currently operating at 15% capacity with only 4 vehicles in queue. 
                  AI predicts this hub will remain low-traffic for the next 3 hours. 
                  Optimal arrival window: now.
                </p>

                <Button size="lg" className="mt-6 font-ui font-semibold text-sm h-13 px-8 rounded-xl shadow-lg shadow-primary/25">
                  Book Slot Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, value: "4", label: "In Queue" },
                  { icon: Clock, value: "45m", label: "Est. Wait" },
                  { icon: Sparkles, value: "15%", label: "Capacity" },
                  { icon: MapPin, value: "12km", label: "Distance" },
                ].map((item) => (
                  <div key={item.label} className="glass rounded-xl p-5">
                    <item.icon className="h-5 w-5 text-muted-foreground mb-2" />
                    <p className="font-display text-3xl font-bold">{item.value}</p>
                    <p className="font-ui text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-1.5 bg-muted mx-6 mb-6 rounded-full overflow-hidden">
            <div className="h-full bg-queue-low rounded-full w-[15%]" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendedHub;
