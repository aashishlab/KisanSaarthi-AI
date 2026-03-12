import { Factory, Milk, Apple, Store, Grape } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchCategoryCounts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { name: "Sugar Mill", icon: Factory, displayName: "Sugar Mills" },
  { name: "Dairy Plant", icon: Milk, displayName: "Dairy Plants" },
  { name: "Food Processing", icon: Apple, displayName: "Food Processing" },
  { name: "APMC Market", icon: Store, displayName: "APMC Markets" },
  { name: "Fruits & Vegetables", icon: Grape, displayName: "Fruits & Vegetables" },
];

const IndustryCategories = () => {
  const navigate = useNavigate();
  const { data: counts } = useQuery({
    queryKey: ['category-counts'],
    queryFn: fetchCategoryCounts,
    refetchInterval: 10000,
  });

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
              onClick={() => navigate(`/farmer/category/${encodeURIComponent(cat.name)}`)}
              className="group glass rounded-2xl p-6 text-left hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all duration-300"
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                <cat.icon className="h-7 w-7 text-primary" />
              </div>
              <p className="font-display text-lg font-bold">{cat.displayName}</p>
              <p className="font-display text-3xl font-bold mt-2 text-primary">
                {counts?.[cat.name] || 0}
              </p>
              <p className="font-ui text-xs text-muted-foreground font-medium mt-1">Active Hubs</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryCategories;
