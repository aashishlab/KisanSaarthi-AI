import { MapPin, Clock, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const hubs = [
  { name: "Kolhapur Sugar Mill", location: "Kolhapur, MH", queue: 12, wait: "2.5 hrs", capacity: 50, status: "medium" as const },
  { name: "Pune APMC Market", location: "Pune, MH", queue: 4, wait: "45 min", capacity: 60, status: "low" as const },
  { name: "Nashik Cold Storage", location: "Nashik, MH", queue: 28, wait: "5+ hrs", capacity: 95, status: "high" as const },
  { name: "Sangli Turmeric Hub", location: "Sangli, MH", queue: 8, wait: "1.5 hrs", capacity: 35, status: "low" as const },
  { name: "Solapur Grain Depot", location: "Solapur, MH", queue: 19, wait: "3.5 hrs", capacity: 70, status: "medium" as const },
  { name: "Satara Dairy Plant", location: "Satara, MH", queue: 31, wait: "6+ hrs", capacity: 98, status: "high" as const },
];

const statusColor = {
  low: "bg-queue-low",
  medium: "bg-queue-medium",
  high: "bg-queue-high",
};

const statusBadge = {
  low: "bg-queue-low/10 text-queue-low",
  medium: "bg-queue-medium/10 text-queue-medium",
  high: "bg-queue-high/10 text-queue-high",
};

const NearbyHubs = () => {
  const { t } = useTranslation();
  return (
    <section className="relative bg-grid">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {t("realTimeData")}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">{t("nearbyAgroHubs")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubs.map((hub) => (
            <div
              key={hub.name}
              className="glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-foreground/5 hover:scale-[1.02] transition-all duration-300"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold">{hub.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="font-ui text-xs text-muted-foreground">{hub.location}</span>
                    </div>
                  </div>
                  <span className={`${statusBadge[hub.status]} px-3 py-1 rounded-full font-ui text-xs font-semibold capitalize`}>
                    {t(hub.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3">
                    <Truck className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="font-display text-2xl font-bold">{hub.queue}</p>
                    <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("inQueue")}</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="font-display text-2xl font-bold">{hub.wait}</p>
                    <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t("estWait")}</p>
                  </div>
                </div>
              </div>

              <div className="h-1.5 bg-muted mx-5 mb-5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${statusColor[hub.status]} rounded-full transition-all duration-500`}
                  style={{ width: `${hub.capacity}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NearbyHubs;
