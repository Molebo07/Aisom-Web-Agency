import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { organizationJsonLd } from "@/lib/siteConfig";
import { processSteps, tiers } from "@/data/site";
import { Reveal } from "@/components/site/Motion";

const services = [
  {
    index: "01",
    name: "Design",
    body: "We design the home page first, on desktop and mobile, so you see the real thing before a line of code is written.",
  },
  {
    index: "02",
    name: "Build",
    body: "Hand built pages that load fast on a phone and on mobile data. No drag and drop templates, no plugin sprawl.",
  },
  {
    index: "03",
    name: "Launch",
    body: "Domain, SSL, analytics and a sitemap submitted to Google. You get a short guide on how to run it.",
  },
];

const facts = [
  { value: "R3 000", label: "Starting price, fixed" },
  { value: "1 to 2", label: "Weeks to a live starter site" },
  { value: "100%", label: "Mobile first builds" },
  { value: "Gauteng", label: "Based in Johannesburg, working nationally" },
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
        title="Aisom | Websites for South African Businesses"
        description="Aisom designs and builds fast, mobile first websites for South African SMEs. Fixed pricing from R3 000 and a live site in one to four weeks."
        path="/"
        jsonLd={organizationJsonLd}
      />

      <section className="dark-section overflow-hidden bg-navy">
        <div className="wrap grid min-h-[720px] items-center gap-16 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <div>
            <motion.p className="section-index text-white/50" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              AISOM SYSTEMS / WEB DESIGN
            </motion.p>
            <motion.h1 className="mt-6 max-w-3xl text-5xl leading-[0.98] text-white md:text-7xl lg:text-8xl" initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}>
              Serious websites for serious businesses.
            </motion.h1>
            <motion.p className="mt-7 max-w-xl text-[15px] leading-relaxed text-white/65 md:text-[16px]" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
              Fixed-price websites for South African businesses that need to look credible, load fast, and bring in better enquiries.
            </motion.p>
            <motion.div className="mt-9 flex flex-wrap gap-3" initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.6 }}>
              <Button asChild size="lg"><Link to="/contact">Get a free quote</Link></Button>
              <Button asChild size="lg" variant="hero-outline" className="border-white/30 text-white hover:border-accent-blue"><Link to="/work">See our work</Link></Button>
            </motion.div>
          </div>

          <motion.div className="relative mx-auto w-full max-w-[620px]" initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 20 }} animate={reducedMotion ? undefined : { opacity: 1, scale: 1, y: [0, -5, 0], rotate: [0, 0.2, 0] }} transition={{ delay: 0.18, duration: 0.8, y: { delay: 1.5, duration: 7, repeat: Infinity, ease: "easeInOut" }, rotate: { delay: 1.5, duration: 7, repeat: Infinity, ease: "easeInOut" } }}>
            <div className="overflow-hidden rounded-lg border border-white/20 bg-[#f7f9fc] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
              <div className="flex h-10 items-center gap-2 border-b border-slate/10 bg-white px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" /><span className="h-2.5 w-2.5 rounded-full bg-[#f7c948]" /><span className="h-2.5 w-2.5 rounded-full bg-[#51cf66]" />
                <span className="ml-5 rounded-sm bg-slate/5 px-4 py-1 text-[9px] text-ash">{typedAddress}<span className="ml-0.5 text-accent-blue">|</span></span>
              </div>
              <div className="p-6 md:p-10">
                <motion.div className="h-2 w-20 bg-accent-blue" initial={reducedMotion ? false : { scaleX: 0, transformOrigin: "left" }} animate={reducedMotion ? undefined : { scaleX: [0, 1, 1, 0] }} transition={{ delay: 0.7, duration: 8, repeat: Infinity, repeatDelay: 1 }} />
                <motion.div className="mt-7 h-9 max-w-[360px] bg-slate" initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={reducedMotion ? undefined : { opacity: [0, 1, 1, 0], y: [10, 0, 0, -5] }} transition={{ delay: 0.9, duration: 8, repeat: Infinity, repeatDelay: 1 }} />
                <motion.div className="mt-3 h-3 max-w-[280px] bg-slate/20" initial={reducedMotion ? false : { opacity: 0 }} animate={reducedMotion ? undefined : { opacity: [0, 1, 1, 0] }} transition={{ delay: 1.05, duration: 8, repeat: Infinity, repeatDelay: 1 }} />
                <div className="mt-10 grid gap-3 sm:grid-cols-[1.3fr_0.7fr]">
                  <motion.div className="h-36 bg-accent-blue/15" initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={reducedMotion ? undefined : { opacity: [0, 1, 1, 0], y: [14, 0, 0, -5] }} transition={{ delay: 1.15, duration: 8, repeat: Infinity, repeatDelay: 1 }} />
                  <motion.div className="space-y-3" initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={reducedMotion ? undefined : { opacity: [0, 1, 1, 0], y: [14, 0, 0, -5] }} transition={{ delay: 1.28, duration: 8, repeat: Infinity, repeatDelay: 1 }}><div className="h-3 bg-slate/20" /><div className="h-3 w-4/5 bg-slate/20" /><div className="h-9 w-28 bg-accent-blue" /></motion.div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-right text-[11px] uppercase tracking-[0.18em] text-white/40">A better first impression, loading now</p>
          </motion.div>
        </div>
      </section>

      {/* Trust bar: facts only, no borrowed logos */}
      <section className="border-y border-border bg-secondary">
        <div className="wrap grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {facts.map((f) => (
            <Reveal key={f.label}>
              <p className="text-[22px] text-slate md:text-[26px]">{f.value}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ash">{f.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services summary */}
      <section className="wrap py-20">
        <p className="section-index">WHAT WE DO</p>
        <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[34px]">
          Three things, done properly.
        </h2>
        <div className="mt-12">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.08}>
              <article className={`group relative grid gap-5 border-t border-slate/15 py-16 md:grid-cols-[180px_minmax(0,620px)] md:gap-12 md:py-24 ${s.name === "Build" ? "md:py-28" : ""}`}>
                <p
                  aria-hidden="true"
                  className="select-none text-[112px] font-bold leading-[0.72] tracking-[-0.1em] text-slate/[0.07] transition-colors duration-500 group-hover:text-accent-blue/20 md:text-[164px]"
                  style={{ WebkitTextStroke: "1px rgba(26, 26, 26, 0.14)" }}
                >
                  {s.index}
                </p>
                <div className="max-w-2xl md:pt-3">
                  <h3 className={`text-3xl leading-tight text-slate md:text-5xl ${s.name === "Build" ? "md:max-w-xl" : ""}`}>{s.name}</h3>
                  <p className={`mt-5 text-[15px] leading-relaxed text-ash md:text-[16px] ${s.name === "Build" ? "md:max-w-xl" : "max-w-lg"}`}>{s.body}</p>
                  {s.name === "Build" && <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-accent-blue">The part that makes the difference</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Link
          to="/services"
          className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline"
        >
          See the full service breakdown <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Process teaser */}
      <section className="dark-section border-t border-white/10 bg-navy">
        <div className="wrap py-20">
          <p className="section-index text-white/50">HOW IT RUNS</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-white md:text-[34px]">
            Five steps from first call to live site.
          </h2>
          <div className="relative mt-16 md:mt-24">
            <motion.div
              aria-hidden="true"
              className="absolute left-3 top-0 h-full w-px origin-top bg-gradient-to-b from-accent-blue via-white/30 to-white/10 md:hidden"
              initial={reducedMotion ? false : { scaleY: 0 }}
              whileInView={reducedMotion ? undefined : { scaleY: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 top-5 hidden h-px w-full origin-left bg-gradient-to-r from-accent-blue via-white/30 to-white/10 md:block"
              initial={reducedMotion ? false : { scaleX: 0 }}
              whileInView={reducedMotion ? undefined : { scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="relative grid gap-10 pl-10 md:grid-cols-5 md:gap-5 md:pl-0">
              {processSteps.map((step) => (
                <Reveal key={step.index} delay={Number(step.index) * 0.06} className="relative md:pt-12">
                  <span className={`absolute left-[-35px] top-0 h-3 w-3 rounded-full border-2 border-navy bg-accent-blue md:left-0 md:top-0 ${step.name === "Build" ? "h-5 w-5 -translate-x-1" : ""}`} />
                  <p className="section-index text-white/50">{step.index} / 05</p>
                  <h3 className={`mt-3 text-xl text-white ${step.name === "Build" ? "font-bold text-accent-blue" : ""}`}>{step.name}</h3>
                  <p className="mt-2 text-[12px] text-white/55">{step.timeframe}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <Link
            to="/process"
            className="mt-8 inline-flex items-center gap-2 text-[13px] text-white hover:text-accent-blue hover:underline"
          >
            Read what happens in each step <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Work */}
      <section className="wrap py-20">
        <p className="section-index">WORK</p>
        <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[34px]">
          Aisom is new. Our first client sites are being built now.
        </h2>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ash">
          We would rather tell you that than fill this page with stock screenshots and invented
          results. What we can show you today is exactly how we work, what every package costs, and
          the standard we hold ourselves to on speed and mobile.
        </p>
        <Link
          to="/work"
          className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline"
        >
          See our build standard <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-border">
        <div className="wrap py-20">
          <p className="section-index">PRICING</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[34px]">
            You see the price before you talk to us.
          </h2>
          <div className="mt-12 grid items-start gap-10 md:grid-cols-[0.85fr_1.15fr_0.85fr] md:gap-8">
            {tiers.map((tier) => {
              const featured = tier.id === "business";
              return (
                <Reveal key={tier.id} delay={featured ? 0.08 : 0}>
                  <article className={`relative border-t pt-7 ${featured ? "-mt-5 border-accent-blue bg-navy px-7 pb-9 pt-10 text-white shadow-[0_20px_55px_rgba(59,110,246,0.2)] md:-mt-8" : "border-slate/25"}`}>
                    {featured && <p className="mb-7 text-[11px] uppercase tracking-[0.18em] text-accent-blue">Most chosen</p>}
                    <h3 className={`text-[16px] ${featured ? "text-white" : "text-slate"}`}>{tier.name}</h3>
                    <p className={`mt-5 text-5xl font-bold leading-none tracking-[-0.06em] ${featured ? "text-white md:text-6xl" : "text-slate md:text-5xl"}`}>{tier.price}</p>
                    <p className={`mt-2 text-[12px] ${featured ? "text-white/55" : "text-ash"}`}>{tier.priceNote}</p>
                    <p className={`mt-7 text-[13px] leading-relaxed ${featured ? "text-white/70" : "text-ash"}`}>{tier.summary}</p>
                    <p className={`mt-7 text-[12px] ${featured ? "text-white/55" : "text-ash"}`}>{tier.timeline}</p>
                    {featured && <Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-[13px] text-accent-blue hover:underline">Choose Business <ArrowRight className="h-3.5 w-3.5" /></Link>}
                  </article>
                </Reveal>
              );
            })}
          </div>
          <Link
            to="/pricing"
            className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline"
          >
            Compare what is included <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
