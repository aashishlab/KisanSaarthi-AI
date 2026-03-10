import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const items = [
  { type: "hub", name: "Satara Sugar Co-op", location: "Satara, MH", queue: 6, wait: "1 hr" },
  { type: "hub", name: "Ahmednagar APMC", location: "Ahmednagar, MH", queue: 3, wait: "30 min" },
  { type: "story", name: "Rajesh Patil", quote: "Saved 4 hours of waiting by booking a slot through KisanSaarthi. Game changer for us small farmers." },
  { type: "hub", name: "Baramati Cold Chain", location: "Baramati, MH", queue: 9, wait: "1.5 hrs" },
  { type: "story", name: "Sunita Deshmukh", quote: "I used to lose an entire day waiting at the sugar mill. Now I plan my delivery and am back on the farm by noon." },
  { type: "hub", name: "Latur Grain Hub", location: "Latur, MH", queue: 2, wait: "20 min" },
];

const FeaturedCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
    }
  };

  return (
    <section className="relative">
      <div className="container py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Featured
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold">Hubs & Stories</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="glass p-3 rounded-xl hover:bg-muted transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="glass p-3 rounded-xl hover:bg-muted transition-all duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="snap-start flex-shrink-0 w-80 glass rounded-2xl hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300"
            >
              {item.type === "hub" ? (
                <div className="p-6">
                  <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1 font-ui text-[10px] font-semibold uppercase tracking-widest mb-4">
                    Featured Hub
                  </span>
                  <h3 className="font-display text-xl font-bold">{item.name}</h3>
                  <p className="font-ui text-xs text-muted-foreground mt-1">{item.location}</p>
                  <div className="flex gap-6 mt-5">
                    <div>
                      <p className="font-display text-3xl font-bold">{item.queue}</p>
                      <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase">Queue</p>
                    </div>
                    <div>
                      <p className="font-display text-3xl font-bold">{item.wait}</p>
                      <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase">Wait</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="p-2 bg-primary/10 rounded-xl w-fit mb-4">
                    <Quote className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground leading-relaxed">{item.quote}</p>
                  <p className="font-display text-sm font-bold mt-4">— {item.name}</p>
                  <p className="font-ui text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Farmer Story</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
