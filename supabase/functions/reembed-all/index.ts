import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIELDS: Record<string, [string, string][]> = {
  bug: [["symptom","Symptom"],["environment","Environment"],["stack_trace","Stack Trace"],["root_cause","Root Cause"],["fix","Fix"],["key_insight","Key Insight"]],
  adr: [["context","Context"],["decision","Decision"],["rationale","Rationale"],["consequences","Consequences"],["options","Options"],["outcome","Outcome"]],
  concept: [["definition","Definition"],["code_example","Code Example"],["analogy","Analogy"],["when_to_use","When to Use"],["when_not_to","When Not To"]],
  library: [["why_chosen","Why Chosen"],["gotchas","Gotchas"],["config_that_works","Config That Works"],["verdict","Verdict"],["alternatives_considered","Alternatives Considered"],["version","Version"]],
  learning: [["topic","Topic"],["key_takeaways","Key Takeaways"],["code_examples","Code Examples"],["resources","Resources"]],
  interview: [["question","Question"],["answer","Answer"],["followups","Follow-ups"],["difficulty","Difficulty"]],
  project: [["description","Description"],["repo_url","Repository URL"]],
};

function buildText(c: { type: string; title: string; tags: string[] | null; content: Record<string, unknown> }) {
  const parts = [`Card Type: ${c.type}`, `Title: ${c.title}`];
  if (c.tags?.length) parts.push(`Tags: ${c.tags.join(", ")}`);
  const included = new Set<string>();
  for (const [k, label] of FIELDS[c.type] || []) {
    const v = c.content?.[k];
    if (typeof v === "string" && v.trim()) { parts.push(`${label}: ${v}`); included.add(k); }
  }
  for (const [k, v] of Object.entries(c.content || {})) {
    if (included.has(k)) continue;
    if (typeof v === "string" && v.trim()) parts.push(`${k.replace(/_/g," ")}: ${v}`);
    else if (Array.isArray(v) && v.length) {
      const tv = v.filter((x) => typeof x === "string").join(" ").trim();
      if (tv) parts.push(`${k.replace(/_/g," ")}: ${tv}`);
    }
  }
  return parts.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cards, error } = await admin.from("cards").select("id,type,title,tags,content");
    if (error) throw error;
    let ok = 0, fail = 0;
    for (const c of cards || []) {
      const text = buildText(c as never);
      const r = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
      });
      if (!r.ok) { fail++; console.error("embed fail", c.id, r.status, await r.text()); continue; }
      const j = await r.json();
      const emb = j.data[0].embedding;
      const { error: upErr } = await admin.from("card_embeddings").upsert({ card_id: c.id, embedding: emb });
      if (upErr) { fail++; console.error("upsert fail", c.id, upErr.message); } else ok++;
    }
    return new Response(JSON.stringify({ ok, fail, total: cards?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
