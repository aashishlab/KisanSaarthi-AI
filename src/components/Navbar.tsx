import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import FarmerProfileDropdown from "./FarmerProfileDropdown";

const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isFarmer = user?.role === 'farmer';

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-2xl shadow-lg shadow-foreground/5 dark:bg-background/80 dark:backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2.5">
          <img src="/KisanSaarthi.jpeg" alt="KisanSaarthi Logo" className="h-10 w-auto p-1 object-contain rounded-xl mix-blend-multiply dark:mix-blend-normal dark:bg-white" />
          <span className="font-display text-xl font-bold tracking-tight">KisanSaarthi AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Dashboard", "Hubs", "Queue Status", "Bookings"].map((link) => (
            <a
              key={link}
              href="#"
              className="font-ui text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors duration-200">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
          
          {isFarmer && user.id ? (
            <FarmerProfileDropdown farmerId={user.id} />
          ) : (
            <button className="p-2.5 rounded-xl hover:bg-muted transition-colors duration-200">
              <User className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="font-ui font-semibold text-sm rounded-xl px-5 h-10 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 ml-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
