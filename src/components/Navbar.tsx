import { Bell, User, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-2xl shadow-lg shadow-foreground/5">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary rounded-xl">
            <Wheat className="h-5 w-5 text-primary-foreground" />
          </div>
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
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors duration-200">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-muted transition-colors duration-200">
            <User className="h-5 w-5 text-muted-foreground" />
          </button>
          <a href="/">
            <Button variant="outline" className="font-ui font-semibold text-sm rounded-xl px-5 h-10 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 ml-2">
              Logout
            </Button>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
