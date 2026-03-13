import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchHubsByCategory } from "@/lib/api";
import { ArrowLeft, Clock, MapPin, Truck, Factory, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const CategoryHubs = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const { data: hubs, isLoading, isError } = useQuery({
    queryKey: ['hubs-by-category', category],
    queryFn: () => fetchHubsByCategory(category || ''),
    enabled: !!category,
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/farmer/dashboard')}
                className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Factory className="h-8 w-8 text-primary" />
                </div>
                {category}
              </h1>
              <p className="font-ui text-muted-foreground mt-2 max-w-2xl">
                Real-time queue status and booking for all registered {category?.toLowerCase()} hubs in the KisanSaarthi network.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="font-ui font-medium animate-pulse">Fetching available hubs...</p>
            </div>
          ) : isError ? (
            <div className="glass-strong border border-destructive/20 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-2xl">
              <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">Connection Problem</h3>
              <p className="text-muted-foreground mb-8">We're having trouble reaching the server. Please check your internet or try refreshing.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl border-white/10">
                Retry Connection
              </Button>
            </div>
          ) : hubs?.length === 0 ? (
            <div className="glass-strong rounded-3xl p-20 text-center shadow-lg border border-white/5">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                <Factory className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-display text-3xl font-bold mb-4">No Hubs Available</h3>
              <p className="font-ui text-muted-foreground max-w-lg mx-auto text-lg">
                There are currently no registered hubs in the <span className="text-primary font-semibold">"{category}"</span> category.
              </p>
              <Button 
                onClick={() => navigate('/farmer/dashboard')} 
                className="mt-10 rounded-xl px-8"
              >
                Explore Other Categories
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
              {hubs?.map((hub) => {
                const totalLoad = hub.total_load || 0;
                const hourlyCapacity = hub.processing_capacity_per_hour || 1;
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

                // Status logic based on load vs hourly capacity
                // If total load is > 2x hourly capacity, it's crowded
                const loadRatio = totalLoad / hourlyCapacity;
                let statusColor = "bg-green-500";
                let statusBg = "bg-green-500/10";
                let statusText = "text-green-500";
                let statusLabel = "Available";
                
                if (loadRatio > 2) {
                  statusColor = "bg-red-500";
                  statusBg = "bg-red-500/10";
                  statusText = "text-red-500";
                  statusLabel = "Crowded";
                } else if (loadRatio > 1) {
                  statusColor = "bg-yellow-500";
                  statusBg = "bg-yellow-500/10";
                  statusText = "text-yellow-500";
                  statusLabel = "Moderate";
                }

                return (
                  <div 
                    key={hub.id} 
                    className="glass-strong rounded-3xl overflow-hidden shadow-xl border border-white/5 hover:border-primary/40 hover:scale-[1.02] transition-all duration-300 group flex flex-col h-full bg-gradient-to-b from-white/[0.05] to-transparent"
                  >
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{hub.name}</h3>
                          <div className="flex items-center gap-2 mt-3 text-muted-foreground group-hover:text-muted-foreground/80">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span className="font-ui text-sm font-medium">{hub.location}</span>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusBg} ${statusText} border border-current/20 uppercase tracking-wider`}>
                          {statusLabel}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-auto pt-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                          <Truck className="h-6 w-6 text-primary/70 mb-2" />
                          <p className="font-display text-3xl font-bold">{hub.total_load || 0}T</p>
                          <p className="font-ui text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Queue Load</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                          <Clock className="h-6 w-6 text-blue-400/70 mb-2" />
                          <p className="font-display text-3xl font-bold">{waitTimeString}</p>
                          <p className="font-ui text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Est. Wait</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-0 bg-transparent">
                      <Button 
                        className="w-full h-14 rounded-2xl gap-3 font-display font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all" 
                        onClick={() => {
                          const userStr = localStorage.getItem('user');
                          if (!userStr) {
                            toast.error("Please login as a farmer to book a slot.");
                            navigate('/farmer/login');
                            return;
                          }
                          const user = JSON.parse(userStr);
                          if (user.role !== 'farmer') {
                            toast.error("Only farmers can book arrival slots.");
                            return;
                          }
                          
                          navigate(`/farmer/hub-booking/${hub.id}`);
                        }}
                      >
                        <Calendar className="h-5 w-5" />
                        Book Arrival Slot
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryHubs;
