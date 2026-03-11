import { useState, useEffect } from "react";
import { Bell, User, Factory, Truck, Activity, AlertTriangle, Clock, LayoutDashboard, ListTodo, Calendar, FileText, Settings, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchQueue, updateBookingStatus, QueueData, Booking } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Sidebar = () => (
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
      <a href="/book-slot" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
        <Calendar className="h-5 w-5" />
        Book Slots
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
      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </div>
  </div>
);

const FactoryDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch queue data from Express backend
  const { data: queueData, isLoading, isError } = useQuery({
    queryKey: ['queue'],
    queryFn: fetchQueue,
    refetchInterval: 5000 // Poll every 5s for live updates
  });

  // Mutation to update booking status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updateBookingStatus(id, status),
    onSuccess: (data) => {
      toast.success(data.message || 'Status updated');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Progress": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Delayed": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "Mark Unloaded": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-display text-xl">Loading Dashboard...</div>;
  }

  if (isError) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive font-display text-xl">Error loading dashboard data. Ensure backend is running.</div>;
  }

  const { metrics, queue } = queueData || { metrics: { waiting: 0, active: 0, completed: 0 }, queue: [] };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      {/* Main Content wrapper */}
      <div className="flex-1 ml-64 pl-8 pr-8 pt-8 pb-12">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Factory Overview</h1>
            <p className="font-ui text-muted-foreground">Welcome back, Operator. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200">
              <Bell className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10">
               <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 OP
               </div>
               <span className="font-ui text-sm font-medium">Operator 1</span>
            </div>
          </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Waiting Vehicles */}
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

          {/* Card 2: Active Slots */}
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Active Slots
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-foreground">{metrics.active}</span>
              <span className="ml-2 text-sm text-muted-foreground">/ 12 available</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((metrics.active / 12) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Card 3: Today's Unloading Count */}
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

          {/* Card 4: Safety Alerts */}
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group border-l-destructive/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-destructive">
              <AlertTriangle className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-4 mb-4">
              <div className="p-3 bg-destructive/10 rounded-xl text-destructive-foreground">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                Safety Alerts
              </h3>
            </div>
            <div className="relative z-10">
              <span className="font-display text-4xl font-bold text-destructive-foreground">{metrics.waiting > 10 ? 1 : 0}</span>
              <span className="ml-2 text-sm text-muted-foreground">{metrics.waiting > 10 ? "Congestion Risk" : "All Clear"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table Section (Takes 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-xl font-bold tracking-tight">Live Queue Management</h3>
                <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['queue'] })}>Refresh</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left font-ui">
                  <thead className="text-xs uppercase text-muted-foreground border-b border-white/10">
                    <tr>
                      <th className="pb-3 font-semibold">Vehicle No.</th>
                      <th className="pb-3 font-semibold">Farmer Name</th>
                      <th className="pb-3 font-semibold">Arrival Slot</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">No bookings found in the queue.</td>
                      </tr>
                    ) : (
                      queue.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-medium">{row.vehicle_no}</td>
                          <td className="py-4">{row.farmer_name}</td>
                          <td className="py-4 text-muted-foreground">{row.arrival_slot}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10" 
                                  title="Approve / In Progress"
                                  onClick={() => handleUpdateStatus(row.id, 'In Progress')}
                                  disabled={row.status === 'In Progress' || row.status === 'Mark Unloaded'}
                                >
                                 <CheckCircle2 className="h-4 w-4" />
                               </Button>
                               <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10" 
                                  title="Delay"
                                  onClick={() => handleUpdateStatus(row.id, 'Delayed')}
                                  disabled={row.status === 'Mark Unloaded'}
                                >
                                 <Clock className="h-4 w-4" />
                               </Button>
                               <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 text-primary hover:bg-primary/10" 
                                  title="Mark Unloaded"
                                  onClick={() => handleUpdateStatus(row.id, 'Mark Unloaded')}
                                  disabled={row.status === 'Mark Unloaded'}
                                >
                                 <Truck className="h-4 w-4" />
                               </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Congestion Chart Panel */}
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 h-[300px] flex flex-col">
              <h3 className="font-display text-xl font-bold tracking-tight mb-4">Congestion Forecast</h3>
              <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-white/5 relative overflow-hidden">
                {/* Simulated Chart Bars based on waiting queue */}
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-around px-8 h-4/5">
                   {[Math.min(30 + metrics.waiting * 5, 100), Math.min(45 + metrics.waiting * 2, 100), 80, 60, 90, 40, 20].map((height, i) => (
                     <div key={i} className="w-12 bg-primary/20 rounded-t-md relative group hover:bg-primary/40 transition-colors" style={{ height: `${height}%` }}>
                        {height > 75 && <div className="absolute -top-1 left-1.5 w-9 h-1 bg-destructive rounded-full" />}
                     </div>
                   ))}
                </div>
                <p className="text-muted-foreground font-ui relative z-10 bg-background/80 px-4 py-2 rounded-lg backdrop-blur-sm">Congestion Chart Visualization</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar panels (Takes 1 column) */}
          <div className="space-y-6">
            {/* Safety Risk Score */}
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 text-center">
              <h3 className="font-display text-xl font-bold tracking-tight mb-6 text-left">Safety Risk Score</h3>
              <div className="relative inline-flex items-center justify-center">
                 <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted opacity-20" />
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="351.85" strokeDashoffset={`${351.85 - (Math.min((metrics.waiting * 5) + 30, 95) / 100) * 351.85}`} className={metrics.waiting > 10 ? "text-destructive" : "text-yellow-500"} />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold">{Math.min((metrics.waiting * 5) + 30, 95)}</span>
                    <span className="text-xs text-muted-foreground uppercase font-semibold">{metrics.waiting > 10 ? 'High' : 'Moderate'}</span>
                 </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground font-ui">
                {metrics.waiting > 10 ? 'Risk score is elevated due to waiting vehicle congestion.' : 'Operations are currently running normally.'}
              </p>
            </div>

            {/* Vehicle Status Summary */}
            <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
              <h3 className="font-display text-xl font-bold tracking-tight mb-4">Status Overview</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm font-ui">
                   <span className="text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Waiting</span>
                   <span className="font-semibold">{metrics.waiting}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-ui">
                   <span className="text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"/> Unloading (Active)</span>
                   <span className="font-semibold">{metrics.active}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-ui">
                   <span className="text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"/> Completed</span>
                   <span className="font-semibold">{metrics.completed}</span>
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
