import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Bug, GitBranch, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCards, fetchCardsDueForReview, type Card } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDetailSheet } from "@/components/cards/CardDetailSheet";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const { data: reviewCards = [], isLoading: reviewLoading } = useQuery({
    queryKey: ["cards-review"],
    queryFn: fetchCardsDueForReview,
  });

  const { data: recentCards = [], isLoading: recentLoading } = useQuery({
    queryKey: ["cards-recent"],
    queryFn: () => fetchCards(),
  });

  const totalCards = recentCards.length;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{greeting}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviewCards.length} cards due for review · {totalCards} cards total
          </p>
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
        {reviewLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : reviewCards.length === 0 ? (
          <div className="aisom-card text-center py-8">
            <p className="text-muted-foreground text-sm">No cards due for review. Create some cards to get started!</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/app/cards/new">Create your first card</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviewCards.map((card) => (
              <div key={card.id} className="aisom-card cursor-pointer group" onClick={() => setSelectedCardId(card.id)}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={card.type as any}>{card.type.toUpperCase()}</Badge>
                  <span className="text-[11px] text-muted-foreground">Interval: {card.review_interval}d</span>
                </div>
                <h3 className="font-medium text-foreground text-sm leading-snug mb-2">{card.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Ease: {(card.review_ease ?? 2.5).toFixed(1)}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground">
                    Review <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        {recentLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : recentCards.length === 0 ? (
          <div className="aisom-card text-center py-8">
            <p className="text-muted-foreground text-sm">No cards yet. Start capturing your knowledge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCards.slice(0, 6).map((card) => (
              <div key={card.id} className="aisom-card cursor-pointer group" onClick={() => setSelectedCardId(card.id)}>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={card.type as any}>{card.type.toUpperCase()}</Badge>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(card.updated_at)}</span>
                </div>
                <h3 className="font-medium text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {card.language && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{card.language}</span>
                  )}
                  {card.tags?.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Quick Capture */}
      <Link
        to="/app/cards/new"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all duration-200 z-50"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {/* Card Detail Sheet */}
      <CardDetailSheet
        cardId={selectedCardId}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={() => {}}
        onCardDeleted={() => setSelectedCardId(null)}
      />
    </div>
  );
}
