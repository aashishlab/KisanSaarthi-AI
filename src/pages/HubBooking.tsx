import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSlots, fetchHubsByCategory, bookSlotNew, Hub, Slot } from "@/lib/api";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

const HubBooking = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch slots data
  const { data: slots, isLoading: loadingSlots } = useQuery({
    queryKey: ['hub-slots', hubId],
    queryFn: () => fetchSlots(parseInt(hubId || '0')),
    enabled: !!hubId,
    refetchInterval: 10000,
  });

  // Fetch hub details
  const { data: hub } = useQuery({
    queryKey: ['hub-details', hubId],
    queryFn: async () => {
        const id = parseInt(hubId || '0');
        // We don't have a direct fetchHubById, but we can reuse fetchHubsByCategory or add a generic one
        // For now, let's just use the hub data if we can find it or fallback
        const res = await fetch(`/api/hubs`); // Assuming there's a list hubs endpoint
        const hubs: Hub[] = await res.json();
        return hubs.find(h => h.id === id);
    },
    enabled: !!hubId
  });


  const handleSubmit = async () => {
    if (!selectedSlotId || !selectedSlotTime) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error("Please login as a farmer to book a slot.");
      navigate('/farmer/login');
      return;
    }
    const user = JSON.parse(userStr);
    
    setIsSubmitting(true);
    try {
      const vehicle_number = user.vehicle_no || "UP-32-AB-1234"; // Fallback or prompt for it
      await bookSlotNew({ 
        farmer_id: user.id, 
        hub_id: parseInt(hubId || '0'), 
        slot_id: selectedSlotId,
        vehicle_number 
      });
      toast.success(`Booking successful! Your arrival slot is ${selectedSlotTime}.`);
      navigate('/farmer/dashboard');
    } catch (err: any) {
      toast.error(err.message || "Failed to book slot. Slot might have become full.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="glass-strong rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent">
            {/* Header Section */}
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <Factory className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">{hub?.name || "Factory Booking"}</h1>
                  <p className="font-ui text-muted-foreground mt-1 text-sm">{hub?.location || "Loading details..."}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Select Date
                </label>
                <input 
                  type="date" 
                  min={today}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotId(null);
                    setSelectedSlotTime(null);
                  }}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground font-ui focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Slots Section */}
            <div className="p-8">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" /> Available Slots
              </h2>

              {loadingSlots ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {slots?.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    const percent = slot.capacity > 0 ? (slot.booked_count / slot.capacity) : 0;
                    const isFull = percent >= 1;
                    const isLimited = percent >= 0.8;
                    const isLow = percent >= 0.4;

                    let baseStyle = "border-white/10 bg-white/5 hover:bg-white/10";
                    let textStyle = "text-foreground";
                    let statusLabel = "Available";
                    let indicatorColor = "bg-green-500/20 border-green-500 text-green-500";

                    if (isFull) {
                      baseStyle = "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed";
                      statusLabel = "Fully Booked";
                      indicatorColor = "bg-red-500/20 border-red-500 text-red-500";
                    } else if (isLimited) {
                      statusLabel = "Limited";
                      indicatorColor = "bg-red-500/20 border-red-500 text-red-500";
                    } else if (isLow) {
                        statusLabel = "Partial";
                        indicatorColor = "bg-yellow-500/20 border-yellow-500 text-yellow-500";
                    }

                    if (isSelected) {
                      baseStyle = "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]";
                      textStyle = "text-primary font-bold";
                    }

                    return (
                      <button
                        key={slot.id}
                        disabled={isFull}
                        onClick={() => {
                            setSelectedSlotId(slot.id);
                            setSelectedSlotTime(slot.slot_time);
                        }}
                        className={`relative text-left p-5 rounded-2xl border transition-all duration-200 group flex flex-col gap-3 ${baseStyle}`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary animate-in fade-in zoom-in">
                            <CheckCircle2 className="h-5 w-5 fill-primary/20" />
                          </div>
                        )}
                        <span className={`font-ui text-lg ${textStyle}`}>{slot.slot_time}</span>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${indicatorColor}`}>
                            {statusLabel}
                          </span>
                          {!isFull && (
                            <span className="text-xs text-muted-foreground font-ui font-medium">
                              {slot.capacity - slot.booked_count} left
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Submit Section */}
            <div className="p-8 bg-black/20 border-t border-white/5 flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedSlotId || isSubmitting}
                className="h-14 px-8 rounded-xl font-display font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all w-full md:w-auto"
              >
                {isSubmitting ? "Sending..." : "Submit Request"}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HubBooking;
