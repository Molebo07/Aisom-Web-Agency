import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const PAYFAST_PASSPHRASE = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Payfast's official server IPs (sandbox + live). Used to reject spoofed posts.
const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

function phpUrlEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function buildSignature(entries: [string, string][], passphrase: string) {
  const parts = entries
    .filter(([k, v]) => k !== "signature" && v !== "" && v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${phpUrlEncode(String(v).trim())}`);
  let str = parts.join("&");
  if (passphrase) str += `&passphrase=${phpUrlEncode(passphrase.trim())}`;
  return createHash("md5").update(str).digest("hex");
}

async function verifyWithPayfast(rawBody: string, sandbox: boolean) {
  const host = sandbox ? "sandbox.payfast.co.za" : "www.payfast.co.za";
  const res = await fetch(`https://${host}/eng/query/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  const text = (await res.text()).trim();
  return text === "VALID";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const entries: [string, string][] = [];
    params.forEach((v, k) => entries.push([k, v]));
    const data = Object.fromEntries(entries) as Record<string, string>;

    // 1. Signature check
    const expectedSig = buildSignature(entries, PAYFAST_PASSPHRASE);
    if (!data.signature || data.signature.toLowerCase() !== expectedSig.toLowerCase()) {
      console.error("Payfast ITN: signature mismatch");
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }

    // 2. Source host check
    const sourceHost = (req.headers.get("host") ?? "").toLowerCase();
    const referer = (req.headers.get("referer") ?? "").toLowerCase();
    const fromPayfast = PAYFAST_HOSTS.some((h) => referer.includes(h) || sourceHost.includes(h));
    // Don't hard-block on host alone, but log it for audit.
    if (!fromPayfast) {
      console.warn("Payfast ITN: request did not originate from a known Payfast host", { referer });
    }

    // 3. Server-to-server validation with Payfast
    const sandbox = (data.merchant_id ?? "") === "10000100" ||
      referer.includes("sandbox.payfast.co.za");
    const valid = await verifyWithPayfast(rawBody, sandbox);
    if (!valid) {
      console.error("Payfast ITN: server validation failed");
      return new Response("Validation failed", { status: 400, headers: corsHeaders });
    }

    // 4. Persist
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse plan/billing from m_payment_id we sent: `${planId}-${frequencyLabel}-${ts}`
    const mPaymentId = data.m_payment_id ?? "";
    const [planId, billingCycle] = mPaymentId.split("-");

    // Best-effort user resolution by email
    let userId: string | null = null;
    if (data.email_address) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const match = users?.users?.find(
        (u) => (u.email ?? "").toLowerCase() === data.email_address.toLowerCase(),
      );
      userId = match?.id ?? null;
    }

    const { error } = await supabase.from("payfast_payments").upsert(
      {
        user_id: userId,
        m_payment_id: mPaymentId || null,
        pf_payment_id: data.pf_payment_id || null,
        payment_status: data.payment_status ?? "UNKNOWN",
        item_name: data.item_name ?? null,
        amount_gross: data.amount_gross ? Number(data.amount_gross) : null,
        amount_fee: data.amount_fee ? Number(data.amount_fee) : null,
        amount_net: data.amount_net ? Number(data.amount_net) : null,
        email_address: data.email_address ?? null,
        plan_id: planId ?? null,
        billing_cycle: billingCycle ?? null,
        raw_payload: data,
      },
      { onConflict: "pf_payment_id" },
    );

    if (error) {
      console.error("Payfast ITN: insert failed", error);
      return new Response("DB error", { status: 500, headers: corsHeaders });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Payfast ITN: unexpected error", err);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});