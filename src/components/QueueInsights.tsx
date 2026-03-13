import { Truck, Clock, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const getStats = (t: TFunction) => [
  { label: t("totalVehiclesWaiting"), value: "1,247", icon: Truck, delta: "+12%" },
  { label: t("averageWaitTime"), value: "3.2 hrs", icon: Clock, delta: "-8%" },
  { label: t("activeHubs"), value: "130", icon: Radio, delta: "+3" },
];

const QueueInsights = () => {
  const { t } = useTranslation();
  const stats = getStats(t);
  return (
    <section className="relative">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {t("analytics")}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">{t("smartQueueInsights")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="font-display text-5xl font-bold tracking-tight">{stat.value}</p>
              <p className="font-ui text-sm font-medium text-muted-foreground mt-2">{stat.label}</p>
              <div className="mt-4 inline-block bg-accent rounded-full px-3 py-1">
                <span className="font-display text-sm font-bold text-primary">{stat.delta}</span>
                <span className="font-ui text-[10px] font-medium text-muted-foreground ml-1">{t("vsLastWeek")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="mt-4 glass rounded-2xl p-6">
          <p className="font-ui text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{t("hourlyQueueVolume")}</p>
          <div className="flex items-end gap-1.5 h-32">
            {[20, 35, 45, 60, 80, 95, 85, 70, 55, 40, 30, 25, 50, 65, 90, 100, 88, 72, 58, 42, 28, 18, 12, 8].map(
              (val, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-md transition-all duration-300 ${val > 80 ? "bg-queue-high" : val > 50 ? "bg-queue-medium" : "bg-queue-low"}`}
                  style={{ height: `${val}%` }}
                />
              )
            )}
          </div>
          <div className="flex justify-between mt-3">
            <span className="font-ui text-[10px] text-muted-foreground font-medium">00:00</span>
            <span className="font-ui text-[10px] text-muted-foreground font-medium">12:00</span>
            <span className="font-ui text-[10px] text-muted-foreground font-medium">23:00</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QueueInsights;
