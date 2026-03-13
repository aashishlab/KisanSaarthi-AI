import { useQuery } from "@tanstack/react-query";
import { fetchFarmerBookings, ArrivalBooking } from "@/lib/api";
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Timer } from "lucide-react";

export const FarmerBookings = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const farmer_id = user.id;

  const { data: bookings = [], isLoading, isError } = useQuery<ArrivalBooking[]>({
    queryKey: ['farmer-bookings', farmer_id],
    queryFn: () => fetchFarmerBookings(farmer_id),
    enabled: !!farmer_id,
    refetchInterval: 5000,
  });

  if (!farmer_id || (bookings.length === 0 && !isLoading)) return null;

  return (
    <section className="py-12 px-4">
      <div className="container">
        <div className="flex items-center gap-2 mb-8 text-primary">
          <Calendar className="h-6 w-6" />
          <h2 className="font-display text-2xl font-bold tracking-tight">Your Slot Bookings</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
            <Timer className="h-4 w-4" /> Fetching your bookings...
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" /> Error loading bookings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === 'Approved' || booking.status === 'In Progress' || booking.status === 'Completed'
                    ? 'bg-green-500/20 text-green-400 border-l border-b border-green-500/20' 
                    : 'bg-yellow-500/20 text-yellow-400 border-l border-b border-yellow-500/20'
                }`}>
                  {booking.status}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg leading-tight">{booking.hub_name}</h3>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{booking.hub_category}</p>
                    </div>
                  </div>

                  {['Approved', 'In Progress', 'Completed'].includes(booking.status) ? (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-3">
                      <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded-lg transition-colors">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Token No</span>
                        <span className="font-mono font-bold text-primary flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {booking.token_number}
                        </span>
                      </div>
                      <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded-lg transition-colors">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Slot Time</span>
                        <span className="font-display font-semibold text-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {booking.slot_time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center group/item hover:bg-white/5 p-1 rounded-lg transition-colors">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Wait Time</span>
                        <span className="font-mono text-sm text-foreground flex items-center gap-1">
                          <Timer className="h-3.5 w-3.5 text-muted-foreground" /> {booking.waiting_time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                       <Timer className="h-8 w-8 text-yellow-500/50 animate-pulse" />
                       <p className="text-sm font-medium text-muted-foreground">Waiting for factory approval...</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-mono">ID: #{booking.id.toString().padStart(5, '0')}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
