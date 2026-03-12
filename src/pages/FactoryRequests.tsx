import { useState } from "react";
import { Bell, Factory, LayoutDashboard, ListTodo, FileText, Settings, LogOut, ClipboardList, CheckCircle2, XCircle, Clock, ChevronDown, AlertCircle, Truck, Sparkles, Zap, BarChart2, Leaf, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptRequest, rejectRequest, assignSlot } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ALL_SLOTS = [
  '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM', '12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM',
];

interface FarmerRequest {
  id: number;
  farmer_name: string;
  vehicle_no: string;
  hub_name: string;
  crop_type: string;
  preferred_date: string;
  preferred_time: string;
  assigned_slot: string | null;
  status: string;
  created_at: string;
  recommended_slot: string | null;
  slot_load: number;
  slot_load_label: string;
}

interface RequestsAPIData {
  requests: FarmerRequest[];
  total: number;
  available_slots: string[];
}

const LoadBadge = ({ label }: { label: string }) => {
  const colors: Record<string, string> = {
    'Empty': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Low Load': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Moderate': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors[label] || 'bg-muted text-muted-foreground border-border'}`}>{label}</span>;
};

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
        <Button variant="ghost" onClick={() => navigate("/factory/login")} className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-5 w-5" />Logout
        </Button>
      </div>
    </div>
  );
};

const FactoryRequests = () => {
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Record<number, string>>({});

  const { data: requestsData, isLoading, isError } = useQuery<RequestsAPIData>({
    queryKey: ['requests'],
    queryFn: async () => {
      const res = await fetch('/api/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: pendingCountData } = useQuery({
    queryKey: ['pending-count'],
    queryFn: async () => { const res = await fetch('/api/pending-count'); return res.json(); },
    refetchInterval: 5000,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => acceptRequest(id),
    onSuccess: (data) => {
      toast.success(`✅ Slot assigned: ${data.data.arrival_slot}`);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectRequest(id),
    onSuccess: () => {
      toast.success('Request rejected.');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, slot }: { id: number; slot: string }) => assignSlot(id, slot),
    onSuccess: (data) => {
      toast.success(`Slot ${data.data.arrival_slot} assigned!`);
      setAssigningId(null);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendingCount = pendingCountData?.count ?? 0;
  const requests = requestsData?.requests ?? [];
  const availableSlots = requestsData?.available_slots ?? ALL_SLOTS;

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-display text-xl">Analysing requests...</div>;
  if (isError) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive font-display text-xl">Error — is the backend running?</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar pendingCount={pendingCount} />
      <div className="flex-1 ml-64 pl-8 pr-8 pt-8 pb-12">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="font-display text-3xl font-bold tracking-tight">Request Management</h1>
            </div>
            <p className="font-ui text-muted-foreground">AI recommends the optimal slot for each farmer request.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Bell className="h-5 w-5 text-foreground" />
              {pendingCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">{pendingCount}</span>}
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">OP</div>
              <span className="font-ui text-sm font-medium">Operator 1</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { icon: <ClipboardList className="h-5 w-5" />, color: 'bg-yellow-500/10 text-yellow-400', label: 'Pending', value: pendingCount },
            { icon: <CheckCircle2 className="h-5 w-5" />, color: 'bg-green-500/10 text-green-400', label: 'Available Slots', value: availableSlots.length },
            { icon: <Sparkles className="h-5 w-5" />, color: 'bg-primary/10 text-primary', label: 'AI Recommended', value: requests.filter(r => r.recommended_slot).length },
            { icon: <BarChart2 className="h-5 w-5" />, color: 'bg-blue-500/10 text-blue-400', label: 'Total Slots', value: ALL_SLOTS.length },
          ].map(({ icon, color, label, value }) => (
            <div key={label} className="glass-strong rounded-2xl p-5 border border-white/5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
              <div><p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{label}</p><p className="font-display text-2xl font-bold">{value}</p></div>
            </div>
          ))}
        </div>

        {/* Requests List */}
        <div className="glass-strong rounded-2xl shadow-md border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-bold tracking-tight">Pending Farmer Requests</h3>
              {pendingCount > 0 && <span className="ml-1 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} awaiting</span>}
            </div>
            <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['requests'] })}>Refresh</Button>
          </div>

          {requests.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-40" />
              <p className="font-display text-lg font-semibold text-muted-foreground">All clear!</p>
              <p className="text-sm text-muted-foreground mt-1">No pending requests from farmers.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {requests.map((req) => (
                <div key={req.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    {/* Farmer */}
                    <div className="col-span-2 lg:col-span-1 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {req.farmer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{req.farmer_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{req.vehicle_no}</p>
                      </div>
                    </div>

                    {/* Hub & Crop */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Hub</p>
                      <p className="text-sm font-medium truncate">{req.hub_name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Leaf className="h-3 w-3 text-green-400" />
                        <p className="text-xs text-green-400 font-medium">{req.crop_type}</p>
                      </div>
                    </div>

                    {/* Preferred Date & Time */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Requested For</p>
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(req.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {req.preferred_time}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />AI Slot
                      </p>
                      {req.recommended_slot ? (
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-lg">
                            <Zap className="h-3 w-3" />{req.recommended_slot}
                          </div>
                          <LoadBadge label={req.slot_load_label} />
                        </div>
                      ) : (
                        <span className="text-xs text-destructive font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />No slots
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Pending</span>
                      {req.created_at && (
                        <p className="text-xs text-muted-foreground mt-1">{new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
                    {req.recommended_slot && (
                      <Button size="sm" variant="ghost"
                        className="h-9 gap-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 font-semibold"
                        onClick={() => acceptMutation.mutate(req.id)} disabled={acceptMutation.isPending}>
                        <CheckCircle2 className="h-4 w-4" />
                        Accept Suggested Slot
                        <span className="text-green-300/70 text-xs">({req.recommended_slot.split(' - ')[0]})</span>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost"
                      className="h-9 gap-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold"
                      onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}>
                      <Truck className="h-4 w-4" />Assign Manually
                    </Button>
                    <Button size="sm" variant="ghost"
                      className="h-9 gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-semibold"
                      onClick={() => rejectMutation.mutate(req.id)} disabled={rejectMutation.isPending}>
                      <XCircle className="h-4 w-4" />Reject Request
                    </Button>
                  </div>

                  {/* Manual Slot Assignment Panel */}
                  {assigningId === req.id && (
                    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Select slot to assign</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {ALL_SLOTS.map(slot => (
                          <button key={slot} type="button" onClick={() => setSelectedSlot(p => ({ ...p, [req.id]: slot }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                              (selectedSlot[req.id] || ALL_SLOTS[0]) === slot
                                ? 'bg-primary/20 border-primary text-primary'
                                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                            }`}>{slot}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="h-9 gap-1.5"
                          onClick={() => assignMutation.mutate({ id: req.id, slot: selectedSlot[req.id] || ALL_SLOTS[0] })}
                          disabled={assignMutation.isPending}>
                          <ChevronDown className="h-3.5 w-3.5" />Confirm Assignment
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 text-muted-foreground" onClick={() => setAssigningId(null)}>Cancel</Button>
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
