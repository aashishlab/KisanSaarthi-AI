import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSlots, fetchHubsByCategory, bookSlotNew, Hub, Slot } from "@/lib/api";
import { ArrowLeft, Calendar as CalendarIcon, Clock, CheckCircle2, Factory, Truck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import FarmerChatbot from "@/components/ui/chat";

const HubBooking = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);

  // Pre-fill load quantity from chatbot URL query param (?quantity=10)
  const searchParams = new URLSearchParams(location.search);
  const prefillQty = parseFloat(searchParams.get('quantity') || '10') || 10;
  const [loadQuantity, setLoadQuantity] = useState<number>(prefillQty);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

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


  // Calculate which slots will be taken based on selection and load
  const getAllocatedSlots = (startId: number | null) => {
    if (!startId || !slots) return { allocated: [], fulfillable: false };
    const startIndex = slots.findIndex(s => s.id === startId);
    if (startIndex === -1) return { allocated: [], fulfillable: false };

    let remaining = loadQuantity;
    const allocated = [];
    for (let i = startIndex; i < slots.length; i++) {
        const slot = slots[i];
        const avail = Math.max(0, slot.capacity - slot.total_booked_load);
        if (avail > 0) {
            const loadForThisSlot = Math.min(remaining, avail);
            allocated.push({
                slot_id: slot.id,
                slot_time: slot.slot_time,
                allocated_load: loadForThisSlot
            });
            remaining -= loadForThisSlot;
        }
        if (remaining <= 0) break;
    }
    return { allocated, fulfillable: remaining <= 0 };
  };

  const { allocated: allocatedSlotsDetails, fulfillable } = getAllocatedSlots(selectedSlotId);
  const allocatedSlotIds = allocatedSlotsDetails.map(s => s.slot_id);

  const handleSubmit = async () => {
    if (!selectedSlotId) return;
    
    if (!fulfillable) {
       toast.error('Factory capacity full for selected date.');
       return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error("Please login as a farmer to book a slot.");
      navigate('/farmer/login');
      return;
    }
    const user = JSON.parse(userStr);
    
    setIsSubmitting(true);
    try {
      const vehicle_number = user.vehicle_no || "UP-32-AB-1234";
      
      const payload = {
        farmer_id: user.id,
        hub_id: parseInt(hubId || '0'),
        vehicle_number,
        total_load: loadQuantity,
        estimated_price: (hub?.price_per_ton || 0) * loadQuantity,
        slots: allocatedSlotsDetails
      };

      const res = await bookSlotNew(payload);
      setConfirmationData(res);
      toast.success(`Booking successful!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to book slot. Capacities might have changed.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (confirmationData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
          <div className="max-w-md w-full glass-strong rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400"></div>
             
             <div className="flex items-center justify-center mb-6">
               <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                 <CheckCircle2 className="h-10 w-10 text-green-500" />
               </div>
             </div>
             
             <h2 className="text-3xl font-display font-bold text-center text-foreground mb-8">Booking Confirmed</h2>
             
             <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-ui uppercase tracking-wider text-muted-foreground">Token Number</span>
                  <span className="font-display font-bold text-2xl text-primary">#{confirmationData.token_number}</span>
                </div>

                <div>
                  <span className="text-sm font-ui uppercase tracking-wider text-muted-foreground mb-3 block">Allocated Slots</span>
                  <div className="space-y-2">
                    {confirmationData.allocated_slots.map((s: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="font-ui font-medium text-foreground">{s.slot_time}</span>
                        <span className="font-bold text-sm bg-primary/20 text-primary px-2 py-1 rounded-md">{s.load} tons</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-white/5 mt-4">
                  <span className="text-sm font-ui uppercase tracking-wider text-muted-foreground">Est. Waiting Time</span>
                  <span className="font-ui font-bold text-foreground bg-white/10 px-3 py-1.5 rounded-lg">{confirmationData.estimated_wait_time}</span>
                </div>
             </div>

             <Button 
                onClick={() => navigate('/farmer/dashboard')}
                className="w-full mt-10 h-14 rounded-xl font-display font-bold text-lg"
             >
               Return to Dashboard
             </Button>
          </div>
        </div>
      </div>
    );
  }


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
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
                  <Factory className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">{hub?.name || "Factory Booking"}</h1>
                  <p className="font-ui text-muted-foreground mt-1 text-sm">{hub?.location || "Loading details..."}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
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
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Load (Tons)
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={loadQuantity}
                    onChange={(e) => setLoadQuantity(parseFloat(e.target.value))}
                    className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground font-ui focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                {hub?.price_per_ton ? (
                  <div className="flex flex-col gap-2 pl-4 border-l border-white/10">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                       Price Benefits
                    </label>
                    <div className="flex items-baseline gap-2">
                       <span className="text-2xl font-display font-bold text-primary">₹ {((hub.price_per_ton || 0) * loadQuantity).toLocaleString()}</span>
                       <span className="text-[10px] text-muted-foreground font-ui uppercase tracking-tighter">Est. Earning</span>
                    </div>
                  </div>
                ) : null}
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
                    const isAllocated = allocatedSlotIds.includes(slot.id);
                    const isStart = selectedSlotId === slot.id;
                    
                    const availPercent = slot.capacity > 0 ? ((slot.capacity - slot.total_booked_load) / slot.capacity) : 0;
                    const isFull = availPercent <= 0;
                    
                    // Colors per spec: Green >60% avail, Yellow 30-60% avail, Red <30% avail
                    let statusLabel = "Available";
                    let indicatorColor = "bg-green-500/20 border-green-500 text-green-500";
                    
                    if (availPercent <= 0) {
                      statusLabel = "Full";
                      indicatorColor = "bg-red-500/20 border-red-500 text-red-500";
                    } else if (availPercent < 0.3) {
                      statusLabel = "Nearly Full";
                      indicatorColor = "bg-red-500/20 border-red-500 text-red-500";
                    } else if (availPercent <= 0.6) {
                      statusLabel = "Filling Fast";
                      indicatorColor = "bg-yellow-500/20 border-yellow-500 text-yellow-500";
                    }

                    let baseStyle = "border-white/10 bg-white/5 hover:bg-white/10";
                    if (isFull) {
                      baseStyle = "border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed";
                    } else if (isAllocated) {
                      baseStyle = "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]";
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
                        {(isStart || (isAllocated && !selectedSlotId)) && (
                          <div className="absolute top-3 right-3 text-primary animate-in fade-in zoom-in">
                            <CheckCircle2 className="h-5 w-5 fill-primary/20" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className={`font-ui text-lg ${isAllocated ? 'text-primary font-bold' : 'text-foreground'}`}>
                            {slot.slot_time}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter mt-1">
                            Cap: {slot.capacity}T | Booked: {slot.total_booked_load}T
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${indicatorColor}`}>
                            {statusLabel}
                          </span>
                          <span className="text-xs text-muted-foreground font-ui font-medium">
                            {Math.max(0, slot.capacity - slot.total_booked_load)}T remaining
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Submit Section */}
            <div className="p-8 bg-black/20 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                {!fulfillable && selectedSlotId && (
                   <p className="text-red-400 font-ui text-sm flex items-center gap-2">
                     <AlertCircle className="h-4 w-4" /> Not enough capacity remaining for {loadQuantity}T
                   </p>
                )}
              </div>
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
      <FarmerChatbot />
    </div>
  );
};

export default HubBooking;
