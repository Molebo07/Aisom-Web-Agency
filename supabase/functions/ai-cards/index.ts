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
  const allowed = ["embed", "search", "classify", "backfill"];
  return allowed.includes(val) ? val : null;
}

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

async function embedText(text: string, apiKey: string): Promise<number[] | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, model: EMBEDDING_MODEL }),
  });
  if (!res.ok) {
    console.error("Embedding API error:", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = await res.json();
  return data?.data?.[0]?.embedding ?? null;
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

      const embedding = await embedText(textToEmbed, LOVABLE_API_KEY);
      if (!embedding) {
        return new Response(JSON.stringify({ success: true, embedded: false }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

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

      // Run semantic + text search in parallel, then merge.
      const queryEmbedding = await embedText(query, LOVABLE_API_KEY);

      const semanticPromise = queryEmbedding
        ? supabase.rpc("search_cards", {
            query_embedding: queryEmbedding,
            user_id: userId,
            match_threshold: 0.3,
            match_count: 20,
          })
        : Promise.resolve({ data: null, error: null });

      // Text search across title, content (jsonb cast to text), and tags
      const escaped = query.replace(/[%_]/g, (m) => `\\${m}`);
      const pattern = `%${escaped}%`;
      const textPromise = supabase
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .or(`title.ilike.${pattern},content_text.ilike.${pattern}`)
        .limit(20);

      // The or() above references a generated column we don't have; use two separate queries instead.
      const [titleRes, tagRes, semRes] = await Promise.all([
        supabase.from("cards").select("*").eq("user_id", userId).ilike("title", pattern).limit(20),
        supabase.from("cards").select("*").eq("user_id", userId).contains("tags", [query.toLowerCase()]).limit(20),
        semanticPromise,
      ]);
      // Suppress unused
      void textPromise;

      const semMatches = (semRes as { data: Array<{ card_id: string; similarity: number }> | null }).data || [];
      const merged = new Map<string, Record<string, unknown> & { similarity?: number }>();

      if (semMatches.length > 0) {
        const cardIds = semMatches.map((m) => m.card_id);
        const { data: semCards } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .in("id", cardIds);
        for (const c of semCards || []) {
          const m = semMatches.find((x) => x.card_id === (c as { id: string }).id);
          merged.set((c as { id: string }).id, { ...c, similarity: m?.similarity });
        }
      }

      // Boost / include title and tag matches
      const addTextMatch = (c: { id: string }, boost: number) => {
        const existing = merged.get(c.id);
        if (existing) {
          existing.similarity = Math.max(existing.similarity ?? 0, boost);
        } else {
          merged.set(c.id, { ...c, similarity: boost });
        }
      };
      for (const c of titleRes.data || []) addTextMatch(c as { id: string }, 0.85);
      for (const c of tagRes.data || []) addTextMatch(c as { id: string }, 0.8);

      // Also do a content-text fallback search via jsonb::text cast for cards without embeddings
      const { data: contentMatches } = await supabaseAdmin
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .filter("content", "ilike", `%${query}%`)
        .limit(20);
      for (const c of contentMatches || []) addTextMatch(c as { id: string }, 0.6);

      const results = Array.from(merged.values()).sort(
        (a, b) => (b.similarity || 0) - (a.similarity || 0),
      ).slice(0, 15);

      return new Response(JSON.stringify({ results, semantic: !!queryEmbedding }), {
        headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "backfill") {
      // Embed all of the user's cards that don't have an embedding yet.
      const { data: cards, error: cardsError } = await supabase
        .from("cards")
        .select("id, type, title, content, tags")
        .eq("user_id", userId)
        .eq("is_archived", false);
      if (cardsError) throw cardsError;

      const { data: existing } = await supabaseAdmin
        .from("card_embeddings")
        .select("card_id");
      const have = new Set((existing || []).map((e: { card_id: string }) => e.card_id));
      const todo = (cards || []).filter((c: { id: string }) => !have.has(c.id));

      let embedded = 0;
      let failed = 0;
      // Limit per call to avoid timeouts
      for (const c of todo.slice(0, 50)) {
        const text = generateCardSearchText({
          type: (c as { type: string }).type,
          title: (c as { title: string }).title,
          content: ((c as { content: Record<string, unknown> }).content) || {},
          tags: (c as { tags?: string[] }).tags || [],
        });
        const vec = await embedText(text, LOVABLE_API_KEY);
        if (!vec) { failed++; continue; }
        const { error: upErr } = await supabaseAdmin
          .from("card_embeddings")
          .upsert({ card_id: (c as { id: string }).id, embedding: vec });
        if (upErr) { failed++; continue; }
        embedded++;
      }

      return new Response(JSON.stringify({
        success: true,
        total: cards?.length || 0,
        missing: todo.length,
        embedded,
        failed,
        remaining: Math.max(0, todo.length - 50),
      }), {
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
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    // Never log card content or sensitive data
    console.error("ai-cards error:", e instanceof Error ? e.message : "Unknown error");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
