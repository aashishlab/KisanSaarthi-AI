import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tractor, Lock, Phone, ArrowRight, ArrowLeft, MapPin, Tag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FloatingShapes from "@/components/FloatingShapes";
import { registerFarmer, RegisterFarmerData } from "@/lib/api";
import { toast } from "sonner";

const RegisterFarmer = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterFarmerData>({
    name: "",
    phone: "",
    password: "",
    village: "",
    vehicle_no: "",
    crop_type: "",
    preferred_hub: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.password || !form.village || !form.vehicle_no || !form.crop_type || !form.preferred_hub) {
      toast.error("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await registerFarmer(form);
      toast.success(response.message || "Farmer registered successfully!");
      navigate("/farmer/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(err.message || "Registration failed. Please try again.");
    } finally {

      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background py-12">
      <FloatingShapes />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-float" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />

      <div className="z-10 w-full max-w-lg px-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover:bg-white/5">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl animate-fade-in border border-white/10 relative overflow-hidden">
          {/* Subtle top highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl mb-4 border border-primary/20 shadow-inner">
              <Tractor className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
              Register Farmer
            </h1>
            <p className="font-ui text-sm text-muted-foreground mt-1 tracking-wide uppercase font-semibold">
              Join our network of smart farmers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Tractor className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-name" className="font-ui text-sm font-medium">Full Name</Label>
              <Input
                id="farmer-name"
                placeholder="e.g. Ramesh Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-phone" className="font-ui text-sm font-medium">Phone Number</Label>
              <Input
                id="farmer-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-password" className="font-ui text-sm font-medium">Password</Label>
              <Input
                id="farmer-password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-village" className="font-ui text-sm font-medium">Village / Location</Label>
              <Input
                id="farmer-village"
                placeholder="e.g. Sangli, Maharashtra"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Truck className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-vehicle" className="font-ui text-sm font-medium">Vehicle Number</Label>
              <Input
                id="farmer-vehicle"
                placeholder="e.g. MH-09-AB-1234"
                value={form.vehicle_no}
                onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-crop" className="font-ui text-sm font-medium">Crop Type</Label>
              <Input
                id="farmer-crop"
                placeholder="e.g. Sugarcane"
                value={form.crop_type}
                onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="farmer-hub" className="font-ui text-sm font-medium">Preferred Hub</Label>
              <Input
                id="farmer-hub"
                placeholder="e.g. Shree Sugar Mill"
                value={form.preferred_hub}
                onChange={(e) => setForm({ ...form, preferred_hub: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-display font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
            >
              {isSubmitting ? "Registering..." : "Register Farmer"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="font-ui text-sm text-muted-foreground">
              Already have an account?{" "}
              <a onClick={() => navigate("/farmer/login")} className="text-primary hover:underline cursor-pointer">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFarmer;
