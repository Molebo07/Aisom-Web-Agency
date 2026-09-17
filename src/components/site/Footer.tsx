import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/site/Logo";
import { siteConfig } from "@/lib/siteConfig";
import { supabase } from "@/integrations/supabase/client";

const columns = [
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/process", label: "Process" },
      { to: "/work", label: "Work" },
      { to: "/blog", label: "Blog" },
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
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubscribe(e: FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("leads").insert({
      kind: "newsletter",
      name: name.trim() || null,
      email: parsed.data.toLowerCase(),
    });
    setBusy(false);
    if (error && !`${error.message}`.includes("duplicate")) {
      toast.error("That did not go through. Please try again.");
      return;
    }
    setDone(true);
    toast.success("You are on the list.");
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
            <p>
              <a className="hover:text-accent-blue hover:underline" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </a>
            </p>
            {siteConfig.phone && (
              <p>
                <a
                  className="hover:text-accent-blue hover:underline"
                  href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                >
                  {siteConfig.phone}
                </a>
              </p>
            )}
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
              One short email a month. Practical website tips for SA business owners. No sales spam.
            </p>
          </div>
          {done ? (
            <p className="text-[13px] text-white md:justify-self-end">
              Thanks. Check your inbox for the next one.
            </p>
          ) : (
            <form onSubmit={onSubscribe} className="flex flex-col gap-2 sm:flex-row">
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
              <Button type="submit" disabled={busy}>
                {busy ? "Sending" : "Subscribe"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[12px] text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            {siteConfig.legalName} · Reg. {siteConfig.registration}
          </p>
          <p>© {new Date().getFullYear()} Aisom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
