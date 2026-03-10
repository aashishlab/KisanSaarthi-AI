import { Factory, Milk, Apple, Store, Grape } from "lucide-react";

const categories = [
  { name: "Sugar Mills", icon: Factory, count: 24 },
  { name: "Dairy Plants", icon: Milk, count: 18 },
  { name: "Food Processing", icon: Apple, count: 31 },
  { name: "APMC Markets", icon: Store, count: 42 },
  { name: "Fruits & Vegetables", icon: Grape, count: 15 },
];

const IndustryCategories = () => {
  return (
    <section className="relative bg-dotted">
      <div className="container py-20">
        <div className="text-center mb-12">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Industries
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Hub Categories</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="group glass rounded-2xl p-6 text-left hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all duration-300"
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                <cat.icon className="h-7 w-7 text-primary" />
              </div>
              <p className="font-display text-lg font-bold">{cat.name}</p>
              <p className="font-display text-3xl font-bold mt-2 text-primary">{cat.count}</p>
              <p className="font-ui text-xs text-muted-foreground font-medium mt-1">Active Hubs</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryCategories;
