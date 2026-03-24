import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Backend Engineer",
    company: "Shopify",
    initials: "SC",
    stars: 5,
    quote: "I used to lose an hour a week re-debugging the same API timeout issues. After two months with Aisom, my Bug Cards have saved me more time than any other tool in my stack.",
  },
  {
    name: "James Okonkwo",
    role: "Staff Engineer",
    company: "Stripe",
    initials: "JO",
    stars: 5,
    quote: "The ADR cards changed how our team makes architecture decisions. We stopped repeating debates we'd already resolved. The search is genuinely better than grep-ing through Confluence.",
  },
  {
    name: "Priya Sharma",
    role: "Full-Stack Developer",
    company: "Vercel",
    initials: "PS",
    stars: 5,
    quote: "Spaced repetition for technical concepts is a game-changer for interview prep. I went from forgetting algorithms to confidently explaining them. The daily brief takes 5 minutes.",
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
            Developers at top companies use Aisom to turn their debugging history into a searchable superpower.
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
