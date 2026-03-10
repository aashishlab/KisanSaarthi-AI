import { CalendarCheck, ListOrdered, Map, ArrowRight } from "lucide-react";

const actions = [
  { label: "Book Arrival Slot", desc: "Reserve your time at any hub", icon: CalendarCheck },
  { label: "Check Queue Status", desc: "Real-time queue data across all hubs", icon: ListOrdered },
  { label: "View All Hubs", desc: "Browse the complete hub directory", icon: Map },
];

const QuickActions = () => {
  return (
    <section className="relative bg-grid">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Actions
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              className="group glass rounded-2xl p-8 text-left hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all duration-300"
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-5 group-hover:bg-primary/20 transition-colors duration-200">
                <action.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold">{action.label}</h3>
              <p className="font-ui text-sm text-muted-foreground mt-2">{action.desc}</p>
              <ArrowRight className="h-5 w-5 mt-6 text-primary group-hover:translate-x-2 transition-transform duration-200" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
