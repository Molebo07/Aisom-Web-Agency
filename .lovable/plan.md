# Minimal Cards + Pseudo-Coding AI Agent

## Goal

Let engineers save any card with just **title, language, tags** (detail fields optional), then invoke a **pseudo-coding agent** that reasons like a senior engineer to draft each missing field. Each field gets its own contextual AI button (e.g., "Possible Fix" on a Bug's fix field), not a single generic "Suggest with AI".

## Persona

The agent behaves like a pair-programming senior engineer: it reasons aloud in pseudocode where relevant, cites likely causes, and proposes concrete next steps. Output is grounded in whatever the user has already typed (title, language, tags, and any sibling fields).

## Per-field AI button labels

**Bug**

- symptom → "Reproduce it"
- environment → "Likely Environment"
- stack_trace → "Expected Trace"
- root_cause → "Diagnose Cause"
- fix → **"Possible Fix"**
- key_insight → "Extract Insight"

**ADR**

- context → "Frame Context"
- decision → "Propose Decision"
- rationale → "Argue Rationale"
- consequences → "Predict Consequences"

**Concept**

- definition → "Define It"
- code_example → "Sketch Example"
- analogy → "Draw Analogy"
- when_to_use → "When to Use"
- when_not_to → "When to Avoid"

**Library**

- why_chosen → "Justify Choice"
- gotchas → "Foresee Gotchas"
- config_that_works → "Draft Config"
- alternatives_considered → "List Alternatives"
- version → "Suggest Version"

**Learning**

- topic → "Name Topic"
- key_takeaways → "Distill Takeaways"
- code_examples → "Sketch Examples"
- resources → "Recommend Reading"

**Interview**

- question → "Rephrase Question"
- answer → "Draft Answer"
- followups → "Anticipate Follow-ups"

**Project**

- description → "Describe It"
- repo_url → (no AI — user-provided only)

Each button appears inline next to its field's label. Clicking it fills only that field, using the current type + title + language + tags + any other filled fields as context. Users edit freely afterward.

## Changes

### 1. `src/pages/NewCard.tsx`

- All type-specific fields optional. Title remains required. Save works with just the title, language, and tags.
- Add an inline AI button per field with the labels above. Button shows spinner while loading and is disabled when title is empty (agent needs at least a title to reason from).
- On click: call `ai-cards` edge function with `action: "suggest_field"`, passing `{ card_type, field_key, title, language, tags, existing_content }`. Writes the response into that field only; never overwrites non-empty user text without confirm.

### 2. `src/components/cards/CardDetailSheet.tsx`

- Same per-field buttons so users can enrich stub cards after saving.

### 3. `supabase/functions/ai-cards/index.ts`

- Add `action: "suggest_field"` branch.
- Uses Lovable AI Gateway (`google/gemini-3.5-flash`) via AI SDK `generateText`.
- System prompt establishes the pseudo-coding-agent persona: "You are a senior engineer pair-programming with the user. Reason step-by-step. Where code helps, use concise pseudo-code or the user's stated language. Be specific, not generic."
- Per-field user prompt template picks the right instruction (e.g. for `fix`: "Given the symptom, environment, stack trace, and root cause, propose a concrete fix in {language}. Prefer pseudo-code or minimal real code.").
- Returns `{ suggestion: string }`. Plain text; the field renders it as-is.
- Handles 429 / 402 with clear error payloads.

## Out of scope

- No DB migration. No changes to card schema, RLS, or workspaces.

## Files touched

- edit `src/pages/NewCard.tsx`
- edit `src/components/cards/CardDetailSheet.tsx`
- edit `supabase/functions/ai-cards/index.ts`