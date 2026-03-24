export function SocialProofStrip() {
  const stats = [
    { value: "27M+", label: "software engineers worldwide" },
    { value: "61%", label: "lose 30+ min/day re-searching" },
    { value: "$9/mo", label: "to never re-debug the same bug" },
  ];

  const cardTypes = [
    "Bug Cards", "Architecture Decision Records", "Concept Cards",
    "Library Cards", "Learning Cards", "Interview Cards", "Project Cards",
    "Bug Cards", "Architecture Decision Records", "Concept Cards",
    "Library Cards", "Learning Cards", "Interview Cards", "Project Cards",
  ];

  return (
    <section className="bg-primary py-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground">{s.value}</p>
              <p className="text-sm text-primary-foreground/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {cardTypes.map((name, i) => (
            <span key={i} className="mx-4 text-sm text-primary-foreground/30 font-medium">
              {name}
              <span className="ml-4">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
