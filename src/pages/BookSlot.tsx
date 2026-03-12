import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, User, Truck, Factory, ArrowLeft, Leaf, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FloatingShapes from "@/components/FloatingShapes";
import { useMutation } from "@tanstack/react-query";

const HUBS = ["Sahyadri Sugar Mill", "Global Dairy Plant", "National Cold Storage"];
const CROPS = ["Sugarcane", "Wheat", "Rice", "Potato", "Onion", "Tomato", "Soybean", "Cotton", "Maize", "Other"];
const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
];

const sendRequestApi = async (data: {
  farmer_name: string; vehicle_no: string; hub_name: string;
  crop_type: string; preferred_date: string; preferred_time: string;
}) => {
  const res = await fetch('/api/send-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send request');
  }
  return res.json();
};

const BookSlot = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    farmer_name: "",
    vehicle_no: "",
    hub_name: HUBS[0],
    crop_type: CROPS[0],
    preferred_date: today,
    preferred_time: TIME_SLOTS[0],
  });

  const mutation = useMutation({
    mutationFn: sendRequestApi,
    onSuccess: () => {
      toast.success("✅ Request sent! The factory operator will review and assign your slot.", { duration: 5000 });
      navigate("/farmer/dashboard");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to send request."),
  });

  const set = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20 shadow-inner">
              <CalendarCheck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">Request Arrival Slot</h1>
            <p className="font-ui text-sm text-muted-foreground mt-1 text-center">Submit your details — the factory operator will confirm your slot.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Farmer Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Farmer Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-muted-foreground" /></div>
                <Input type="text" placeholder="e.g. Ramesh Kumar" value={formData.farmer_name}
                  onChange={(e) => set('farmer_name', e.target.value)} required
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl" />
              </div>
            </div>

            {/* Vehicle Number */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Vehicle Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Truck className="h-4 w-4 text-muted-foreground" /></div>
                <Input type="text" placeholder="e.g. MH-12-AB-1234" value={formData.vehicle_no}
                  onChange={(e) => set('vehicle_no', e.target.value)} required
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl" />
              </div>
            </div>

            {/* Select Hub */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Select Hub</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Factory className="h-4 w-4 text-muted-foreground" /></div>
                <select value={formData.hub_name} onChange={(e) => set('hub_name', e.target.value)}
                  className="w-full pl-10 h-12 bg-white/5 border border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl text-foreground appearance-none outline-none">
                  {HUBS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* Crop Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Crop Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Leaf className="h-4 w-4 text-muted-foreground" /></div>
                <select value={formData.crop_type} onChange={(e) => set('crop_type', e.target.value)}
                  className="w-full pl-10 h-12 bg-white/5 border border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl text-foreground appearance-none outline-none">
                  {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Preferred Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Preferred Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-muted-foreground" /></div>
                <Input type="date" min={today} value={formData.preferred_date}
                  onChange={(e) => set('preferred_date', e.target.value)} required
                  className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl" />
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Preferred Time</label>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} type="button" onClick={() => set('preferred_time', t)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-ui transition-colors border flex-shrink-0 ${
                      formData.preferred_time === t
                        ? 'bg-primary/20 border-primary text-primary font-semibold'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                    }`}>
                    <Clock className="h-3.5 w-3.5" />{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" disabled={mutation.isPending}
                className="w-full h-12 rounded-xl font-display font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                {mutation.isPending ? "Sending Request..." : "Send Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookSlot;
