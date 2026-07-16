import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper function to generate searchable text from card content based on card type
function generateCardSearchText(card: {
  type: string;
  title: string;
  content: Record<string, unknown>;
  tags?: string[];
}): string {
  const parts: string[] = [];

  // Add title and type context
  parts.push(`Card Type: ${card.type}`);
  parts.push(`Title: ${card.title}`);

  // Add tags
  if (card.tags?.length) {
    parts.push(`Tags: ${card.tags.join(", ")}`);
  }

  // Add field-specific content with labels for better semantic understanding
  const content = card.content || {};
  const includedKeys = new Set<string>();

  const includeField = (key: string, label: string) => {
    const value = content[key];
    if (typeof value === "string" && value.trim()) {
      parts.push(`${label}: ${value}`);
      includedKeys.add(key);
    }
  };

  if (card.type === "bug") {
    includeField("symptom", "Symptom");
    includeField("environment", "Environment");
    includeField("stack_trace", "Stack Trace");
    includeField("root_cause", "Root Cause");
    includeField("fix", "Fix");
    includeField("key_insight", "Key Insight");
  } else if (card.type === "adr") {
    includeField("context", "Context");
    includeField("decision", "Decision");
    includeField("rationale", "Rationale");
    includeField("consequences", "Consequences");
    includeField("options", "Options");
    includeField("outcome", "Outcome");
  } else if (card.type === "concept") {
    includeField("definition", "Definition");
    includeField("code_example", "Code Example");
    includeField("analogy", "Analogy");
    includeField("when_to_use", "When to Use");
    includeField("when_not_to", "When Not To");
  } else if (card.type === "library") {
    includeField("why_chosen", "Why Chosen");
    includeField("gotchas", "Gotchas");
    includeField("config_that_works", "Config That Works");
    includeField("verdict", "Verdict");
    includeField("alternatives_considered", "Alternatives Considered");
    includeField("version", "Version");
  } else if (card.type === "learning") {
    includeField("topic", "Topic");
    includeField("key_takeaways", "Key Takeaways");
    includeField("code_examples", "Code Examples");
    includeField("resources", "Resources");
  } else if (card.type === "interview") {
    includeField("question", "Question");
    includeField("answer", "Answer");
    includeField("followups", "Follow-ups");
    includeField("difficulty", "Difficulty");
  } else if (card.type === "project") {
    includeField("description", "Description");
    includeField("repo_url", "Repository URL");
  }

  // Add any additional text fields not explicitly listed above
  for (const [key, value] of Object.entries(content)) {
    if (includedKeys.has(key)) continue;
    if (typeof value === "string" && value.trim()) {
      parts.push(`${key.replace(/_/g, " ")}: ${value}`);
    } else if (Array.isArray(value) && value.length) {
      const textValues = value.filter((item) => typeof item === "string").join(" ").trim();
      if (textValues) {
        parts.push(`${key.replace(/_/g, " ")}: ${textValues}`);
      }
    }
  }

  return parts.join("\n");
}

// In-memory rate limiter per user
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per user

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimits.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetAt: entry.resetAt };
}

// Input validation helpers
function validateString(val: unknown, maxLen: number): string | null {
  if (typeof val !== "string") return null;
  const trimmed = val.trim().slice(0, maxLen);
  // Strip HTML tags
  return trimmed.replace(/<[^>]*>/g, "");
}

function validateAction(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const allowed = ["embed", "search", "classify", "reembed_all", "suggest_field"];
  return allowed.includes(val) ? val : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Auth: validate JWT via getClaims
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Rate limiting
    const rateResult = checkRateLimit(userId);
    if (!rateResult.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateResult.resetAt).toISOString(),
          "Retry-After": Math.ceil((rateResult.resetAt - Date.now()) / 1000).toString(),
        },
      });
    }

    // Parse and validate body
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const action = validateAction(body.action);
    if (!action) {
      return new Response(JSON.stringify({ error: "Invalid or missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for DB operations that need it
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const rateLimitHeaders = {
      "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
      "X-RateLimit-Remaining": rateResult.remaining.toString(),
      "X-RateLimit-Reset": new Date(rateResult.resetAt).toISOString(),
    };

    if (action === "embed") {
      const cardId = validateString(body.card_id, 36);
      const cardType = validateString(body.card_type, 50);
      const cardTitle = validateString(body.card_title, 200);
      const cardContent = body.card_content && typeof body.card_content === "object" ? body.card_content : null;
      const cardTags = Array.isArray(body.card_tags) ? body.card_tags.filter((t: unknown) => typeof t === "string") : [];
      
      if (!cardId) {
        return new Response(JSON.stringify({ error: "card_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If we have card details, use them to generate comprehensive searchable text
      let textToEmbed = "";
      if (cardType && cardTitle && cardContent !== null) {
        textToEmbed = generateCardSearchText({
          type: cardType,
          title: cardTitle,
          content: cardContent,
          tags: cardTags,
        });
      } else {
        // Fallback: use text parameter if provided (for backward compatibility)
        const text = validateString(body.text, 10_000);
        if (!text) {
          return new Response(JSON.stringify({ error: "Either card details or text is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        textToEmbed = text;
      }

      // Verify the card belongs to this user
      const { data: card, error: cardError } = await supabase
        .from("cards")
        .select("id")
        .eq("id", cardId)
        .eq("user_id", userId)
        .single();
      if (cardError || !card) {
        return new Response(JSON.stringify({ error: "Card not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: textToEmbed,
          model: "openai/text-embedding-3-small",
        }),
      });

      if (!embeddingResponse.ok) {
        const errText = await embeddingResponse.text();
        console.error("Embedding failed:", embeddingResponse.status, errText.slice(0, 200));
        return new Response(JSON.stringify({ success: true, embedded: false, reason: errText.slice(0, 200) }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      const { error } = await supabaseAdmin
        .from("card_embeddings")
        .upsert({ card_id: cardId, embedding });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, embedded: true }), {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "search") {
      const query = validateString(body.query, 500);
      if (!query) {
        return new Response(JSON.stringify({ error: "query is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Try semantic search first
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        // Use the query directly - the embedding model will understand context from keywords like "symptom", "root cause", etc.
        body: JSON.stringify({ input: query, model: "openai/text-embedding-3-small" }),
      });

      if (!embeddingResponse.ok) {
        const errText = await embeddingResponse.text();
        console.error("Search embedding failed:", embeddingResponse.status, errText.slice(0, 200));
        // Fallback to broad text search across title, tags, and content
        const escaped = query.replace(/[%,()]/g, " ");
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .or(`title.ilike.%${escaped}%,content.cs.{"${escaped}"},tags.cs.{${escaped}}`)
          .limit(10);

        if (error) {
          // Last-resort title-only fallback
          const { data: titleData } = await supabase
            .from("cards").select("*").eq("user_id", userId)
            .ilike("title", `%${escaped}%`).limit(10);
          return new Response(JSON.stringify({ results: titleData || [], semantic: false }), {
            headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ results: data, semantic: false }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      const { data: matches, error: searchError } = await supabase.rpc("search_cards", {
        query_embedding: queryEmbedding,
        user_id: userId,
        match_threshold: 0.25,
        match_count: 10,
      });

      if (searchError) throw searchError;

      if (matches && matches.length > 0) {
        const cardIds = matches.map((m: unknown) => (m as { card_id: string }).card_id);
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .in("id", cardIds);

        if (cardsError) throw cardsError;

        const results = cards?.map((card) => {
          const match = matches.find((m: unknown) => (m as { card_id: string }).card_id === card.id);
          return {
            ...card,
            similarity: (match as { similarity?: number })?.similarity,
          };
        }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

        return new Response(JSON.stringify({ results, semantic: true }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      // No semantic matches — fall back to broad text search so users still get results
      {
        const escaped = query.replace(/[%,()]/g, " ");
        const { data: fbData } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .or(`title.ilike.%${escaped}%,content.cs.{"${escaped}"},tags.cs.{${escaped}}`)
          .limit(10);
        return new Response(JSON.stringify({ results: fbData || [], semantic: false }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

    } else if (action === "reembed_all") {
      // Backfill embeddings for all of this user's cards that don't have one yet.
      const { data: userCards, error: cardsErr } = await supabase
        .from("cards")
        .select("id, type, title, content, tags")
        .eq("user_id", userId)
        .eq("is_archived", false);

      if (cardsErr) throw cardsErr;

      let embedded = 0;
      let failed = 0;
      for (const card of userCards || []) {
        const text = generateCardSearchText({
          type: card.type,
          title: card.title,
          content: (card.content || {}) as Record<string, unknown>,
          tags: (card.tags || []) as string[],
        });
        const r = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: text, model: "openai/text-embedding-3-small" }),
        });
        if (!r.ok) {
          failed++;
          continue;
        }
        const j = await r.json();
        const emb = j?.data?.[0]?.embedding;
        if (!emb) { failed++; continue; }
        const { error: upErr } = await supabaseAdmin
          .from("card_embeddings")
          .upsert({ card_id: card.id, embedding: emb });
        if (upErr) failed++; else embedded++;
      }

      return new Response(JSON.stringify({ success: true, embedded, failed, total: userCards?.length || 0 }), {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "classify") {
      const text = validateString(body.text, 2000);
      if (!text) {
        return new Response(JSON.stringify({ error: "text is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: "You are a classifier. Given developer text, determine which card type it best fits: bug, adr, concept, library, learning, or interview. Respond with just the type name.",
            },
            { role: "user", content: text },
          ],
          tools: [{
            type: "function",
            function: {
              name: "classify_card",
              description: "Classify the card type",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["bug", "adr", "concept", "library", "learning", "interview"] },
                  confidence: { type: "number" },
                },
                required: ["type", "confidence"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "classify_card" } },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ type: "bug", confidence: 0 }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const result = toolCall ? JSON.parse(toolCall.function.arguments) : { type: "bug", confidence: 0 };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      });
    } else if (action === "suggest_field") {
      const cardType = validateString(body.card_type, 50) || "";
      const fieldKey = validateString(body.field_key, 60) || "";
      const title = validateString(body.title, 200) || "";
      const language = validateString(body.language, 30) || "";
      const tagsArr = Array.isArray(body.tags)
        ? (body.tags as unknown[]).filter((t) => typeof t === "string").slice(0, 10) as string[]
        : [];
      const existing = body.existing_content && typeof body.existing_content === "object"
        ? body.existing_content as Record<string, unknown>
        : {};

      if (!cardType || !fieldKey || !title) {
        return new Response(JSON.stringify({ error: "card_type, field_key, and title are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fieldPrompts: Record<string, Record<string, string>> = {
        bug: {
          symptom: "Describe the most likely observable symptom a developer would see for this bug. 1-3 sentences.",
          environment: "Hypothesise the environment (runtime, OS, framework versions) where this bug most likely occurs.",
          stack_trace: "Sketch a plausible stack trace or error message for this bug. Use realistic frames for the stated language.",
          root_cause: "Diagnose the most probable root cause. Reason step-by-step in pseudo-code where useful. Be specific — name the module, API, or invariant that is violated.",
          fix: "Propose a concrete possible fix. Prefer minimal pseudo-code or real code in the user's language. Show only the changed lines with a short rationale.",
          key_insight: "Extract the durable insight another engineer should remember. One or two crisp sentences — no fluff.",
        },
        adr: {
          context: "Frame the technical context and forces that make this decision necessary.",
          decision: "Propose the decision itself in one paragraph, imperative voice.",
          rationale: "Argue the rationale — why this beats the obvious alternatives.",
          consequences: "Predict the consequences: positive, negative, and future constraints imposed.",
        },
        concept: {
          definition: "Define the concept precisely, in the user's own likely words. Avoid textbook prose.",
          code_example: "Sketch a minimal, idiomatic code example that demonstrates the concept.",
          analogy: "Draw a memorable analogy that grounds the concept in something concrete.",
          when_to_use: "Enumerate the situations where this concept is the right tool.",
          when_not_to: "Enumerate the situations where this concept is the wrong tool.",
        },
        library: {
          why_chosen: "Justify why an engineer would choose this library over its peers.",
          gotchas: "Foresee the gotchas — footguns, hidden defaults, and painful edges.",
          config_that_works: "Draft a minimal working config or setup snippet.",
          alternatives_considered: "List the credible alternatives with a one-line tradeoff for each.",
          version: "Suggest a sensible current stable version.",
        },
        learning: {
          topic: "Name the topic in a precise, searchable phrase.",
          key_takeaways: "Distill the key takeaways into a tight bullet list.",
          code_examples: "Sketch one or two illustrative code examples.",
          resources: "Recommend 2-4 high-signal resources (docs, papers, talks). Do NOT invent URLs — cite by title and author.",
        },
        interview: {
          question: "Rephrase this as a crisp interview question.",
          answer: "Draft a strong answer an interviewer would score highly. Reason step-by-step.",
          followups: "Anticipate 2-4 follow-up questions an interviewer would drill into.",
        },
        project: {
          description: "Describe this project in 2-4 sentences an engineer would find useful.",
        },
      };

      const instruction = fieldPrompts[cardType]?.[fieldKey];
      if (!instruction) {
        return new Response(JSON.stringify({ error: "No AI suggestion available for this field" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const contextLines: string[] = [
        `Card type: ${cardType}`,
        `Title: ${title}`,
      ];
      if (language) contextLines.push(`Language: ${language}`);
      if (tagsArr.length) contextLines.push(`Tags: ${tagsArr.join(", ")}`);
      for (const [k, v] of Object.entries(existing)) {
        if (k === fieldKey) continue;
        if (typeof v === "string" && v.trim()) {
          contextLines.push(`${k.replace(/_/g, " ")}: ${v.trim().slice(0, 1200)}`);
        }
      }

      const systemPrompt =
        "You are a senior engineer pair-programming with the user as a pseudo-coding agent. " +
        "Reason like a careful engineer: cite likely causes, be specific, and prefer concise pseudo-code or the user's stated language when code helps. " +
        "Ground every claim in the context the user has provided. If information is missing, hypothesise explicitly rather than hedging. " +
        "Return ONLY the content that belongs in the requested field — no preamble, no headings, no meta-commentary.";

      const userPrompt = `${instruction}\n\nContext:\n${contextLines.join("\n")}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await response.text();
        return new Response(JSON.stringify({ error: errText.slice(0, 200) || "AI request failed" }), {
          status: 500,
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const suggestion = (data?.choices?.[0]?.message?.content ?? "").toString().trim();

      return new Response(JSON.stringify({ suggestion }), {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // Never log card content or sensitive data
    console.error("ai-cards error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
