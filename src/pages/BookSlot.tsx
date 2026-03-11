import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, User, Truck, Factory, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FloatingShapes from "@/components/FloatingShapes";
import { bookSlot } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

const BookSlot = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmer_name: "",
    vehicle_no: "",
    hub_name: "Sahyadri Sugar Mill",
    arrival_slot: "09:00 AM - 10:00 AM"
  });

  const bookingMutation = useMutation({
    mutationFn: bookSlot,
    onSuccess: () => {
      toast.success("Slot booked successfully! Your status is currently 'Waiting'.");
      navigate("/farmer/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to book slot.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookingMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background py-12">
      <FloatingShapes />
      
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-float" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />

      <div className="z-10 w-full max-w-lg px-4">
        <Button variant="ghost" onClick={() => navigate("/farmer/dashboard")} className="mb-6 hover:bg-white/5">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl animate-fade-in border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20 shadow-inner">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
              Book Arrival Slot
            </h1>
            <p className="font-ui text-sm text-muted-foreground mt-1 text-center">
              Reserve your unloading time at an agro-industrial hub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 relative">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Farmer Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.farmer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, farmer_name: e.target.value }))}
                  required
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Vehicle Details</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Truck className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <Input
                   type="text"
                   placeholder="e.g. MH-12-AB-1234"
                   value={formData.vehicle_no}
                   onChange={(e) => setFormData(prev => ({ ...prev, vehicle_no: e.target.value }))}
                   required
                   className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                 />
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Select Hub</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                   <Factory className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <select 
                   className="w-full pl-10 h-12 bg-white/5 border border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl text-foreground appearance-none outline-none"
                   value={formData.hub_name}
                   onChange={(e) => setFormData(prev => ({ ...prev, hub_name: e.target.value }))}
                 >
                    <option value="Sahyadri Sugar Mill">Sahyadri Sugar Mill</option>
                    <option value="Global Dairy Plant">Global Dairy Plant</option>
                    <option value="National Cold Storage">National Cold Storage</option>
                 </select>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Preferred Time Slot</label>
              <div className="relative flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                 {["08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM"].map(slot => (
                   <button
                     key={slot}
                     type="button"
                     onClick={() => setFormData(prev => ({ ...prev, arrival_slot: slot }))}
                     className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-ui transition-colors border ${formData.arrival_slot === slot ? 'bg-primary/20 border-primary text-primary font-semibold' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                   >
                     {slot}
                   </button>
                 ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={bookingMutation.isPending}
                className="w-full h-12 rounded-xl font-display font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                {bookingMutation.isPending ? "Reserving Slot..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
