import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Card } from "@/lib/api";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Card & { similarity?: number })[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-cards", {
        body: { action: "search", query },
      });

      if (error) throw error;
      setResults(data?.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Search</h1>

      <form onSubmit={handleSearch} className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for in natural language..."
          className="pl-12 h-12 text-base rounded-xl"
        />
      </form>

      {searching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      )}

      {!searching && searched && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">{results.length} results for "{query}"</p>
          {results.map((card) => (
            <div key={card.id} className="aisom-card cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={card.type as any}>{card.type.toUpperCase()}</Badge>
                <span className="text-[11px] text-muted-foreground">{timeAgo(card.updated_at)}</span>
                {card.similarity && (
                  <span className="text-[10px] text-muted-foreground ml-auto">{(card.similarity * 100).toFixed(0)}% match</span>
                )}
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
              {card.content && typeof card.content === "object" && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {Object.values(card.content).filter((v) => typeof v === "string").slice(0, 2).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!searching && searched && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">No results found for "{query}"</p>
          <p className="text-muted-foreground text-xs mt-2">Try different keywords or create cards to build your knowledge base</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">Type a query and press Enter to search your knowledge base</p>
          <p className="text-muted-foreground text-xs mt-2">Try: "How did I fix that CORS issue?" or "What ORM did I evaluate?"</p>
        </div>
      )}
    </div>
  );
}
