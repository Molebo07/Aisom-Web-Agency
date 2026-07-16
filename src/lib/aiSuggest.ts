import { supabase } from "@/integrations/supabase/client";

// Contextual AI button labels per card type + field. Fields not listed here
// intentionally have no AI assist (e.g. project.repo_url — user-provided only).
export const aiFieldLabels: Record<string, Record<string, string>> = {
  bug: {
    symptom: "Reproduce it",
    environment: "Likely Environment",
    stack_trace: "Expected Trace",
    root_cause: "Diagnose Cause",
    fix: "Possible Fix",
    key_insight: "Extract Insight",
  },
  adr: {
    context: "Frame Context",
    decision: "Propose Decision",
    rationale: "Argue Rationale",
    consequences: "Predict Consequences",
  },
  concept: {
    definition: "Define It",
    code_example: "Sketch Example",
    analogy: "Draw Analogy",
    when_to_use: "When to Use",
    when_not_to: "When to Avoid",
  },
  library: {
    why_chosen: "Justify Choice",
    gotchas: "Foresee Gotchas",
    config_that_works: "Draft Config",
    alternatives_considered: "List Alternatives",
    version: "Suggest Version",
  },
  learning: {
    topic: "Name Topic",
    key_takeaways: "Distill Takeaways",
    code_examples: "Sketch Examples",
    resources: "Recommend Reading",
  },
  interview: {
    question: "Rephrase Question",
    answer: "Draft Answer",
    followups: "Anticipate Follow-ups",
  },
  project: {
    description: "Describe It",
  },
};

export function getAiLabel(cardType: string, fieldKey: string): string | null {
  return aiFieldLabels[cardType]?.[fieldKey] ?? null;
}

export async function suggestField(params: {
  cardType: string;
  fieldKey: string;
  title: string;
  language?: string;
  tags?: string[];
  existingContent?: Record<string, unknown>;
}): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ai-cards", {
    body: {
      action: "suggest_field",
      card_type: params.cardType,
      field_key: params.fieldKey,
      title: params.title,
      language: params.language || "",
      tags: params.tags || [],
      existing_content: params.existingContent || {},
    },
  });
  if (error) throw new Error(error.message || "AI request failed");
  const payload = data as { suggestion?: string; error?: string } | null;
  if (payload?.error) throw new Error(payload.error);
  return (payload?.suggestion || "").trim();
}