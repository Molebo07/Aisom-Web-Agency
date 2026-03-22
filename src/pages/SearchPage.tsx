import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";

const mockResults = [
  { id: "1", type: "bug" as const, title: "React hydration mismatch on SSR", excerpt: "Root cause: useLayoutEffect running during SSR causing DOM mismatch...", date: "2h ago" },
  { id: "5", type: "bug" as const, title: "CORS error with Supabase edge functions", excerpt: "Missing Access-Control-Allow-Headers for authorization header...", date: "4d ago" },
  { id: "6", type: "concept" as const, title: "Optimistic updates in React Query", excerpt: "Use onMutate to snapshot, update cache optimistically, rollback onError...", date: "5d ago" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Search</h1>
      
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for in natural language..."
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {query.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">{mockResults.length} results for "{query}"</p>
          {mockResults.map((result) => (
            <div key={result.id} className="aisom-card cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.type}>{result.type.toUpperCase()}</Badge>
                <span className="text-[11px] text-muted-foreground">{result.date}</span>
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{result.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.excerpt}</p>
            </div>
          ))}
        </div>
      )}

      {query.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Type a query to search your knowledge base semantically</p>
          <p className="text-muted-foreground text-xs mt-2">Try: "How did I fix that CORS issue?" or "What ORM did I evaluate?"</p>
        </div>
      )}
    </div>
  );
}
