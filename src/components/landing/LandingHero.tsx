import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Command } from "lucide-react";
import { useEffect, useRef } from "react";

export function LandingHero() {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      <div ref={ref} className="container mx-auto px-6 relative opacity-0" style={{ animationDelay: "0.1s" }}>
        <div className="max-w-3xl mx-auto text-center">
          {/* Kbd hint */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <Command className="h-3.5 w-3.5" />
            <span>Keyboard-first. Built for how developers think.</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.08] text-balance mb-6">
            Your second brain,<br />built for code
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 text-pretty leading-relaxed">
            Capture bugs, decisions, and concepts in structured cards. Retrieve them before you reach Stack Overflow. Never re-solve the same problem twice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" asChild>
              <Link to="/app/dashboard">
                Start capturing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="hero-outline" asChild>
              <Link to="/app/dashboard">See it in action</Link>
            </Button>
          </div>

          {/* Stat line */}
          <p className="mt-12 text-sm text-muted-foreground">
            Developers spend <span className="font-semibold text-foreground">31 minutes/day</span> re-finding answers they already found. Aisom fixes that.
          </p>
        </div>

        {/* Code preview mock */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="aisom-code-block rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <div className="h-3 w-3 rounded-full bg-green-400/60" />
              <span className="ml-2 text-xs text-white/40 font-mono">bug-card.ts</span>
            </div>
            <div className="p-6 text-sm leading-7">
              <div><span className="text-blue-400">symptom</span><span className="text-white/50">:</span> <span className="text-amber-300">"TypeError: Cannot read property 'map' of undefined"</span></div>
              <div><span className="text-blue-400">root_cause</span><span className="text-white/50">:</span> <span className="text-amber-300">"API returns null when no results, not empty array"</span></div>
              <div><span className="text-blue-400">fix</span><span className="text-white/50">:</span> <span className="text-amber-300">"Added nullish coalescing: data?.results ?? []"</span></div>
              <div><span className="text-blue-400">key_insight</span><span className="text-white/50">:</span> <span className="text-amber-300">"Always default API responses to their empty type"</span></div>
              <div><span className="text-blue-400">time_to_fix</span><span className="text-white/50">:</span> <span className="text-emerald-400">12</span> <span className="text-white/30">// minutes — never again</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
