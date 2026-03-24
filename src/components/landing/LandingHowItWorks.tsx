import { Zap, Search, Brain } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Capture in <30s",
    desc: "Quick-capture adapts to clipboard content. Paste a stack trace, get a Bug Card form. No friction, no formatting.",
  },
  {
    icon: Search,
    title: "Find before Google",
    desc: "Semantic search across your entire knowledge base. Your past solutions, ranked by relevance — not recency.",
  },
  {
    icon: Brain,
    title: "Remember with spaced repetition",
    desc: "SM-2 algorithm surfaces cards for review at the optimal interval. Technical concepts stick. Interviews become easy.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
            Three steps. Zero wasted time.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-pretty">
            Capture knowledge as you work, find it before you reach Stack Overflow, and retain it with science-backed review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground mb-2">STEP {i + 1}</div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
