import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bug, GitBranch, BookOpen, Package, GraduationCap, MessageSquare, FolderKanban } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCard, type CardType } from "@/lib/api";
import { toast } from "sonner";

const cardTypes = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "adr", label: "ADR", icon: GitBranch },
  { value: "concept", label: "Concept", icon: BookOpen },
  { value: "library", label: "Library", icon: Package },
  { value: "learning", label: "Learning", icon: GraduationCap },
  { value: "interview", label: "Interview", icon: MessageSquare },
  { value: "project", label: "Project", icon: FolderKanban },
];

const typeFields: Record<string, { key: string; label: string; type: "input" | "textarea" | "code" }[]> = {
  bug: [
    { key: "symptom", label: "Symptom", type: "input" },
    { key: "environment", label: "Environment", type: "input" },
    { key: "stack_trace", label: "Stack Trace", type: "code" },
    { key: "root_cause", label: "Root Cause", type: "textarea" },
    { key: "fix", label: "Fix", type: "code" },
    { key: "key_insight", label: "Key Insight", type: "textarea" },
  ],
  adr: [
    { key: "context", label: "Context", type: "textarea" },
    { key: "decision", label: "Decision", type: "textarea" },
    { key: "rationale", label: "Rationale", type: "textarea" },
    { key: "consequences", label: "Consequences", type: "textarea" },
  ],
  concept: [
    { key: "definition", label: "Definition (your words)", type: "textarea" },
    { key: "code_example", label: "Code Example", type: "code" },
    { key: "analogy", label: "Analogy", type: "textarea" },
    { key: "when_to_use", label: "When to Use", type: "textarea" },
    { key: "when_not_to", label: "When Not To", type: "textarea" },
  ],
  library: [
    { key: "why_chosen", label: "Why Chosen", type: "textarea" },
    { key: "gotchas", label: "Gotchas", type: "textarea" },
    { key: "config_that_works", label: "Config That Works", type: "code" },
    { key: "alternatives_considered", label: "Alternatives Considered", type: "textarea" },
    { key: "version", label: "Version", type: "input" },
  ],
  learning: [
    { key: "topic", label: "Topic", type: "input" },
    { key: "key_takeaways", label: "Key Takeaways", type: "textarea" },
    { key: "code_examples", label: "Code Examples", type: "code" },
    { key: "resources", label: "Resources", type: "textarea" },
  ],
  interview: [
    { key: "question", label: "Question", type: "textarea" },
    { key: "answer", label: "Answer", type: "textarea" },
    { key: "followups", label: "Follow-up Questions", type: "textarea" },
  ],
  project: [
    { key: "description", label: "Description", type: "textarea" },
    { key: "repo_url", label: "Repository URL", type: "input" },
  ],
};

export default function NewCard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const projectId = searchParams.get("projectId") || undefined;
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const fields = selectedType ? typeFields[selectedType] || [] : [];

  const mutation = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards-recent"] });
      queryClient.invalidateQueries({ queryKey: ["cards-review"] });
      toast.success("Card created!");
      navigate("/app/cards");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const content: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (fieldValues[f.key]) content[f.key] = fieldValues[f.key];
    });

    // Process tags: convert to lowercase, replace invalid chars with hyphens, filter empty
    const processedTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))
      .filter(Boolean);

    mutation.mutate({
      type: selectedType as CardType,
      title,
      content,
      tags: processedTags,
      language: language || undefined,
      project_id: projectId,
    });
  };

  const updateField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-6">New Card</h1>

      {!selectedType && (
        <div>
          <Label className="mb-3 block text-sm font-medium">Choose card type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cardTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className="aisom-card flex flex-col items-center gap-2 py-6 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <type.icon className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedType && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={selectedType}>{selectedType.toUpperCase()}</Badge>
            <button onClick={() => setSelectedType("")} className="text-xs text-muted-foreground hover:text-foreground">Change type</button>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is this about?" className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. TypeScript" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma, separated" className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">Tags will be converted to lowercase and sanitized (alphanumeric + hyphens only)</p>
            </div>
          </div>

          {fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "input" ? (
                <Input id={field.key} value={fieldValues[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} placeholder={field.label} className="mt-1.5" />
              ) : field.type === "code" ? (
                <Textarea
                  id={field.key}
                  value={fieldValues[field.key] || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  className="mt-1.5 font-mono text-sm min-h-[120px] bg-primary text-primary-foreground placeholder:text-primary-foreground/40 border-primary"
                />
              ) : (
                <Textarea id={field.key} value={fieldValues[field.key] || ""} onChange={(e) => updateField(field.key, e.target.value)} placeholder={`Enter ${field.label.toLowerCase()}...`} className="mt-1.5 min-h-[100px]" />
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-4">
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Card"}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
