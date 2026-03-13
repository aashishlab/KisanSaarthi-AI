import React from 'react';
import { User, MapPin, Truck, History, Star, Settings, Globe, LogOut, ChevronRight, CheckCircle2, Phone, Home, Calendar, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchFarmerProfile } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FarmerProfileDropdownProps {
  farmerId: number;
}

const FarmerProfileDropdown: React.FC<FarmerProfileDropdownProps> = ({ farmerId }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['farmer-profile', farmerId],
    queryFn: () => fetchFarmerProfile(farmerId),
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isLoading) return <Button variant="ghost" size="icon" className="rounded-xl animate-pulse bg-muted/50" />;
  if (error || !profile) return <Button variant="ghost" size="icon" className="rounded-xl"><User className="h-5 w-5 text-muted-foreground" /></Button>;

  const isReliable = profile.reliability_score >= 80;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl hover:bg-muted transition-all duration-200 group">
          <div className="absolute inset-0 bg-primary/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-200" />
          <User className="h-5 w-5 text-muted-foreground group-hover:text-primary relative z-10" />
          {profile.pending_requests > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
              {profile.pending_requests}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-0 glass-strong border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" align="end" sideOffset={8}>
        {/* Profile Header */}
        <div className="relative p-6 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
               <div className="text-2xl font-display font-bold text-primary">
                 {profile.name.charAt(0)}
               </div>
            </div>
            <div>
              <h4 className="font-display font-bold text-lg leading-tight">{profile.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {profile.village}
              </p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-2 ${
                isReliable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}>
                <Star className="h-3 w-3 fill-current" />
                {isReliable ? 'Reliable Farmer' : 'Regular Member'}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/5 m-0" />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-px bg-white/5">
          <div className="bg-background/40 p-3 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Reliability</span>
             <span className="font-display font-bold text-primary">{profile.reliability_score}%</span>
          </div>
          <div className="bg-background/40 p-3 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Pending</span>
             <span className="font-display font-bold text-foreground">{profile.pending_requests}</span>
          </div>
          <div className="bg-background/40 p-3 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Approved</span>
             <span className="font-display font-bold text-green-500">{profile.approved_requests}</span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/5 m-0" />

        <div className="p-4 space-y-4">
          {/* Information Section */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-2">Basic & Vehicle Info</h5>
            <div className="space-y-2">
              <ProfileItem icon={Phone} label="Phone" value={profile.phone} />
              <ProfileItem icon={Truck} label="Vehicle No" value={profile.vehicle_no} />
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/5" />

          {/* Activity Info Section */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-2">Activity Info</h5>
            <div className="space-y-2">
              <ProfileItem icon={Activity} label="Total Visits" value={`${profile.total_visits} Factories`} />
              <ProfileItem icon={History} label="Last Factory" value={profile.last_factory || 'No visits yet'} />
              <ProfileItem icon={Clock} label="Last Slot" value={profile.last_slot || 'N/A'} />
              <ProfileItem icon={Home} label="Pref. Factory" value={profile.preferred_hub} />
              <ProfileItem icon={Calendar} label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/5" />

          {/* Action Buttons */}
          <div className="space-y-1">
            <DropdownAction icon={Settings} label="Edit Profile" />
            <DropdownAction icon={Globe} label="Change Language" />
            <DropdownAction 
              icon={LogOut} 
              label="Logout" 
              variant="destructive" 
              onClick={handleLogout}
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ProfileItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center justify-between px-2 py-1">
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">{value}</span>
  </div>
);

const DropdownAction = ({ icon: Icon, label, variant, onClick }: { icon: any, label: string, variant?: 'destructive', onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      variant === 'destructive' 
        ? 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive' 
        : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 ${variant === 'destructive' ? 'group-hover:text-destructive' : 'group-hover:text-primary'} transition-colors`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);

export default FarmerProfileDropdown;
