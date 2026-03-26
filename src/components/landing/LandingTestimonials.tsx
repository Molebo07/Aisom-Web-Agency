import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "CTO",
    company: "Horizon Retail",
    initials: "PS",
    stars: 5,
    quote: "Aisom gave our engineering teams one searchable source of truth across London, Nairobi, and Johannesburg. Onboarding new developers went from weeks to days.",
  },
  {
    name: "Thabo Mokoena",
    role: "Head of Platform",
    company: "Ubuntu Capital",
    initials: "TM",
    stars: 5,
    quote: "Our developers finally document architecture decisions in a way that scales. We stopped losing institutional knowledge every time someone changed teams.",
  },
  {
    name: "Michael Turner",
    role: "VP Engineering",
    company: "Northstar Logistics",
    initials: "MT",
    stars: 5,
    quote: "It reduced handover friction between our UK and South African offices almost immediately. The spaced repetition keeps critical API patterns top of mind.",
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
            Trusted by engineers who ship
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-pretty">
            Developers at global companies use Aisom to turn their debugging history into a searchable superpower.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-[10px] border border-border bg-background p-6 flex flex-col">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-foreground leading-relaxed flex-1 mb-6">"{t.quote}"</p>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
