import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  const allowed = ["embed", "search", "classify"];
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
      const text = validateString(body.text, 10_000);
      if (!cardId || !text) {
        return new Response(JSON.stringify({ error: "card_id and text are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
        body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
      });

      if (!embeddingResponse.ok) {
        console.log("Embedding API not available, skipping");
        return new Response(JSON.stringify({ success: true, embedded: false }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      const { error } = await supabaseAdmin
        .from("card_embeddings")
        .upsert({ card_id: cardId, embedding: JSON.stringify(embedding) });

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

      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: query, model: "text-embedding-3-small" }),
      });

      if (!embeddingResponse.ok) {
        // Fallback to text search
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .ilike("title", `%${query}%`)
          .limit(10);

        if (error) throw error;
        return new Response(JSON.stringify({ results: data, semantic: false }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      const { data: matches, error: searchError } = await supabase.rpc("search_cards", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.5,
        match_count: 10,
      });

      if (searchError) throw searchError;

      if (matches && matches.length > 0) {
        const cardIds = matches.map((m: any) => m.card_id);
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", userId)
          .in("id", cardIds);

        if (cardsError) throw cardsError;

        const results = cards?.map((card: any) => ({
          ...card,
          similarity: matches.find((m: any) => m.card_id === card.id)?.similarity,
        })).sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0));

        return new Response(JSON.stringify({ results, semantic: true }), {
          headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ results: [], semantic: true }), {
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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
