import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCards } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDetailSheet } from "@/components/cards/CardDetailSheet";
import { useWorkspace } from "@/hooks/useWorkspace";

const typeOptions = ["all", "bug", "adr", "concept", "library", "learning", "interview"];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export default function Cards() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { activeWorkspaceId } = useWorkspace();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["cards", typeFilter, search, activeWorkspaceId],
    queryFn: () => fetchCards({ type: typeFilter, search, workspaceId: activeWorkspaceId }),
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

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter cards..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t === "all" ? "All types" : t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-2">{search || typeFilter !== "all" ? "No cards match your filters" : "No cards yet"}</p>
          {(search || typeFilter !== "all") ? (
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setTypeFilter("all"); }}>Clear filters</Button>
          ) : (
            <Button size="sm" asChild><Link to="/app/cards/new">Create your first card</Link></Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="aisom-card cursor-pointer group" onClick={() => setSelectedCardId(card.id)}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={card.type}>{card.type.toUpperCase()}</Badge>
                <span className="text-[11px] text-muted-foreground">{timeAgo(card.updated_at)}</span>
              </div>
              <h3 className="font-medium text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {card.language && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{card.language}</span>}
                {card.tags?.map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">#{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      <CardDetailSheet
        cardId={selectedCardId}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={() => {}}
        onCardDeleted={() => setSelectedCardId(null)}
      />
    </div>
  );
}
