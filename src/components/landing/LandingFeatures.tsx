import { Bug, GitBranch, BookOpen, Package, GraduationCap, MessageSquare, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";

const cardTypes = [
  {
    icon: Bug,
    title: "Bug Cards",
    badge: "bug" as const,
    description: "Capture the symptom, stack trace, root cause, and the exact fix. Never debug the same issue twice.",
    fields: ["Symptom", "Stack Trace", "Root Cause", "Fix", "Key Insight"],
  },
  {
    icon: GitBranch,
    title: "ADR Cards",
    badge: "adr" as const,
    description: "Architecture Decision Records. Document what you decided, why, and what happened next.",
    fields: ["Context", "Options", "Decision", "Rationale", "Outcome"],
  },
  {
    icon: BookOpen,
    title: "Concept Cards",
    badge: "concept" as const,
    description: "Define concepts in your own words with code examples and spaced repetition review.",
    fields: ["Definition", "Code Example", "Analogy", "When to Use"],
  },
  {
    icon: Package,
    title: "Library Cards",
    badge: "library" as const,
    description: "Track libraries you've evaluated — gotchas, working configs, and your verdict.",
    fields: ["Why Chosen", "Gotchas", "Config That Works", "Verdict"],
  },
  {
    icon: GraduationCap,
    title: "Learning Cards",
    badge: "learning" as const,
    description: "Structured learning notes linked to your codebase, not loose text files.",
    fields: ["Topic", "Key Takeaways", "Code Examples", "Resources"],
  },
  {
    icon: MessageSquare,
    title: "Interview Cards",
    badge: "interview" as const,
    description: "Prepare and review technical interview topics with structured question-answer pairs.",
    fields: ["Question", "Answer", "Follow-ups", "Difficulty"],
  },
];

function FeatureCard({ item, index }: { item: typeof cardTypes[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${index * 80}ms`;
          el.classList.add("animate-fade-up");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div ref={ref} className="opacity-0 aisom-card group">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
          <item.icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <Badge variant={item.badge} className="text-[10px] px-2 py-0">{item.badge.toUpperCase()}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{item.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.fields.map((f) => (
              <span key={f} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
            Six card types. Zero guesswork.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-pretty">
            Each card type has a specific schema designed around how developers actually capture and retrieve knowledge.
          </p>
        </div>

        <div id="cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {cardTypes.map((item, i) => (
            <FeatureCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
