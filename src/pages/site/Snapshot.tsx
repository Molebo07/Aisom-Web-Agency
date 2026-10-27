import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { track, trackGenerateLead } from "@/lib/analytics";
import { submitLead } from "@/lib/submitLead";

const schema = z.object({
  name: z.string().trim().max(160).optional().or(z.literal("")),
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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    track("snapshot_start");
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    const rawUrl = form.websiteUrl.trim();
    const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const parsed = schema.safeParse({ ...form, websiteUrl: normalizedUrl, consent: form.consent });
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0];
      const message = (first && first[0]) || "Please check the information and try again.";
      setErrorMessage(message);
      toast.error(message);
      const firstInvalidField = Object.keys(parsed.error.flatten().fieldErrors)[0];
      if (firstInvalidField) document.getElementById(`snapshot-${firstInvalidField}`)?.focus();
      return;
    }

    const hostname = new URL(parsed.data.websiteUrl).hostname.replace(/^www\./, "").toLowerCase();
    const socialDomains = ["facebook.com", "instagram.com", "linkedin.com", "tiktok.com", "x.com"];
    if (socialDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
      const message = "Add your business website URL. Social media pages cannot be reviewed as a website.";
      setErrorMessage(message);
      document.getElementById("snapshot-websiteUrl")?.focus();
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
      track("snapshot_submit");
      trackGenerateLead({ value: 0, form_name: "snapshot" });
      setDone(true);
      toast.success("Thanks. We have received your website snapshot request.");
    } catch (error) {
      console.error("snapshot submit error", error);
      const rateLimited = error instanceof Error && /too many requests/i.test(error.message);
      const message = rateLimited
        ? "Too many checks from this connection. Try again later."
        : "We could not send your request. Check your details and try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <Seo title="Your website snapshot request was sent | Aisom" description="Thanks. We have received your website snapshot request." path="/snapshot" />
        <section className="wrap py-24">
          <h1 className="text-[28px] text-slate md:text-[36px]">We have your website review request.</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ash">We will review your request and contact you by email about next steps.</p>
          <Button asChild className="mt-8 min-h-11"><Link to="/quote">Get a quote to improve your site</Link></Button>
          <p className="mt-6 text-sm text-ash">
            Interested in an assistant for customer questions?{" "}
            <Link to="/assistant" className="font-medium text-slate underline">Read about Aisom Assistant early access</Link>.
          </p>
          <div className="mt-8"><Link to="/" className="text-[13px] text-slate hover:underline">Back to the homepage</Link></div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo title="Request a free website snapshot | Aisom" description="Request a free human-reviewed snapshot of your current business website." path="/snapshot" />
      <section className="wrap py-20">
        <div className="mx-auto max-w-2xl rounded-md border border-border bg-background p-8 shadow-sm">
          <p className="section-index">FREE WEBSITE SNAPSHOT</p>
          <h1 className="mt-4 text-[28px] text-slate md:text-[38px]">Request a free website snapshot</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ash">Share your website and email. We will review your request and follow up about a one-page snapshot. This is a human-reviewed request, not an instant automated score.</p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4" noValidate>
            {errorMessage && <p role="alert" className="rounded-sm border border-red-700/30 bg-red-50 p-3 text-sm text-red-900">{errorMessage}</p>}
            <div>
              <label htmlFor="snapshot-name" className="mb-2 block text-sm font-medium text-slate">Name (optional)</label>
              <Input id="snapshot-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="min-h-11" />
            </div>
            <div>
              <label htmlFor="snapshot-email" className="mb-2 block text-sm font-medium text-slate">Email</label>
              <Input id="snapshot-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="min-h-11" required />
            </div>
            <div>
              <label htmlFor="snapshot-websiteUrl" className="mb-2 block text-sm font-medium text-slate">Website URL</label>
              <Input id="snapshot-websiteUrl" inputMode="url" autoComplete="url" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="yourbusiness.co.za" className="min-h-11" required />
            </div>
            <div>
              <input type="hidden" name="company" value={form.company} onChange={() => undefined} />
              <label className="flex min-h-11 items-start gap-3 rounded-md border border-border p-3 text-sm leading-relaxed text-ash">
                <input id="snapshot-consent" type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-1 h-5 w-5 shrink-0" />
                <span>I agree to Aisom using my details for this review and to the terms in the <Link to="/privacy-policy" className="font-medium text-slate underline">privacy policy</Link>.</span>
              </label>
            </div>
            <Button type="submit" disabled={busy} className="min-h-11 w-full">{busy ? "Sending request…" : "Request my free snapshot"}</Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
