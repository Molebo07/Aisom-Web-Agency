import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Bug, GitBranch, BookOpen, Package, GraduationCap, MessageSquare, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const allCards = [
  { id: "1", type: "bug" as const, title: "React hydration mismatch on SSR", language: "TypeScript", date: "2h ago", tags: ["react", "ssr"] },
  { id: "2", type: "adr" as const, title: "Chose PostgreSQL over MongoDB for user data", language: "SQL", date: "1d ago", tags: ["database"] },
  { id: "3", type: "concept" as const, title: "Event sourcing vs CRUD", language: null, date: "2d ago", tags: ["architecture"] },
  { id: "4", type: "library" as const, title: "Zod — runtime type validation", language: "TypeScript", date: "3d ago", tags: ["validation"] },
  { id: "5", type: "bug" as const, title: "CORS error with Supabase edge functions", language: "TypeScript", date: "4d ago", tags: ["supabase", "cors"] },
  { id: "6", type: "concept" as const, title: "Optimistic updates in React Query", language: "TypeScript", date: "5d ago", tags: ["react-query"] },
  { id: "7", type: "learning" as const, title: "TCP/IP fundamentals — three-way handshake", language: null, date: "1w ago", tags: ["networking"] },
  { id: "8", type: "interview" as const, title: "Explain virtual DOM reconciliation", language: "JavaScript", date: "1w ago", tags: ["react", "interview"] },
  { id: "9", type: "bug" as const, title: "Next.js middleware redirect loop", language: "TypeScript", date: "2w ago", tags: ["nextjs", "auth"] },
  { id: "10", type: "adr" as const, title: "Monorepo with Turborepo vs Nx", language: null, date: "2w ago", tags: ["tooling", "monorepo"] },
  { id: "11", type: "library" as const, title: "Drizzle ORM — type-safe SQL", language: "TypeScript", date: "3w ago", tags: ["orm", "database"] },
  { id: "12", type: "concept" as const, title: "CAP theorem in distributed systems", language: null, date: "3w ago", tags: ["distributed", "theory"] },
];

const typeOptions = ["all", "bug", "adr", "concept", "library", "learning", "interview"];

export default function Cards() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = allCards.filter((card) => {
    const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || card.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cards</h1>
        <Button asChild>
          <Link to="/app/cards/new">
            <Plus className="mr-2 h-4 w-4" />
            New Card
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((card) => (
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
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-2">No cards match your filters</p>
          <Button variant="outline" size="sm" onClick={() => { setSearch(""); setTypeFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
