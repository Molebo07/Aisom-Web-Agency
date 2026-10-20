import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { organizationJsonLd } from "@/lib/siteConfig";
import { tiers } from "@/data/site";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { Reveal } from "@/components/site/Motion";

const services = [
  { index: "01", name: "Design", body: "We decide what matters first: your services, proof, pricing and the route a buyer should take on mobile." },
  { index: "02", name: "Build", body: "Hand-built pages designed to stay clear and usable on a phone, including on mobile data." },
  { index: "03", name: "Launch", body: "We test the site, connect the essentials and hand it over so you know how it works." },
];

const facts = [
  { value: "From R3 000", label: "Website packages" },
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
  return (
    <SiteLayout cta={false}>
      <Seo
        title="Website Design for Gauteng Businesses | Aisom"
        description="Fixed-price websites for South African businesses. From R3 000, built mobile-first, and you own everything we build."
        path="/"
        jsonLd={organizationJsonLd}
      />

      <section data-theme="dark" className="hero-section dark-section relative overflow-hidden bg-navy">
        <div className="hero-art" aria-hidden="true" />
        <div className="wrap relative grid items-center gap-12 py-16 md:py-20 lg:min-h-[680px] lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="lg:col-span-7">
            <p className="section-index text-white/60">WEB DESIGN, JOHANNESBURG</p>
            <h1 className="mt-6 max-w-3xl text-balance text-white">
              Websites that make your business look as established as it is.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Fixed-price websites for South African businesses. From R3 000, built mobile-first, and you own everything we build.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12">
                <Link to="/quote">Get a free quote</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="min-h-12 bg-white text-[#0A111F] hover:bg-white/90">
                <Link to="/snapshot">Request your free website snapshot</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/65">
              A free review of your current website. No obligation.
            </p>
            <p className="mt-5 text-sm text-white/80">
              Written price before work begins <span aria-hidden="true">·</span> You own your site
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="concept-browser">
              <div className="flex h-12 items-center gap-2 border-b border-black/10 bg-white px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef6a67]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f2c14e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#53b879]" />
                <span className="ml-3 rounded-sm bg-black/5 px-3 py-1 font-mono text-xs text-black/60">aisom.co.za</span>
                <span className="ml-auto font-mono text-[11px] tracking-[0.08em] text-black/55">MOBILE FIRST</span>
              </div>
              <div className="concept-page">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <span className="font-mono text-xs font-semibold tracking-[0.12em] text-[#0A111F]">INDUSTRIAL SUPPLIER</span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-black/50">CONCEPT</span>
                </div>
                <div className="grid gap-6 py-7 sm:grid-cols-[1fr_0.7fr] sm:items-end">
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-[#405FFF]">SUPPLIES FOR THE WORK AHEAD</p>
                    <p className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#0A111F]">
                      Tools and supplies, made easy to find.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-black/65">
                      A clear product range and a straightforward way to ask for a quote.
                    </p>
                    <span className="mt-5 inline-flex min-h-11 items-center bg-[#405FFF] px-4 text-sm font-medium text-white">
                      Request a quote
                    </span>
                  </div>
                  <div className="concept-illustration" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="grid border-t border-black/10 pt-4 sm:grid-cols-3">
                  {["Fasteners", "Safety gear", "Hand tools"].map((item, index) => (
                    <div key={item} className={`py-3 text-sm font-medium text-[#0A111F] ${index > 0 ? "sm:border-l sm:border-black/10 sm:pl-4" : ""}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-right font-mono text-xs tracking-[0.1em] text-white/55">
              CONCEPT LAYOUT · NOT A LIVE CLIENT SITE
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary" aria-label="Aisom at a glance">
        <div className="wrap grid grid-cols-2 md:grid-cols-4">
          {facts.map((fact, index) => (
            <div key={fact.label} className={`stat-item ${index % 2 === 1 ? "stat-item-even" : ""}`}>
              <p className="font-mono text-lg font-medium tracking-[-0.04em] text-slate md:text-xl">{fact.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-ash">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap py-16 md:py-24">
        <p className="statement-band">
          A <strong>written price</strong> before work begins. A site <strong>you own</strong>. The people doing the work, <strong>one message away</strong>.
        </p>
        <div className="mt-20 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <p className="section-index">WHY AISOM</p>
            <h2 className="mt-4 max-w-lg text-slate">A simple website should not be complicated.</h2>
          </div>
          <ul className="ruled-list">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-4">
                <Check className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wrap py-12 md:py-20">
        <p className="section-index">WHAT WE DO</p>
        <h2 className="mt-4 max-w-2xl text-slate">Three things, done properly.</h2>
        <div className="mt-8">
          {services.map((service, index) => (
            <Reveal key={service.name} delay={index * 0.08}>
              <article className="numbered-row">
                <p aria-hidden="true" className="numbered-row-index">{service.index}</p>
                <div>
                  <h3 className="text-2xl text-slate md:text-3xl">{service.name}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-ash">{service.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Link to="/services" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline">
          See the full service breakdown <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section data-theme="dark" className="dark-section bg-navy">
        <div className="wrap py-16 md:py-24">
          <p className="section-index text-white/60">HOW IT RUNS</p>
          <h2 className="mt-4 max-w-2xl text-white">Five steps from brief to live site.</h2>
          <div className="mt-10">
            <ProcessTimeline compact />
          </div>
          <Link to="/process" className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white hover:underline">
            Read the full process <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="wrap py-16 md:py-24">
        <p className="section-index">WORK</p>
        <h2 className="mt-4 max-w-2xl text-slate">Honest proof, not fake screenshots.</h2>
        <div className="mt-8 grid gap-8 border-y border-border py-7 md:grid-cols-2">
          <div>
            <p className="font-medium text-slate">Concept layouts</p>
            <p className="mt-2 text-sm leading-relaxed text-ash">The industrial supplier preview above is a concept, not a client site.</p>
          </div>
          <div>
            <p className="font-medium text-slate">Client work</p>
            <p className="mt-2 text-sm leading-relaxed text-ash">No client sites have been published yet. We will share real work when it is ready.</p>
          </div>
        </div>
        <Link to="/work" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline">
          See how we work <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="border-t border-border">
        <div className="wrap py-16 md:py-24">
          <p className="section-index">PRICING</p>
          <h2 className="mt-4 max-w-2xl text-slate">You see the price before you talk to us.</h2>
          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
            {tiers.map((tier) => {
              const featured = tier.id === "business";
              return (
                <article key={tier.id} className={`pricing-tier ${featured ? "pricing-tier-featured" : ""}`}>
                  {featured && <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#7A93FF]">Recommended for most businesses</p>}
                  <h3 className={`text-lg ${featured ? "text-white" : "text-slate"}`}>{tier.name}</h3>
                  <p className={`mt-5 text-4xl font-semibold leading-none tracking-[-0.05em] ${featured ? "text-white" : "text-slate"}`}>{tier.price}</p>
                  <p className={`mt-2 text-sm ${featured ? "text-white/65" : "text-ash"}`}>{tier.priceNote}</p>
                  <p className={`mt-4 text-base leading-relaxed ${featured ? "text-white/75" : "text-ash"}`}>{tier.summary}</p>
                  <p className={`mt-6 border-t pt-4 text-base font-medium ${featured ? "border-white/15 text-white" : "border-border text-slate"}`}>{tier.timeline}</p>
                  <Button asChild className="mt-6 min-h-11 w-full" variant={featured ? "secondary" : "default"}>
                    <Link to={`/quote?package=${tier.id}`}>Get a quote</Link>
                  </Button>
                </article>
              );
            })}
          </div>
          <Link to="/pricing" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline">
            Compare what is included <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section data-theme="dark" className="dark-section philosophy-section bg-navy">
        <div className="wrap py-16 md:py-24">
          <p className="section-index text-white/60">WHAT YOU CAN EXPECT</p>
          <div className="mt-7">
            {[
              "A written price before work begins.",
              "You own your site, domain and content.",
              "You deal directly with the people doing the work.",
            ].map((promise) => (
              <p key={promise} className="philosophy-statement">{promise}</p>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="dark-section bg-navy">
        <div className="wrap flex flex-col items-start gap-6 border-t border-white/15 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <p className="section-index text-white/60">START WITH A CONVERSATION</p>
            <h2 className="mt-3 max-w-2xl text-white">Tell us about your business. We’ll send a written price.</h2>
          </div>
          <Button asChild size="lg" className="min-h-12 shrink-0">
            <Link to="/quote">Get a free quote</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
