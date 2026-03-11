import { useNavigate } from "react-router-dom";
import { Factory, Tractor, ArrowRight } from "lucide-react";
import FloatingShapes from "@/components/FloatingShapes";
import { Button } from "@/components/ui/button";

const Gateway = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-background px-4">
      <FloatingShapes />
      
      {/* Decorative background elements matching the main theme */}
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-float" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />

      <div className="z-10 text-center mb-12">
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
          Welcome to <span className="text-primary">KisanSaarthi AI</span>
        </h1>
        <p className="font-ui text-lg text-muted-foreground max-w-lg mx-auto">
          Eliminating wait times at agro-industrial hubs through AI-powered scheduling.
          Please select your portal to continue.
        </p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Farmer Portal Card */}
        <div 
          onClick={() => navigate("/farmer/login")}
          className="glass-strong rounded-3xl p-8 shadow-2xl animate-fade-in border border-white/10 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center text-center">
             <div className="p-4 bg-primary/10 rounded-2xl mb-6 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
               <Tractor className="h-12 w-12 text-primary" />
             </div>
             <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Farmer Portal</h2>
             <p className="font-ui text-sm text-muted-foreground mb-8">
               Book unloading slots, check queue status, and avoid long waiting times at processing hubs.
             </p>
             <Button className="w-full rounded-xl font-display font-semibold group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25 transition-all">
               Login as Farmer <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Factory Portal Card */}
        <div 
           onClick={() => navigate("/factory/login")}
           className="glass-strong rounded-3xl p-8 shadow-2xl animate-fade-in border border-white/10 relative overflow-hidden group cursor-pointer hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]"
           style={{ animationDelay: "100ms" }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center text-center">
             <div className="p-4 bg-blue-500/10 rounded-2xl mb-6 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
               <Factory className="h-12 w-12 text-blue-500" />
             </div>
             <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-2">Factory Operator</h2>
             <p className="font-ui text-sm text-muted-foreground mb-8">
               Manage incoming vehicles, monitor live queues, and approve slot bookings efficiently.
             </p>
             <Button variant="secondary" className="w-full rounded-xl font-display font-semibold transition-all">
               Login as Operator <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Gateway;
