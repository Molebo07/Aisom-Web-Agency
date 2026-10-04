import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { organizationJsonLd } from "@/lib/siteConfig";
import { processSteps, tiers } from "@/data/site";
import { Reveal } from "@/components/site/Motion";

const services = [
  { index: "01", name: "Design", body: "We decide what matters first: your services, proof, pricing and the route a buyer should take on mobile." },
  { index: "02", name: "Build", body: "Hand-built pages that stay fast on mobile data and clear enough for a first-time visitor to trust in seconds." },
  { index: "03", name: "Launch", body: "You get a live site, a clean handover and the basics to show up in search without the usual fluff." },
];

const facts = [
  { value: "From R3 000", label: "Fixed-price website packages" },
  { value: "Scope first", label: "Price and start date agreed before work begins" },
  { value: "You own it", label: "Site, content and domain" },
  { value: "Gauteng", label: "Johannesburg based, working nationally" },
];

const reasons = [
  "A written price before work begins",
  "Designed for mobile-first browsing",
  "You own your site, domain and content",
  "Direct communication with the people doing the work",
];

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [typedAddress, setTypedAddress] = useState("aisom.co.za");

  useEffect(() => {
    if (reducedMotion) return;
    let index = 0;
    setTypedAddress("");
    const timer = window.setInterval(() => {
      index += 1;
      setTypedAddress("aisom.co.za".slice(0, index));
      if (index === "aisom.co.za".length) window.clearInterval(timer);
    }, 85);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <SiteLayout cta={false}>
      <Seo
        title="Website Design for Gauteng Businesses | Aisom"
        description="Fixed-price websites for South African businesses. From R3 000, built mobile-first, and you own everything we build."
        path="/"
        jsonLd={organizationJsonLd}
      />

      <section className="dark-section overflow-hidden bg-navy">
        <div className="wrap grid min-h-[720px] items-center gap-16 py-20 lg:grid-cols-[0.94fr_1.06fr] lg:py-28">
          <div>
            <motion.p className="section-index text-white/50" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              WEB DESIGN, JOHANNESBURG
            </motion.p>
            <motion.h1 className="mt-6 max-w-3xl text-white" initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}>
              Websites that make your business look as established as it is.
            </motion.h1>
            <motion.p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/70 md:text-[17px]" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
              Fixed-price websites for South African businesses. From R3 000, built mobile-first, and you own everything we build.
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap gap-3" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }}>
              <Button asChild size="lg"><Link to="/contact">Get a free quote</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-transparent text-white hover:border-white hover:bg-white/5"><Link to="/snapshot">Get a free website snapshot</Link></Button>
            </motion.div>
          </div>

          <motion.div className="relative mx-auto w-full max-w-[620px]" initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, scale: 1, y: [0, -5, 0], rotate: [0, 0.2, 0] }} transition={{ delay: 0.18, duration: 0.8, y: { delay: 1.5, duration: 7, repeat: Infinity, ease: "easeInOut" }, rotate: { delay: 1.5, duration: 7, repeat: Infinity, ease: "easeInOut" } }}>
            <div className="overflow-hidden rounded-xl border border-white/15 bg-[#f7f9fc] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
              <div className="flex h-11 items-center gap-2 border-b border-slate/10 bg-white px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" /><span className="h-2.5 w-2.5 rounded-full bg-[#f7c948]" /><span className="h-2.5 w-2.5 rounded-full bg-[#51cf66]" />
                <span className="ml-5 rounded-sm bg-slate/5 px-4 py-1 text-[9px] text-slate/70">{typedAddress}<span className="ml-0.5 text-accent-blue">|</span></span>
              </div>
              <div className="p-6 md:p-8">
                <div className="rounded-md border border-border bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate/50">CONCEPT</p>
                      <h3 className="mt-2 text-xl text-slate">Industrial supplier</h3>
                    </div>
                    <span className="rounded-full border border-slate/10 bg-slate/5 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-slate/70">Mobile first</span>
                  </div>
                  <div className="h-2 w-24 rounded-full bg-primary/20">
                    <div className="h-full w-3/5 rounded-full bg-primary" />
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                    <div>
                      <div className="h-8 w-2/3 rounded bg-slate/10" />
                      <div className="mt-3 h-3 w-full rounded bg-slate/5" />
                      <div className="mt-2 h-3 w-5/6 rounded bg-slate/5" />
                    </div>
                    <div className="rounded border border-slate/10 bg-slate/5 p-3">
                      <div className="h-3 w-10 rounded bg-slate/10" />
                      <div className="mt-3 h-16 rounded bg-primary/10" />
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    <div className="h-16 rounded bg-slate/5" />
                    <div className="h-16 rounded bg-slate/5" />
                    <div className="h-16 rounded bg-slate/5" />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-right text-[11px] uppercase tracking-[0.18em] text-white/40">Concept layout / not a live client site</p>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="wrap grid gap-8 py-10 md:grid-cols-4">
          {facts.map((fact) => (
            <Reveal key={fact.label}>
              <p className="text-[22px] font-medium text-slate md:text-[26px]">{fact.value}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ash">{fact.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap py-20">
        <p className="section-index">WHY AISOM</p>
        <h2 className="mt-4 max-w-2xl text-slate">A simple website should not be complicated.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason} className="rounded-md border border-border bg-background p-5 shadow-sm">
              <Check className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="mt-4 text-[15px] leading-relaxed text-slate">{reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap py-20">
        <p className="section-index">WHAT WE DO</p>
        <h2 className="mt-4 max-w-2xl text-slate">Three things, done properly.</h2>
        <div className="mt-12">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={i * 0.08}>
              <article className="group grid gap-5 border-t border-slate/15 py-14 md:grid-cols-[180px_minmax(0,620px)] md:gap-12 md:py-16">
                <p aria-hidden="true" className="select-none text-[96px] font-bold leading-[0.72] tracking-[-0.1em] text-slate/7 md:text-[150px]">
                  {service.index}
                </p>
                <div className="max-w-2xl md:pt-3">
                  <h3 className="text-[28px] text-slate md:text-[40px]">{service.name}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-ash md:text-[16px]">{service.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Link to="/services" className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline">See the full service breakdown <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="dark-section border-t border-white/10 bg-navy">
        <div className="wrap py-20">
          <p className="section-index text-white/50">HOW IT RUNS</p>
          <h2 className="mt-4 max-w-2xl text-white">Five steps from brief to live site.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {processSteps.map((step) => (
              <Reveal key={step.index} className="rounded-md border border-white/10 bg-white/3 p-5">
                <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/55">{step.index} / 05</p>
                <h3 className="mt-4 text-[20px] text-white">{step.name}</h3>
                <p className="mt-2 text-[12px] text-white/55">{step.timeframe.startsWith("[CONFIRM:") ? "Timing agreed before the project starts" : step.timeframe}</p>
              </Reveal>
            ))}
          </div>
          <Link to="/process" className="mt-8 inline-flex items-center gap-2 text-[13px] text-white hover:text-primary hover:underline">Read the process <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      <section className="wrap py-20">
        <p className="section-index">WORK</p>
        <h2 className="mt-4 max-w-2xl text-slate">Honest proof, not fake screenshots.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Engineering / fabrication / industrial supplier",
            "Plumbing and electrical contractor",
            "Accountant or consultant",
            "Guesthouse or venue",
          ].map((label) => (
            <div key={label} className="rounded-md border border-border bg-secondary p-5">
              <div className="mb-5 h-28 rounded bg-slate/5" aria-hidden="true" />
              <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-slate/60">Concept</p>
              <p className="mt-3 text-[15px] text-slate">{label}</p>
            </div>
          ))}
        </div>
        <Link to="/work" className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline">See our concept sites <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <section className="border-t border-border">
        <div className="wrap py-20">
          <p className="section-index">PRICING</p>
          <h2 className="mt-4 max-w-2xl text-slate">You see the price before you talk to us.</h2>
          <div className="mt-12 grid items-start gap-6 md:grid-cols-3">
            {tiers.map((tier) => {
              const featured = tier.id === "business";
              return (
                <article key={tier.id} className={`rounded-md border p-7 ${featured ? "border-primary bg-navy text-white shadow-sm" : "border-border bg-background"}`}>
                  {featured && <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-primary">Recommended for most businesses</p>}
                  <h3 className={`text-[18px] ${featured ? "text-white" : "text-slate"}`}>{tier.name}</h3>
                  <p className={`mt-5 text-5xl font-bold leading-none tracking-[-0.06em] ${featured ? "text-white" : "text-slate"}`}>{tier.price}</p>
                  <p className={`mt-2 text-[12px] ${featured ? "text-white/60" : "text-ash"}`}>{tier.priceNote}</p>
                  <p className={`mt-4 text-[13px] leading-relaxed ${featured ? "text-white/75" : "text-ash"}`}>{tier.summary}</p>
                  <p className={`mt-5 text-[12px] ${featured ? "text-white/60" : "text-ash"}`}>{tier.timeline}</p>
                  <div className="mt-6">
                    <Button asChild className="w-full">
                      <Link to="/contact">Choose {tier.name}</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <Link to="/pricing" className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline">Compare what is included <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>
    </SiteLayout>
  );
}
