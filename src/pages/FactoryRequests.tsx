import { useState } from "react";
import { Bell, Factory, LayoutDashboard, ListTodo, FileText, Settings, LogOut, ClipboardList, CheckCircle2, XCircle, Clock, ChevronDown, AlertCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchRequests, acceptRequest, rejectRequest, assignSlot, fetchPendingCount, RequestsData } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const ALL_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

const Sidebar = ({ pendingCount }: { pendingCount: number }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out">
      <div className="flex items-center gap-2.5 p-6 border-b border-white/10">
        <div className="p-1.5 bg-primary rounded-xl">
          <Factory className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">KisanSaarthi AI</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</div>
        <a href="/factory/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </a>
        <a href="/factory/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors font-medium">
          <ListTodo className="h-5 w-5" />
          Live Queue
        </a>
        <a href="/factory/requests" className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5" />
            Requests
          </div>
          {pendingCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </a>

        <div className="px-2 mt-8 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</div>
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
        <Button variant="ghost" onClick={() => navigate("/factory/login")} className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

const FactoryRequests = () => {
  const queryClient = useQueryClient();
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Record<number, string>>({});

  const { data: requestsData, isLoading, isError } = useQuery<RequestsData>({
    queryKey: ['requests'],
    queryFn: fetchRequests,
    refetchInterval: 5000,
  });

  const { data: pendingCountData } = useQuery({
    queryKey: ['pending-count'],
    queryFn: fetchPendingCount,
    refetchInterval: 5000,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: number) => acceptRequest(id),
    onSuccess: (data) => {
      toast.success(`Request accepted! Assigned slot: ${data.data.arrival_slot}`);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectRequest(id),
    onSuccess: () => {
      toast.success('Request rejected.');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, slot }: { id: number; slot: string }) => assignSlot(id, slot),
    onSuccess: (data) => {
      toast.success(`Slot ${data.data.arrival_slot} assigned successfully!`);
      setAssigningId(null);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleAssignSlot = (id: number) => {
    const slot = selectedSlot[id] || ALL_SLOTS[0];
    assignMutation.mutate({ id, slot });
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-display text-xl">Loading Requests...</div>;
  if (isError) return <div className="min-h-screen bg-background flex items-center justify-center text-destructive font-display text-xl">Error loading requests. Ensure backend is running.</div>;

  const pendingCount = pendingCountData?.count ?? 0;
  const requests = requestsData?.requests ?? [];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar pendingCount={pendingCount} />

      <div className="flex-1 ml-64 pl-8 pr-8 pt-8 pb-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1">Farmer Requests</h1>
            <p className="font-ui text-muted-foreground">Review and manage slot requests from farmers.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200 relative">
              <Bell className="h-5 w-5 text-foreground" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/5 border border-white/10">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">OP</div>
              <span className="font-ui text-sm font-medium">Operator 1</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ClipboardList className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500"><ClipboardList className="h-5 w-5" /></div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">Pending Requests</h3>
            </div>
            <span className="font-display text-4xl font-bold text-foreground">{pendingCount}</span>
          </div>
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><CheckCircle2 className="h-5 w-5" /></div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">Shown on Page</h3>
            </div>
            <span className="font-display text-4xl font-bold text-foreground">{requests.length}</span>
          </div>
          <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertCircle className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><AlertCircle className="h-5 w-5" /></div>
              <h3 className="font-ui font-semibold text-muted-foreground uppercase text-xs tracking-wider">Available Slots</h3>
            </div>
            <span className="font-display text-4xl font-bold text-foreground">{ALL_SLOTS.length}</span>
          </div>
        </div>

        {/* Requests Table */}
        <div className="glass-strong rounded-2xl p-6 shadow-md border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Pending Slot Requests
              {pendingCount > 0 && (
                <span className="ml-2 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} new</span>
              )}
            </h3>
            <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={() => queryClient.invalidateQueries({ queryKey: ['requests'] })}>Refresh</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left font-ui">
              <thead className="text-xs uppercase text-muted-foreground border-b border-white/10">
                <tr>
                  <th className="pb-3 font-semibold">Farmer Name</th>
                  <th className="pb-3 font-semibold">Vehicle No.</th>
                  <th className="pb-3 font-semibold">Hub Name</th>
                  <th className="pb-3 font-semibold">Preferred Slot</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 opacity-30" />
                        <p className="font-medium">No pending requests.</p>
                        <p className="text-xs">All farmer requests have been processed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {req.farmer_name.charAt(0).toUpperCase()}
                          </div>
                          {req.farmer_name}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-mono text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md">{req.vehicle_no}</span>
                      </td>
                      <td className="py-4 text-muted-foreground">{req.hub_name}</td>
                      <td className="py-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {req.arrival_slot}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {/* Accept Button */}
                          <Button
                            size="sm"
                            className="h-8 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 font-medium gap-1.5"
                            variant="ghost"
                            title="Accept and auto-assign the next available slot"
                            onClick={() => acceptMutation.mutate(req.id)}
                            disabled={acceptMutation.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accept
                          </Button>

                          {/* Assign Slot Button */}
                          <Button
                            size="sm"
                            className="h-8 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-medium gap-1.5"
                            variant="ghost"
                            title="Assign a specific slot"
                            onClick={() => setAssigningId(assigningId === req.id ? null : req.id)}
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Assign
                          </Button>

                          {/* Reject Button */}
                          <Button
                            size="sm"
                            className="h-8 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-medium gap-1.5"
                            variant="ghost"
                            title="Reject this request"
                            onClick={() => rejectMutation.mutate(req.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>

                        {/* Inline Slot Assignment Panel */}
                        {assigningId === req.id && (
                          <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 justify-end">
                            <select
                              className="flex-1 max-w-xs h-9 px-3 bg-background border border-white/10 rounded-lg text-sm font-ui text-foreground outline-none focus:border-primary/50 transition-colors"
                              value={selectedSlot[req.id] || ALL_SLOTS[0]}
                              onChange={(e) => setSelectedSlot(prev => ({ ...prev, [req.id]: e.target.value }))}
                            >
                              {ALL_SLOTS.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              className="h-9 gap-1.5"
                              onClick={() => handleAssignSlot(req.id)}
                              disabled={assignMutation.isPending}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                              Confirm
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryRequests;
