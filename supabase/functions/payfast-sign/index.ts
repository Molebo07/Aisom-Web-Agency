import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createHash } from "node:crypto";

const PAYFAST_MERCHANT_ID = Deno.env.get("PAYFAST_MERCHANT_ID") ?? "";
const PAYFAST_MERCHANT_KEY = Deno.env.get("PAYFAST_MERCHANT_KEY") ?? "";
const PAYFAST_PASSPHRASE = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";

const PLANS: Record<string, { name: string; monthlyPrice: number; itemDescription: string }> = {
  pro: {
    name: "Pro",
    monthlyPrice: 150,
    itemDescription:
      "Unlimited cards, AI search, spaced repetition, and advanced engineering knowledge workflows.",
  },
  team: {
    name: "Team",
    monthlyPrice: 250,
    itemDescription:
      "Shared team workspace, team ADR repository, shared bug knowledge base, and admin controls.",
  },
};

// Payfast signature spec: URL-encode values using PHP-style encoding (spaces -> '+'),
// keep field order as submitted (not alphabetical), append passphrase last if set.
function phpUrlEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function signFields(fields: Record<string, string>, passphrase: string) {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "" || key === "signature") continue;
    parts.push(`${key}=${phpUrlEncode(String(value).trim())}`);
  }
  let signatureString = parts.join("&");
  if (passphrase) {
    signatureString += `&passphrase=${phpUrlEncode(passphrase.trim())}`;
  }
  return createHash("md5").update(signatureString).digest("hex");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { planId, annual, returnUrl, cancelUrl, email } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const notifyUrl = `${supabaseUrl}/functions/v1/payfast-itn`;

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      return new Response(JSON.stringify({ error: "Payfast credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = (plan.monthlyPrice * (annual ? 10 : 1)).toFixed(2);
    const frequencyLabel = annual ? "annual" : "monthly";

    // Field order matters for the signature on the Payfast side.
    const fields: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: String(returnUrl ?? ""),
      cancel_url: String(cancelUrl ?? ""),
      notify_url: notifyUrl,
      ...(email ? { email_address: String(email) } : {}),
      m_payment_id: `${planId}-${frequencyLabel}-${Date.now()}`,
      amount,
      item_name: `${plan.name} ${annual ? "Annual" : "Monthly"}`,
      item_description: plan.itemDescription,
    };

    const signature = signFields(fields, PAYFAST_PASSPHRASE);

    return new Response(
      JSON.stringify({ fields: { ...fields, signature } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});