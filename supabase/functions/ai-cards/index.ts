import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { action, ...params } = await req.json();

    if (action === "embed") {
      // Generate embedding for a card and store it
      const { card_id, text } = params;
      
      // Use Lovable AI to generate embedding via a workaround:
      // We'll use the AI to create a semantic representation
      // For now, we'll use a simple approach with the chat API
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-3-small",
        }),
      });

      if (!embeddingResponse.ok) {
        // If embedding API not available, skip embedding silently
        console.log("Embedding API not available, skipping");
        return new Response(JSON.stringify({ success: true, embedded: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      const { error } = await supabase
        .from("card_embeddings")
        .upsert({ card_id, embedding: JSON.stringify(embedding) });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, embedded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "search") {
      const { query } = params;
      
      // Generate embedding for query
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: query,
          model: "text-embedding-3-small",
        }),
      });

      if (!embeddingResponse.ok) {
        // Fallback to text search
        const { data, error } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", user.id)
          .ilike("title", `%${query}%`)
          .limit(10);

        if (error) throw error;
        return new Response(JSON.stringify({ results: data, semantic: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      // Semantic search
      const { data: matches, error: searchError } = await supabase.rpc("search_cards", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.5,
        match_count: 10,
      });

      if (searchError) throw searchError;

      // Fetch full card data for matches
      if (matches && matches.length > 0) {
        const cardIds = matches.map((m: any) => m.card_id);
        const { data: cards, error: cardsError } = await supabase
          .from("cards")
          .select("*")
          .eq("user_id", user.id)
          .in("id", cardIds);

        if (cardsError) throw cardsError;

        const results = cards?.map((card: any) => ({
          ...card,
          similarity: matches.find((m: any) => m.card_id === card.id)?.similarity,
        })).sort((a: any, b: any) => (b.similarity || 0) - (a.similarity || 0));

        return new Response(JSON.stringify({ results, semantic: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ results: [], semantic: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "classify") {
      // AI-powered card type suggestion based on content
      const { text } = params;

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
        return new Response(JSON.stringify({ type: "bug", confidence: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      const result = toolCall ? JSON.parse(toolCall.function.arguments) : { type: "bug", confidence: 0 };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cards error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
