import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Lock, Phone, ArrowRight, ArrowLeft, MapPin, Tag, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FloatingShapes from "@/components/FloatingShapes";
import { registerFactory, RegisterFactoryData } from "@/lib/api";
import { toast } from "sonner";

const RegisterFactory = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterFactoryData>({
    factory_name: "",
    phone: "",
    password: "",
    hub_name: "",
    category: "",
    location: "",
    latitude: 0,
    longitude: 0,
    capacity_per_slot: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.factory_name || !form.phone || !form.password || !form.hub_name || !form.category || !form.location || !form.latitude || !form.longitude || !form.capacity_per_slot) {
      toast.error("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerFactory(form);
      toast.success("Factory registered successfully!");
      navigate("/factory/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
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
              <Factory className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground text-center">
              Register Factory
            </h1>
            <p className="font-ui text-sm text-muted-foreground mt-1 tracking-wide uppercase font-semibold">
              Create your account & first hub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Factory Information Section */}
            <div className="space-y-1 mb-2">
              <p className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground">Factory Information</p>
              <div className="h-px bg-white/10" />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Factory className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="factory-name" className="font-ui text-sm font-medium">Factory Name</Label>
              <Input
                id="factory-name"
                placeholder="e.g. Shree Industries Pvt Ltd"
                value={form.factory_name}
                onChange={(e) => setForm({ ...form, factory_name: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="factory-phone" className="font-ui text-sm font-medium">Phone Number</Label>
              <Input
                id="factory-phone"
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
              <Label htmlFor="factory-password" className="font-ui text-sm font-medium">Password</Label>
              <Input
                id="factory-password"
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            {/* Hub Information Section */}
            <div className="space-y-1 mb-2 pt-2">
              <p className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hub Information</p>
              <div className="h-px bg-white/10" />
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="hub-name" className="font-ui text-sm font-medium">Hub Name</Label>
              <Input
                id="hub-name"
                placeholder="e.g. Shree Sugar Mill"
                value={form.hub_name}
                onChange={(e) => setForm({ ...form, hub_name: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hub-category" className="font-ui text-sm font-medium">Category</Label>
              <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                <SelectTrigger id="hub-category" className="h-12 bg-white/5 border-white/10 font-ui rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sugar Mill">Sugar Mill</SelectItem>
                  <SelectItem value="Dairy Plant">Dairy Plant</SelectItem>
                  <SelectItem value="Food Processing">Food Processing</SelectItem>
                  <SelectItem value="APMC Market">APMC Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="hub-location" className="font-ui text-sm font-medium">Location</Label>
              <Input
                id="hub-location"
                placeholder="e.g. Kolhapur, Maharashtra"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hub-lat" className="font-ui text-sm font-medium">Latitude</Label>
                <Input
                  id="hub-lat"
                  type="number"
                  step="any"
                  placeholder="e.g. 16.7050"
                  value={form.latitude || ""}
                  onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hub-lng" className="font-ui text-sm font-medium">Longitude</Label>
                <Input
                  id="hub-lng"
                  type="number"
                  step="any"
                  placeholder="e.g. 74.2433"
                  value={form.longitude || ""}
                  onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none mt-6">
                <Hash className="h-4 w-4 text-muted-foreground" />
              </div>
              <Label htmlFor="hub-capacity" className="font-ui text-sm font-medium">Capacity per Slot</Label>
              <Input
                id="hub-capacity"
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={form.capacity_per_slot || ""}
                onChange={(e) => setForm({ ...form, capacity_per_slot: parseInt(e.target.value) || 0 })}
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl font-display font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
            >
              {isSubmitting ? "Registering..." : "Register Factory"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="font-ui text-sm text-muted-foreground">
              Already have an account?{" "}
              <a onClick={() => navigate("/factory/login")} className="text-primary hover:underline cursor-pointer">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFactory;
