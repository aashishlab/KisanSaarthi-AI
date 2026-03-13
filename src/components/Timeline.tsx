import { useEffect, useRef, useState } from "react";
import { Rocket, Zap, Globe, Shield, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

const getMilestones = (t: TFunction) => [
  {
    date: "Step 1",
    title: t("step1Title"),
    description: t("step1Desc"),
    icon: Rocket,
  },
  {
    date: "Step 2",
    title: t("step2Title"),
    description: t("step2Desc"),
    icon: Brain,
  },
  {
    date: "Step 3",
    title: t("step3Title"),
    description: t("step3Desc"),
    icon: Globe,
  },
  {
    date: "Step 4",
    title: t("step4Title"),
    description: t("step4Desc"),
    icon: Zap,
  },
  {
    date: "Step 5",
    title: t("step5Title"),
    description: t("step5Desc"),
    icon: Shield,
  },
];

const Timeline = () => {
  const { t } = useTranslation();
  const milestones = getMilestones(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let closestIndex = activeIndex;
        let closestRatio = 0;
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-index"));
          if (entry.intersectionRatio > closestRatio) {
            closestRatio = entry.intersectionRatio;
            closestIndex = idx;
          }
        });
        if (closestRatio > 0.3) setActiveIndex(closestIndex);
      },
      { threshold: [0.3, 0.5, 0.7, 1.0], rootMargin: "-30% 0px -30% 0px" }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <section className="relative bg-dotted">
      <div className="container py-24">
        <div className="text-center mb-16">
          <span className="inline-block glass rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            {t("roadmap")}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">{t("ourJourney")}</h2>
          <p className="font-ui text-muted-foreground mt-3 max-w-lg mx-auto">
            {t("roadmapDescription")}
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 md:-translate-x-px" />

          <div className="space-y-8">
            {milestones.map((item, i) => {
              const isActive = i === activeIndex;
              const Icon = item.icon;
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={i}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  data-index={i}
                  className={`relative flex items-start md:items-center transition-all duration-500 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                >
                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${isActive
                          ? "bg-primary border-primary scale-125 shadow-lg shadow-primary/30"
                          : "bg-background border-muted-foreground/30"
                        }`}
                    />
                  </div>

                  {/* Content */}
                  <div className={`ml-20 md:ml-0 md:w-1/2 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div
                      className={`glass rounded-2xl p-6 transition-all duration-500 ${isActive
                          ? "shadow-xl shadow-primary/10 scale-[1.02] border-primary/30"
                          : "opacity-60 scale-95"
                        }`}
                    >
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? "md:justify-end" : ""}`}>
                        <div className={`p-2 rounded-xl ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                          <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <span className="font-ui text-xs font-semibold uppercase tracking-wider text-primary">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-bold">{item.title}</h3>
                      <p
                        className={`font-ui text-sm text-muted-foreground mt-2 leading-relaxed transition-all duration-500 ${isActive ? "max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                          }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
