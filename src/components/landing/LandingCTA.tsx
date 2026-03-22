import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Zap, Brain } from "lucide-react";
import { useEffect, useRef } from "react";

export function LandingCTA() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("animate-fade-up");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="cta" className="py-24 md:py-32 bg-secondary/50">
      <div ref={ref} className="container mx-auto px-6 opacity-0">
        <div className="max-w-3xl mx-auto">
          {/* Value props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: Zap, title: "Capture in <30s", desc: "Quick-capture adapts to clipboard content. Paste a stack trace, get a Bug Card form." },
              { icon: Search, title: "Find before Google", desc: "Semantic search across your entire knowledge base. Your past solutions, ranked by relevance." },
              { icon: Brain, title: "Spaced repetition", desc: "SM-2 algorithm surfaces cards for review at the optimal interval. Concepts stick." },
            ].map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA block */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
              Stop re-solving solved problems
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join developers who have turned their debugging history into a searchable superpower.
            </p>
            <Button variant="hero" asChild>
              <Link to="/app/dashboard">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
