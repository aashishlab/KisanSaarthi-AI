import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tractor, Lock, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FloatingShapes from "@/components/FloatingShapes";
import { login } from "@/lib/api";
import { toast } from "sonner";

const FarmerLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && password) {
      setIsLoading(true);
      try {
        const res = await login({ phone, password, role: 'farmer' });
        if (res.role === 'farmer') {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify({ id: res.id, name: res.name, role: res.role }));
          toast.success("Login successful!");
          navigate("/farmer/dashboard");
        } else {
          toast.error("Invalid role for this login page.");
        }
      } catch (err: any) {
        toast.error(err.message || "Login failed.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      <FloatingShapes />
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-float" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />

      <div className="z-10 w-full max-w-md px-4">
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
              KisanSaarthi AI
            </h1>
            <p className="font-ui text-sm text-muted-foreground mt-1 tracking-wide uppercase font-semibold">
              Farmer Login
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="tel"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
              />
            </div>
            
            <div className="space-y-2 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-colors font-ui rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs font-ui text-primary hover:text-primary/80 transition-colors">
                Forgot Password?
              </a>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-display font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group"
            >
              {isLoading ? "Logging in..." : "Enter Dashboard"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center flex flex-col gap-2">
            <p className="font-ui text-sm text-muted-foreground">
              Don't have an account? <a onClick={() => navigate("/register-farmer")} className="text-primary hover:underline cursor-pointer">Register</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerLogin;
