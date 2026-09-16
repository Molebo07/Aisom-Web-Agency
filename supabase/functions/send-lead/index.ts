import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const FOUNDER_EMAILS = ["sales.aisom@gmail.com"];

const BodySchema = z.object({
  kind: z.enum(["quote", "newsletter"]).default("quote"),
  name: z.string().trim().min(1).max(120),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  details: z.string().trim().min(10).max(5000),
  heardAbout: z.string().trim().max(120).optional().or(z.literal("")),
  pagePath: z.string().trim().max(200).optional().or(z.literal("")),
  company: z.string().max(200).optional(), // honeypot
});

// Simple in-memory rate limit: 5 submissions per IP per hour.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const window = 60 * 60 * 1000;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < window);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const d = parsed.data;

    // Honeypot: pretend success, store nothing.
    if (d.company && d.company.trim() !== "") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("leads").insert({
      kind: d.kind,
      name: d.name,
      business_name: d.businessName || null,
      email: d.email.toLowerCase(),
      phone: d.phone || null,
      industry: d.industry || null,
      budget_range: d.budgetRange || null,
      details: d.details,
      heard_about: d.heardAbout || null,
      page_path: d.pagePath || null,
    });

    if (dbError) {
      console.error("lead insert failed:", dbError.message);
      return new Response(JSON.stringify({ error: "Could not save your enquiry." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify the founders. Skipped silently until an email key is configured.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("LEAD_FROM_EMAIL") ?? "Aisom <onboarding@resend.dev>";
    let emailed = false;

    if (resendKey) {
      const html = `
        <h2>New quote request</h2>
        <p><strong>Name:</strong> ${esc(d.name)}</p>
        <p><strong>Business:</strong> ${esc(d.businessName || "-")}</p>
        <p><strong>Email:</strong> ${esc(d.email)}</p>
        <p><strong>Phone:</strong> ${esc(d.phone || "-")}</p>
        <p><strong>Industry:</strong> ${esc(d.industry || "-")}</p>
        <p><strong>Budget:</strong> ${esc(d.budgetRange || "-")}</p>
        <p><strong>Heard about us:</strong> ${esc(d.heardAbout || "-")}</p>
        <p><strong>Page:</strong> ${esc(d.pagePath || "-")}</p>
        <hr />
        <p>${esc(d.details).replace(/\n/g, "<br />")}</p>
      `;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: FOUNDER_EMAILS,
          reply_to: d.email,
          subject: `New quote request: ${d.businessName || d.name}`,
          html,
        }),
      });
      if (!res.ok) {
        console.error(`Resend failed [${res.status}]: ${await res.text()}`);
      } else {
        emailed = true;
      }
    } else {
      console.warn("RESEND_API_KEY not set; lead saved but no email sent.");
    }

    return new Response(JSON.stringify({ ok: true, emailed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-lead error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
