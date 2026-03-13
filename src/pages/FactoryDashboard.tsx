import { useState, useEffect } from "react";
import { Bell, Factory, Truck, Activity, AlertTriangle, Clock, LayoutDashboard, ListTodo, FileText, Settings, LogOut, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchHubBookings, updateBookingStatusNew, fetchPendingCount, fetchFactoryHub, fetchSlots, createSlot, Booking, Slot } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Sidebar = ({ pendingCount, onLogout }: { pendingCount: number, onLogout: () => void }) => (
  <div className="fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out">
    <div className="flex items-center gap-2.5 p-6 border-b border-white/10">
      <div className="p-1.5 bg-primary rounded-xl">
        <Factory className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-display text-xl font-bold tracking-tight">KisanSaarthi AI</span>
    </div>

    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Overview
      </div>
      <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
        <ListTodo className="h-5 w-5" />
        Live Queue
      </a>
      <a href="/factory/requests" className="flex items-center justify-between px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5" />
          Requests
        </div>
        {pendingCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
        )}
      </a>

      <div className="px-2 mt-8 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Operations
      </div>
      <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
        <FileText className="h-5 w-5" />
        Reports
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
        <Settings className="h-5 w-5" />
        Settings
      </a>
    </div>

    <div className="p-4 border-t border-white/10">
      <Button 
        variant="ghost" 
        onClick={onLogout}
        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  </div>
);

const FactoryDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };


  // Get factory user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const factory_id = user.id;

  // Fetch factory hub
  const { data: hub } = useQuery({
    queryKey: ['factory-hub', factory_id],
    queryFn: () => fetchFactoryHub(factory_id),
    enabled: !!factory_id
  });

  const hub_id = hub?.id;

  // Fetch bookings data for the new spec
  const { data: bookings = [], isLoading: loadingBookings, isError: bookingError } = useQuery({
    queryKey: ['hub-bookings', hub_id],
    queryFn: () => fetchHubBookings(hub_id!),
    enabled: !!hub_id,
    refetchInterval: 5000
  });

  // Fetch slots data
  const { data: slots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['hub-slots', hub_id],
    queryFn: () => fetchSlots(hub_id!),
    enabled: !!hub_id,
    refetchInterval: 5000
  });

  // Fetch pending requests count for sidebar badge
  const { data: pendingCountData } = useQuery({
    queryKey: ['pending-count', hub_id],
    queryFn: () => fetchPendingCount(hub_id),
    refetchInterval: 5000
  });
  const pendingCount = pendingCountData?.count ?? 0;

  // Mutation to create a slot
  const createSlotMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      toast.success('Slot created successfully');
      queryClient.invalidateQueries({ queryKey: ['hub-slots'] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updateBookingStatusNew(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['hub-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['hub-slots'] });
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Progress": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Delayed": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Approved": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Completed": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const [newSlotTime, setNewSlotTime] = useState("");
  const [newSlotCapacity, setNewSlotCapacity] = useState(10);

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hub_id) return;
    createSlotMutation.mutate({ hub_id, slot_time: newSlotTime, capacity: newSlotCapacity });
    setNewSlotTime("");
  };

  if (loadingBookings || loadingSlots) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-display text-xl">Loading Dashboard...</div>;
  }

  if (bookingError) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive font-display text-xl">Error loading dashboard data. Ensure backend is running.</div>;
  }

  const waiting = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved').length;
  const active = bookings.filter(b => b.status === 'In Progress').length;
  const completed = bookings.filter(b => b.status === 'Completed').length;
  const metrics = { waiting, active, completed };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar pendingCount={pendingCount} onLogout={handleLogout} />
      {/* Main Content wrapper */}
      <div className="flex-1 ml-64 pl-8 pr-8 pt-8 pb-12">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Factory Overview</h1>
            <p className="font-ui text-muted-foreground">Welcome back, Operator. Here's what's happening today at {hub?.name}.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200">
              <Bell className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.name?.substring(0, 2).toUpperCase() || "OP"}
              </div>
              <span className="font-ui text-sm font-medium">{user.name || "Operator"}</span>
            </div>
          </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Waiting Vehicles
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-foreground">{metrics.waiting}</span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p- green-500/10 rounded-xl text-green-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Active Slots
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-foreground">{metrics.active}</span>
              <span className="ml-2 text-sm text-muted-foreground">/ {slots.length} configured</span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Unloaded Today
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-foreground">{metrics.completed}</span>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group border-l-destructive/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
              <AlertTriangle className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl text-destructive-foreground">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Risk Factor
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-destructive-foreground">{metrics.waiting > 10 ? "HIGH" : "LOW"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold tracking-tight">Incoming Bookings (FCFS)</h3>
                <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['hub-bookings'] })}>Refresh</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left font-ui">
                  <thead className="text-xs uppercase text-muted-foreground border-b border-white/10">
                    <tr>
                      <th className="pb-3 font-semibold">TKN</th>
                      <th className="pb-3 font-semibold">Vehicle No.</th>
                      <th className="pb-3 font-semibold">Farmer</th>
                      <th className="pb-3 font-semibold">Slot</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">No bookings found.</td>
                      </tr>
                    ) : (
                      bookings.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-bold text-primary">#{row.token_number}</td>
                          <td className="py-4 font-medium">{row.vehicle_no}</td>
                          <td className="py-4">{row.farmer_name}</td>
                          <td className="py-4 text-muted-foreground">{row.slot_time}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {row.status === 'Pending' && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleUpdateStatus(row.id, 'Approved')}
                                >
                                  Approve
                                </Button>
                              )}
                              {row.status === 'Approved' && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => handleUpdateStatus(row.id, 'In Progress')}
                                >
                                  Start
                                </Button>
                              )}
                              {row.status === 'In Progress' && (
                                <Button
                                  size="sm"
                                  className="h-8 bg-primary hover:bg-primary/90 text-white"
                                  onClick={() => handleUpdateStatus(row.id, 'Completed')}
                                >
                                  Complete
                                </Button>
                              )}
                              {row.status !== 'Completed' && row.status !== 'Rejected' && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleUpdateStatus(row.id, 'Rejected')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manage Slots Section */}
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
              <h3 className="font-display text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Manage Hub Slots
              </h3>
              
              <form onSubmit={handleCreateSlot} className="flex flex-wrap gap-4 mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Slot Time (e.g. 08:00 - 09:00)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 08:00 AM - 09:00 AM" 
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    required
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={newSlotCapacity}
                    onChange={(e) => setNewSlotCapacity(parseInt(e.target.value))}
                    required
                    min="1"
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="h-10 px-6">Add Slot</Button>
                </div>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slots.map((slot) => {
                  const percent = slot.capacity > 0 ? (slot.booked_count / slot.capacity) : 0;
                  let color = "bg-green-500";
                  if (percent >= 0.8) color = "bg-red-500";
                  else if (percent >= 0.4) color = "bg-yellow-500";

                  return (
                    <div key={slot.id} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-ui font-bold">{slot.slot_time}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">
                          {slot.booked_count} / {slot.capacity} Booked
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1">
                        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(percent * 100, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{slot.capacity - slot.booked_count} slots remaining</span>
                        <span className="font-bold">{Math.round(percent * 100)}% Full</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 text-center">
              <h3 className="font-display text-xl font-bold tracking-tight mb-6 text-left">Queue Velocity</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted opacity-20" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.85" strokeDashoffset={`${351.85 - (Math.min((metrics.waiting * 5), 100) / 100) * 351.85}`} className={metrics.waiting > 10 ? "text-destructive" : "text-primary"} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-bold">{metrics.waiting}</span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Vehicles</span>
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground font-ui">
                Average processing time: 10 mins per truck
              </p>
            </div>

            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
              <h3 className="font-display text-xl font-bold tracking-tight mb-4">Operations Metrics</h3>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Queue Load</span>
                    <span className="text-xs font-bold">{Math.min(metrics.waiting * 10, 100)}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(metrics.waiting * 10, 100)}%` }} />
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Completion Rate</span>
                    <span className="text-xs font-bold">92%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryDashboard;
