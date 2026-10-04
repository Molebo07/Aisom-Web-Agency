import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { trackGenerateLead } from "@/lib/analytics";
import { submitLead } from "@/lib/submitLead";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  websiteUrl: z.string().trim().url("Add a valid website URL"),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to the privacy notice." }) }),
  company: z.string().max(200).optional().or(z.literal("")),
});

export default function SnapshotPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    websiteUrl: "",
    consent: false,
    company: "",
  });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, consent: form.consent });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0];
      toast.error((first && first[0]) || "Please fix the form");
      return;
    }

    setBusy(true);
    try {
      await submitLead({
        ...parsed.data,
        details: `Website snapshot requested for ${parsed.data.websiteUrl}`,
        kind: "snapshot",
        pagePath: "/snapshot",
      });
      trackGenerateLead({ value: 0, form_name: "snapshot" });
      setDone(true);
      toast.success("Thanks. We will review your website and reply with a snapshot within 48 hours.");
    } catch (error) {
      console.error("snapshot submit error", error);
      toast.error("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <Seo title="Your website snapshot request was sent | Aisom" description="Thanks. We will review your website and send a snapshot within 48 hours." path="/snapshot" />
        <section className="wrap py-24">
          <h1 className="text-[28px] text-slate md:text-[36px]">We have your website review request.</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ash">We will review your request and reply using the contact details you provided.</p>
          <div className="mt-8"><Link to="/" className="text-[13px] text-slate hover:underline">Back to the homepage</Link></div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo title="Find out how your business looks online | Aisom" description="Book a free website snapshot and get a one-page review plus a mock homepage recommendation for your current website." path="/snapshot" />
      <section className="wrap py-20">
        <div className="mx-auto max-w-2xl rounded-md border border-border bg-background p-8 shadow-sm">
          <p className="section-index">FREE WEBSITE SNAPSHOT</p>
          <h1 className="mt-4 text-[28px] text-slate md:text-[38px]">Find out how your business looks online</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ash">Send your website URL and we will review the request for a one-page website snapshot. We will confirm availability and timing before starting the review.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4">
            <div>
              <label htmlFor="snapshot-name" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Name</label>
              <Input id="snapshot-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="snapshot-email" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Email</label>
              <Input id="snapshot-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="snapshot-url" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Website URL</label>
              <Input id="snapshot-url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://example.com" required />
            </div>
            <div>
              <input type="hidden" name="company" value={form.company} onChange={() => undefined} />
              <label className="flex items-start gap-3 rounded-md border border-border p-3 text-[13px] leading-relaxed text-ash">
                <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1 h-4 w-4" />
                <span>I agree to Aisom using my details for this review and to the terms in the <Link to="/privacy-policy" className="font-medium text-slate underline">privacy policy</Link>.</span>
              </label>
            </div>
            <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending" : "Get my snapshot"}</Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
