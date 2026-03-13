import { useState, useEffect } from "react";
import { Bell, Factory, LayoutDashboard, ListTodo, FileText, Settings, LogOut, ClipboardList, CheckCircle2, XCircle, Clock, ChevronDown, AlertCircle, Truck, Sparkles, Zap, BarChart2, Leaf, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetchHubBookings, updateBookingStatusNew, fetchFactoryHub, Booking, Hub } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ pendingCount }: { pendingCount: number }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 flex flex-col">
      <div className="flex items-center gap-2.5 p-6 border-b border-white/10">
        <div className="p-1.5 bg-primary rounded-xl"><Factory className="h-5 w-5 text-primary-foreground" /></div>
        <span className="font-display text-xl font-bold tracking-tight">KisanSaarthi AI</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</div>
        <a href="/factory/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <LayoutDashboard className="h-5 w-5" />Dashboard
        </a>
        <a href="/factory/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <ListTodo className="h-5 w-5" />Live Queue
        </a>
        <a href="/factory/requests" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
          <div className="flex items-center gap-3"><ClipboardList className="h-5 w-5" />Requests</div>
          {pendingCount > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>}
        </a>
        <div className="px-2 mt-8 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</div>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <FileText className="h-5 w-5" />Reports
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <Settings className="h-5 w-5" />Settings
        </a>
      </div>
      <div className="p-4 border-t border-white/10">
        <Button variant="ghost" onClick={() => { localStorage.clear(); navigate("/factory/login"); }} className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-5 w-5" />Logout
        </Button>
      </div>
    </div>
  );
};

const FactoryRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [approvalData, setApprovalData] = useState({
    token_number: "",
    slot_time: "",
    waiting_time: ""
  });

  // Get factory user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const factory_id = user.id;

  // Fetch factory hub
  const { data: hub, isLoading: isHubLoading } = useQuery<Hub>({
    queryKey: ['factory-hub', factory_id],
    queryFn: () => fetchFactoryHub(factory_id),
    enabled: !!factory_id
  });

  const hub_id = hub?.id;

  // Fetch pending bookings for this hub
  const { data: bookings = [], isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['factory-bookings', hub_id],
    queryFn: () => fetchHubBookings(hub_id!),
    enabled: !!hub_id,
    refetchInterval: 5000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }: { id: number, data?: any }) => updateBookingStatusNew(id, 'Approved'),
    onSuccess: () => {
      toast.success("✅ Booking approved!");
      setAssigningId(null);
      setApprovalData({ token_number: "", slot_time: "", waiting_time: "" });
      queryClient.invalidateQueries({ queryKey: ['factory-bookings'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendingCount = bookings.length;

  if (!factory_id) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-4">
      <p>Please login to access this page.</p>
      <Button onClick={() => navigate('/factory/login')}>Go to Login</Button>
    </div>;
  }

  if (isHubLoading || isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-display text-xl">Loading requests...</div>;
  if (isError) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive font-display text-xl">Error loading requests.</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 ml-64 pl-8 pr-8 pt-8 pb-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="font-display text-3xl font-bold tracking-tight">Booking Requests</h1>
            </div>
            <p className="font-ui text-muted-foreground">Manage incoming arrival slot requests for {hub?.name || 'your hub'}.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5 text-foreground" />
              {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">{pendingCount}</span>}
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">OP</div>
              <span className="font-ui text-sm font-medium">{user.name || 'Operator'}</span>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="glass-strong rounded-2xl shadow-md border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold tracking-tight">Pending Bookings</h3>
              {pendingCount > 0 && <span className="ml-1 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} awaiting</span>}
            </div>
            <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['factory-bookings'] })}>Refresh</Button>
          </div>

          {bookings.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-40" />
              <p className="font-display text-lg font-semibold text-muted-foreground">No pending bookings</p>
              <p className="text-sm text-muted-foreground mt-1">All arrival slot requests have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {booking.farmer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{booking.farmer_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.farmer_phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Vehicle</p>
                      <p className="text-sm font-medium">{booking.vehicle_no}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Crop</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-green-400" /> {booking.crop_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 capitalize">{booking.status}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setAssigningId(assigningId === booking.id ? null : booking.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Assign Slot
                    </Button>
                  </div>

                  {assigningId === booking.id && (
                    <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Assign Slot Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-muted-foreground font-bold">Token Number</label>
                          <Input 
                            placeholder="e.g. TK-882" 
                            className="bg-white/5 border-white/10 h-10"
                            value={approvalData.token_number}
                            onChange={(e) => setApprovalData(prev => ({ ...prev, token_number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-muted-foreground font-bold">Slot Time</label>
                          <Input 
                            placeholder="e.g. 10:30 AM" 
                            className="bg-white/5 border-white/10 h-10"
                            value={approvalData.slot_time}
                            onChange={(e) => setApprovalData(prev => ({ ...prev, slot_time: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase text-muted-foreground font-bold">Waiting Time</label>
                          <Input 
                            placeholder="e.g. 45 mins" 
                            className="bg-white/5 border-white/10 h-10"
                            value={approvalData.waiting_time}
                            onChange={(e) => setApprovalData(prev => ({ ...prev, waiting_time: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => approveMutation.mutate({ id: booking.id, data: approvalData })}
                          disabled={approveMutation.isPending || !approvalData.token_number || !approvalData.slot_time}
                          className="shadow-lg shadow-primary/20"
                        >
                          {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
                        </Button>
                        <Button variant="ghost" onClick={() => setAssigningId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default FactoryRequests;
