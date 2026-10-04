import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/Logo";
import { siteConfig } from "@/lib/siteConfig";
import { submitLead } from "@/lib/submitLead";

const columns = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/process", label: "Process" },
      { to: "/work", label: "Work" },
      { to: "/services", label: "Services" },
    ],
  },
  {
    title: "Offer",
    links: [
      { to: "/services", label: "Services" },
      { to: "/pricing", label: "Pricing" },
      { to: "/contact", label: "Get a quote" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy-policy", label: "Privacy policy" },
      { to: "/terms-of-service", label: "Terms of service" },
    ],
  },
];

const emailSchema = z.string().trim().email("Enter a valid email address").max(254);

export function Footer() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!marketingConsent) {
      toast.error("Please agree to receive email updates.");
      return;
    }
    setBusy(true);
    try {
      await submitLead({
        kind: "newsletter",
        name: name.trim(),
        email: parsed.data.toLowerCase(),
        pagePath: "/footer",
        marketingConsent: true,
      });
      setDone(true);
      toast.success("Your email updates opt-in has been recorded.");
    } catch (error) {
      console.error("newsletter submit error", error);
      toast.error("That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="dark-section border-t border-white/10 bg-navy text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/60">
            We build fast, professional websites for South African businesses.
          </p>
          <div className="mt-6 space-y-1 text-[13px] text-white/60">
            <p className="text-white">{siteConfig.legalName}</p>
            <p>
              {siteConfig.address.street}, {siteConfig.address.locality},{" "}
              {siteConfig.address.region}, {siteConfig.address.postalCode}
            </p>
            <p>Reg. {siteConfig.registration}</p>
            {!siteConfig.vatNumber.startsWith("[CONFIRM:") && <p>VAT {siteConfig.vatNumber}</p>}
            <p>
              <a className="hover:text-accent-blue hover:underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </p>
            {siteConfig.phone && !siteConfig.phone.startsWith("[CONFIRM:") && (
              <p>
                <a
                  className="hover:text-accent-blue hover:underline"
                  href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                >
                  {siteConfig.phone}
                </a>
              </p>
            )}
            {siteConfig.openingHours && !siteConfig.openingHours.startsWith("[CONFIRM:") && <p>{siteConfig.openingHours}</p>}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="section-index uppercase text-white/50">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.to}>
                    <Link to={link.to} className="text-[13px] text-white/60 hover:text-white hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[14px] font-medium text-white">Updates from Aisom</p>
            <p className="mt-1 text-[13px] text-white/60">
                Optional practical website updates for South African business owners.
            </p>
          </div>
          {done ? (
            <p className="text-[13px] text-white md:justify-self-end">
              Thanks. Your opt-in has been recorded.
            </p>
          ) : (
            <form onSubmit={onSubscribe} className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
              <label className="sr-only" htmlFor="footer-name">
                Name (optional)
              </label>
              <Input
                id="footer-name"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="sm:max-w-[160px]"
              />
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <Input
                id="footer-email"
                type="email"
                required
                placeholder="you@business.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="flex items-start gap-2 text-[12px] leading-relaxed text-white/60 sm:col-span-3">
                <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />
                <span>I agree to receive email updates from Aisom. I can withdraw consent by emailing <a href={`mailto:${siteConfig.email}`} className="text-white underline">{siteConfig.email}</a>. See the <Link to="/privacy-policy" className="text-white underline">privacy policy</Link>.</span>
              </label>
              <Button type="submit" disabled={busy} className="sm:col-start-3">
                {busy ? "Sending" : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[12px] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            {siteConfig.legalName} · Reg. {siteConfig.registration} · VAT {siteConfig.vatNumber}
          </p>
          <p>© {new Date().getFullYear()} Aisom. All rights reserved.</p>
          <button type="button" onClick={() => window.dispatchEvent(new Event("aisom:open-privacy-choices"))} className="self-start underline hover:text-white md:self-auto">Cookie settings</button>
        </div>
      </div>
    </footer>
  );
}
