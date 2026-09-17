import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { trackGenerateLead } from "@/lib/analytics";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  budgetRange: z.string().trim().max(80).optional().or(z.literal("")),
  details: z.string().trim().min(10, "Tell us a bit about the project"),
  heardAbout: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")), // honeypot
});

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    budgetRange: "",
    details: "",
    heardAbout: "",
    company: "",
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0];
      toast.error((first && first[0]) || "Please fix the form");
      return;
    }
    setBusy(true);

    // Prefer a deployed function endpoint if configured
    const fnUrl = import.meta.env.VITE_SEND_LEAD_URL;

    try {
      if (fnUrl) {
        const res = await fetch(fnUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...parsed.data, kind: "quote", pagePath: "/contact" }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Submission failed");
      } else {
        const { error } = await supabase.functions.invoke("send-lead", {
          body: { ...parsed.data, kind: "quote", pagePath: "/contact" },
        });
        if (error) throw error;
      }

      trackGenerateLead({ value: 0 });
      toast.success("Thanks — we have your request. We'll be in touch soon.");
      setDone(true);
    } catch (err: unknown) {
      console.error("contact submit error", err);
      const message = err instanceof Error ? err.message : "That did not go through. Please try again.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <Seo title="Get a free quote" description="Thanks — we have your request." path="/contact" />
        <section className="wrap py-24">
          <h1 className="text-[26px] font-semibold text-slate">Thanks — we will be in touch</h1>
          <p className="mt-4 text-ash">Expect a reply within one business day. If this is urgent, email sales.aisom@gmail.com.</p>
          <div className="mt-8">
            <Link to="/" className="text-[13px] text-slate hover:underline">Return home</Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo title="Get a free quote" description="Request a fixed-price quote for your website." path="/contact" />

      <section className="wrap py-20">
        <p className="section-index">CONTACT</p>
        <h1 className="mt-4 text-[26px] text-slate md:text-[34px]">Get a free quote</h1>
        <p className="mt-4 max-w-2xl text-ash">Tell us about your business and what you need. We reply within one business day and show you a clear fixed price.</p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="name">Name</label>
            <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="sr-only" htmlFor="business">Business name</label>
            <Input id="business" placeholder="Business (optional)" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>

          <div>
            <label className="sr-only" htmlFor="email">Email</label>
            <Input id="email" type="email" placeholder="you@business.co.za" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div>
            <label className="sr-only" htmlFor="phone">Phone</label>
            <Input id="phone" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div>
            <label className="sr-only" htmlFor="industry">Industry</label>
            <Input id="industry" placeholder="Industry (e.g. Hospitality)" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          </div>

          <div>
            <label className="sr-only" htmlFor="budget">Budget range</label>
            <select id="budget" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base">
              <option value="">Select budget (optional)</option>
              <option>R3 000 — Starter</option>
              <option>R5 000 — Full</option>
              <option>R7 500+</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="sr-only" htmlFor="details">Project details</label>
            <Textarea id="details" placeholder="Tell us about your project" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} required />
          </div>

          <div className="md:col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="hidden" name="company" value={form.company} onChange={() => {}} />
              <p className="text-[13px] text-ash">By submitting you agree we may contact you about your enquiry.</p>
            </div>

            <div>
              <Button type="submit" disabled={busy}>{busy ? "Sending" : "Send request"}</Button>
            </div>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
