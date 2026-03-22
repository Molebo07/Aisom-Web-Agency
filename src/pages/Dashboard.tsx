import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Bug, GitBranch, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demo
const recentCards = [
  { id: "1", type: "bug" as const, title: "React hydration mismatch on SSR", language: "TypeScript", date: "2h ago", tags: ["react", "ssr"] },
  { id: "2", type: "adr" as const, title: "Chose PostgreSQL over MongoDB for user data", language: "SQL", date: "1d ago", tags: ["database"] },
  { id: "3", type: "concept" as const, title: "Event sourcing vs CRUD", language: null, date: "2d ago", tags: ["architecture"] },
  { id: "4", type: "library" as const, title: "Zod — runtime type validation", language: "TypeScript", date: "3d ago", tags: ["validation"] },
  { id: "5", type: "bug" as const, title: "CORS error with Supabase edge functions", language: "TypeScript", date: "4d ago", tags: ["supabase", "cors"] },
  { id: "6", type: "concept" as const, title: "Optimistic updates in React Query", language: "TypeScript", date: "5d ago", tags: ["react-query"] },
];

const reviewCards = [
  { id: "r1", type: "concept" as const, title: "Closure vs Scope", ease: 2.1, interval: 3 },
  { id: "r2", type: "bug" as const, title: "Memory leak with useEffect cleanup", ease: 2.5, interval: 7 },
  { id: "r3", type: "library" as const, title: "Prisma — gotchas with relations", ease: 1.8, interval: 1 },
];

const typeIcons: Record<string, React.ElementType> = {
  bug: Bug,
  adr: GitBranch,
  concept: BookOpen,
  library: Package,
};

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Good morning</h1>
          <p className="text-sm text-muted-foreground mt-1">3 cards due for review · 47 cards total</p>
        </div>
        <Button asChild>
          <Link to="/app/cards/new">
            <Plus className="mr-2 h-4 w-4" />
            New Card
          </Link>
        </Button>
      </div>

      {/* Daily Brief */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Daily Brief</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviewCards.map((card) => {
            const Icon = typeIcons[card.type] || BookOpen;
            return (
              <div key={card.id} className="aisom-card cursor-pointer group">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={card.type}>{card.type.toUpperCase()}</Badge>
                  <span className="text-[11px] text-muted-foreground">Interval: {card.interval}d</span>
                </div>
                <h3 className="font-medium text-foreground text-sm leading-snug mb-2">{card.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Ease: {card.ease.toFixed(1)}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    Review <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Cards</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/cards" className="text-xs text-muted-foreground">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCards.map((card) => {
            const Icon = typeIcons[card.type] || BookOpen;
            return (
              <div key={card.id} className="aisom-card cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={card.type}>{card.type.toUpperCase()}</Badge>
                  <span className="text-[11px] text-muted-foreground">{card.date}</span>
                </div>
                <h3 className="font-medium text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {card.language && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{card.language}</span>
                  )}
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Quick Capture */}
      <Link
        to="/app/cards/new"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-200 z-50"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
