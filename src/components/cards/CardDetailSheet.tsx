import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase as supabaseClient } from "@/integrations/supabase/client";
import type { Card } from "@/lib/api";
import type { Json } from "@/integrations/supabase/types";
// Cast around incomplete generated types; runtime behavior is unchanged.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseClient as any;
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Pencil, Copy, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface CardDetailSheetProps {
  cardId: string | null;
  onClose: () => void;
  onCardUpdated?: (card: Card) => void;
  onCardDeleted?: (cardId: string) => void;
}

const typeBadgeStyles: Record<string, string> = {
  bug: "bg-destructive/10 text-destructive",
  adr: "bg-aisom-success/10 text-aisom-success",
  concept: "bg-blue-50 text-blue-700",
  library: "bg-aisom-warning/10 text-aisom-warning",
  learning: "bg-purple-50 text-purple-700",
  interview: "bg-secondary text-muted-foreground",
  project: "bg-teal-50 text-teal-700",
};

const typeLabels: Record<string, string> = {
  bug: "Bug Card", adr: "ADR", concept: "Concept", library: "Library",
  learning: "Learning", interview: "Interview", project: "Project",
};

const typeFields: Record<string, { key: string; label: string; isCode: boolean }[]> = {
  bug: [
    { key: "symptom", label: "SYMPTOM", isCode: false },
    { key: "environment", label: "ENVIRONMENT", isCode: false },
    { key: "stack_trace", label: "STACK TRACE", isCode: true },
    { key: "root_cause", label: "ROOT CAUSE", isCode: false },
    { key: "fix", label: "FIX", isCode: true },
    { key: "key_insight", label: "KEY INSIGHT", isCode: false },
    { key: "time_to_fix", label: "TIME TO FIX (MIN)", isCode: false },
    { key: "related_issues", label: "RELATED ISSUES", isCode: false },
  ],
  adr: [
    { key: "context", label: "CONTEXT", isCode: false },
    { key: "decision", label: "DECISION", isCode: false },
    { key: "rationale", label: "RATIONALE", isCode: false },
    { key: "consequences", label: "CONSEQUENCES", isCode: false },
    { key: "status", label: "STATUS", isCode: false },
    { key: "outcome", label: "OUTCOME", isCode: false },
  ],
  concept: [
    { key: "definition", label: "DEFINITION", isCode: false },
    { key: "code_example", label: "CODE EXAMPLE", isCode: true },
    { key: "analogy", label: "ANALOGY", isCode: false },
    { key: "when_to_use", label: "WHEN TO USE", isCode: false },
    { key: "when_not_to", label: "WHEN NOT TO USE", isCode: false },
    { key: "related_concepts", label: "RELATED CONCEPTS", isCode: false },
  ],
  library: [
    { key: "why_chosen", label: "WHY CHOSEN", isCode: false },
    { key: "gotchas", label: "GOTCHAS", isCode: false },
    { key: "config_that_works", label: "CONFIG THAT WORKS", isCode: true },
    { key: "alternatives_considered", label: "ALTERNATIVES", isCode: false },
    { key: "verdict", label: "VERDICT", isCode: false },
    { key: "version", label: "VERSION", isCode: false },
  ],
  learning: [
    { key: "topic", label: "TOPIC", isCode: false },
    { key: "key_takeaways", label: "KEY TAKEAWAYS", isCode: false },
    { key: "code_examples", label: "CODE EXAMPLES", isCode: true },
    { key: "resources", label: "RESOURCES", isCode: false },
  ],
  interview: [
    { key: "question", label: "QUESTION", isCode: false },
    { key: "answer", label: "ANSWER", isCode: false },
    { key: "followups", label: "FOLLOW-UPS", isCode: false },
  ],
  project: [
    { key: "description", label: "DESCRIPTION", isCode: false },
    { key: "repo_url", label: "REPOSITORY URL", isCode: false },
  ],
};

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function CardDetailSheet({ cardId, onClose, onCardUpdated, onCardDeleted }: CardDetailSheetProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState<Record<string, any>>({});
  const [editTags, setEditTags] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const draftTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const { data: card, isLoading, error: fetchError } = useQuery({
    queryKey: ["card-detail", cardId],
    queryFn: async () => {
      if (!cardId) return null;
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cardId)
        .single();
      if (error) throw error;
      return data as Card;
    },
    enabled: !!cardId,
  });

  // Handle card not found
  useEffect(() => {
    if (fetchError) {
      toast.error("Card not found");
      onClose();
    }
  }, [fetchError, onClose]);

  // Reset editing state when card changes
  useEffect(() => {
    setIsEditing(false);
    setDraftSaved(false);
  }, [cardId]);

  // Populate edit fields when entering edit mode
  useEffect(() => {
    if (isEditing && card) {
      setEditTitle(card.title);
      setEditContent(card.content);
      setEditTags((card.tags || []).join(", "));
      setEditLanguage(card.language || "");
    }
  }, [isEditing, card]);

  // Auto-save draft every 30s while editing
  useEffect(() => {
    if (isEditing && cardId) {
      draftTimerRef.current = setInterval(() => {
        localStorage.setItem(
          `aisom:draft:${cardId}`,
          JSON.stringify({ title: editTitle, content: editContent, tags: editTags, language: editLanguage })
        );
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }, 30000);
    }
    return () => {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
    };
  }, [isEditing, cardId, editTitle, editContent, editTags, editLanguage]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!cardId) throw new Error("No card");
      const parsedTags = editTags.split(",").map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")).filter(Boolean);
      const { data, error } = await supabase
        .from("cards")
        .update({
          title: editTitle.trim(),
          content: editContent as Json,
          tags: parsedTags,
          language: editLanguage || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardId)
        .select()
        .single();
      if (error) throw error;
      return data as Card;
    },
    onSuccess: (data) => {
      setIsEditing(false);
      if (cardId) localStorage.removeItem(`aisom:draft:${cardId}`);
      queryClient.invalidateQueries({ queryKey: ["card-detail", cardId] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards-recent"] });
      onCardUpdated?.(data);
      toast.success("Changes saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      if (!card) throw new Error("No card");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("cards")
        .insert({
          user_id: user.id,
          type: card.type,
          title: `Copy of ${card.title}`,
          content: card.content,
          tags: card.tags,
          language: card.language,
          project_id: card.project_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards-recent"] });
      toast.success("Card duplicated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!cardId) throw new Error("No card");
      const { error } = await supabase.from("cards").delete().eq("id", cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards-recent"] });
      queryClient.invalidateQueries({ queryKey: ["cards-review"] });
      onCardDeleted?.(cardId!);
      onClose();
      toast.success("Card deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleDiscard = () => {
    setIsEditing(false);
    setDraftSaved(false);
  };

  const fields = card ? (typeFields[card.type] || []) : [];
  const content = card?.content as Record<string, unknown> || {};

  return (
    <Sheet open={!!cardId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[640px] sm:max-w-[640px] p-0 flex flex-col">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : card ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <Badge className={`${typeBadgeStyles[card.type] || ""} border-0 text-[11px]`}>
                {typeLabels[card.type] || card.type}
              </Badge>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isEditing ? "Cancel" : "Edit card"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => duplicateMutation.mutate()}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate card</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Delete card</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this card?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This card and all its content will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete card
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <SheetHeader className="sr-only">
              <SheetTitle>{card.title}</SheetTitle>
              <SheetDescription>Card details</SheetDescription>
            </SheetHeader>

            {/* Body */}
            <ScrollArea className="flex-1 px-6">
              {isEditing ? (
                /* EDIT MODE */
                <div className="space-y-4 pb-6">
                  <div>
                    <Label htmlFor="edit-title" className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Title</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-1 text-lg font-medium"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Language</Label>
                      <Input
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        placeholder="e.g. TypeScript"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">Tags</Label>
                      <Input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="comma, separated"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Separator />
                  {fields.map((field) => (
                    <div key={field.key}>
                      <Label className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{field.label}</Label>
                      {field.isCode ? (
                        <Textarea
                          value={editContent[field.key] || ""}
                          onChange={(e) => setEditContent((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="mt-1 font-mono text-[13px] min-h-[120px] resize-y bg-primary text-primary-foreground placeholder:text-primary-foreground/40 border-primary rounded-md p-3 focus:ring-1 focus:ring-ring"
                        />
                      ) : (
                        <Textarea
                          value={
                            Array.isArray(editContent[field.key])
                              ? (editContent[field.key] as string[]).join(", ")
                              : (editContent[field.key] || "")
                          }
                          onChange={(e) => setEditContent((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="mt-1 min-h-[80px] resize-y"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* VIEW MODE */
                <div className="pb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">{card.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>Created {timeAgo(card.created_at)}</span>
                    <span>Updated {timeAgo(card.updated_at)}</span>
                    {card.language && (
                      <span className="font-mono px-1.5 py-0.5 rounded bg-secondary">{card.language}</span>
                    )}
                  </div>
                  {card.tags && card.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[11px] rounded-full">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Separator className="mb-4" />
                  <div className="space-y-5">
                    {fields.map((field) => {
                      const value = content[field.key];
                      if (!value && value !== 0) return null;
                      const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
                      return (
                        <div key={field.key}>
                          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground mb-1.5">
                            {field.label}
                          </p>
                          {field.isCode ? (
                            <CodeBlock code={displayValue} language={card.language || "typescript"} />
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(0 0% 27%)" }}>
                              {displayValue}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {isEditing && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleDiscard}>Discard changes</Button>
                  {draftSaved && <span className="text-xs text-muted-foreground">Draft saved</span>}
                </div>
                <Button
                  className="bg-primary"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
