import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const allowedOrigins = new Set(
  (Deno.env.get("LEAD_ALLOWED_ORIGINS") ?? "https://aisom.co.za,https://www.aisom.co.za,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://aisom.co.za",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const BodySchema = z.object({
  kind: z.enum(["quote", "snapshot", "newsletter"]).default("quote"),
  name: z.string().trim().min(1).max(120).optional().or(z.literal("")),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  packageInterest: z.string().trim().max(80).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(220).optional().or(z.literal("")),
  details: z.string().trim().max(5000).optional().or(z.literal("")),
  heardAbout: z.string().trim().max(120).optional().or(z.literal("")),
  pagePath: z.string().trim().max(200).optional().or(z.literal("")),
  consent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  company: z.string().max(200).optional(), // honeypot
}).superRefine((data, ctx) => {
  if (data.kind === "newsletter") {
    if (!data.marketingConsent) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["marketingConsent"], message: "Marketing consent is required." });
    }
    return;
  }

  if (!data.name?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Name is required." });
  }
  if (!data.consent) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["consent"], message: "Enquiry consent is required." });
  }
  if (!data.details || data.details.trim().length < 10) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["details"], message: "Tell us a little about your request." });
  }
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
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Allow": "POST, OPTIONS", "Content-Type": "application/json" },
    });
  }
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) {
    return new Response(JSON.stringify({ error: "Request is too large." }), {
      status: 413,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
      name: d.name?.trim() || null,
      business_name: d.businessName || null,
      email: d.email.toLowerCase(),
      phone: d.phone || null,
      industry: d.industry || null,
      budget_range: d.budgetRange || d.packageInterest || null,
      package_interest: d.packageInterest || null,
      website_url: d.websiteUrl || null,
      details: d.details || null,
      heard_about: d.heardAbout || null,
      page_path: d.pagePath || null,
      consent_at: d.consent ? new Date().toISOString() : null,
      marketing_consent_at: d.marketingConsent ? new Date().toISOString() : null,
    });

    if (dbError) {
      console.error("lead insert failed:", dbError.message);
      return new Response(JSON.stringify({ error: "Could not save your enquiry." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (d.kind === "newsletter") {
      return new Response(JSON.stringify({ ok: true, emailed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("LEAD_FROM_EMAIL") ?? "Aisom <onboarding@resend.dev>";
    const recipients = (Deno.env.get("LEAD_TO_EMAIL") ?? "sales@aisom.co.za")
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    let emailed = false;

    if (resendKey && recipients.length > 0) {
      const requestName = d.kind === "snapshot" ? "website snapshot" : "quote";
      const html = `
        <h2>New ${requestName} request</h2>
        <p><strong>Name:</strong> ${esc(d.name || "-")}</p>
        <p><strong>Business:</strong> ${esc(d.businessName || "-")}</p>
        <p><strong>Email:</strong> ${esc(d.email)}</p>
        <p><strong>Phone:</strong> ${esc(d.phone || "-")}</p>
        <p><strong>Website:</strong> ${esc(d.websiteUrl || "-")}</p>
        <p><strong>Package:</strong> ${esc(d.packageInterest || "-")}</p>
        <p><strong>Industry:</strong> ${esc(d.industry || "-")}</p>
        <p><strong>Budget:</strong> ${esc(d.budgetRange || "-")}</p>
        <p><strong>Heard about us:</strong> ${esc(d.heardAbout || "-")}</p>
        <p><strong>Page:</strong> ${esc(d.pagePath || "-")}</p>
        <hr />
        <p>${esc(d.details || "-").replace(/\n/g, "<br />")}</p>
      `;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: recipients,
          reply_to: d.email,
          subject: `New ${requestName} request: ${d.businessName || d.name || d.email}`,
          html,
        }),
      });
      if (!res.ok) {
        console.error(`Resend failed [${res.status}]: ${await res.text()}`);
      } else {
        emailed = true;
      }
    } else {
      console.warn("Lead saved but not emailed; configure RESEND_API_KEY and LEAD_TO_EMAIL.");
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
