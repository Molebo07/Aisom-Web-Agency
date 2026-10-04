import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { trackGenerateLead } from "@/lib/analytics";
import { submitLead } from "@/lib/submitLead";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  businessName: z.string().trim().max(160).optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Add a phone or WhatsApp number"),
  email: z.string().trim().email("Enter a valid email address"),
  packageInterest: z.string().trim().min(1, "Pick a package"),
  websiteUrl: z.string().trim().url("Enter a valid website URL").max(220).optional().or(z.literal("")),
  message: z.string().trim().max(1200).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to the privacy notice." }) }),
  company: z.string().max(200).optional().or(z.literal("")),
});

export default function QuotePage() {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    packageInterest: "",
    websiteUrl: "",
    message: "",
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
      const details = [
        `Package interest: ${parsed.data.packageInterest}`,
        `Existing website: ${parsed.data.websiteUrl || "Not provided"}`,
        parsed.data.message || "",
      ].filter(Boolean).join("\n");
      await submitLead({
        ...parsed.data,
        details,
        kind: "quote",
        pagePath: "/quote",
      });
      trackGenerateLead({ value: 0, form_name: "quote" });
      setDone(true);
      toast.success("Thanks. We will be in touch within one working day.");
    } catch (error) {
      console.error("quote submit error", error);
      toast.error("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <Seo title="Your quote request is in | Aisom" description="Thanks. We have your quote request and will reply within one working day." path="/quote" />
        <section className="wrap py-24">
          <h1 className="text-[28px] text-slate md:text-[36px]">Thanks, {form.name || "there"}. We have your request.</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ash">We will review your request and reply using the contact details you provided.</p>
          <div className="mt-8"><Link to="/" className="text-[13px] text-slate hover:underline">Back to the homepage</Link></div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo title="Get a fixed-price website quote | Aisom" description="Tell us about your business and get a fixed-price quote for a website built for South African SMEs." path="/quote" />
      <PageHeader index="QUOTE" title="Tell us about your business." lead="Share the essentials and we will review your request before confirming scope, price and timing." />

      <section className="wrap pb-24">
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="quote-name" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Name</label>
            <Input id="quote-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="quote-business" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Business name</label>
            <Input id="quote-business" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label htmlFor="quote-phone" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Phone or WhatsApp</label>
            <Input id="quote-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="quote-email" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Email</label>
            <Input id="quote-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="quote-package" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Package interest</label>
            <select id="quote-package" value={form.packageInterest} onChange={(e) => setForm({ ...form, packageInterest: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate" required>
              <option value="">Select a package</option>
              <option value="Starter">Starter</option>
              <option value="Business">Business</option>
              <option value="Growth">Growth</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>
          <div>
            <label htmlFor="quote-url" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Existing website URL</label>
            <Input id="quote-url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="quote-message" className="mb-2 block text-[12px] font-medium uppercase tracking-[0.12em] text-ash">Message</label>
            <Textarea id="quote-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={6} placeholder="Tell us what your business does, who you sell to, and what you want the website to do." />
          </div>
          <div className="md:col-span-2">
            <input type="hidden" name="company" value={form.company} onChange={() => undefined} />
            <label className="flex items-start gap-3 rounded-md border border-border p-3 text-[13px] leading-relaxed text-ash">
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1 h-4 w-4" />
              <span>I agree to Aisom contacting me about this enquiry and I understand my information is used according to the <Link to="/privacy-policy" className="font-medium text-slate underline">privacy policy</Link>.</span>
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? "Sending" : "Send request"}</Button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}
