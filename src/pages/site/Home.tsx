import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { organizationJsonLd } from "@/lib/siteConfig";
import { processSteps, tiers } from "@/data/site";

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
  { value: "Gauteng", label: "Based in Tembisa, working nationally" },
];

export default function Home() {
  return (
    <SiteLayout cta={false}>
      <Seo
        title="Aisom | Websites for South African Businesses"
        description="Aisom designs and builds fast, mobile first websites for South African SMEs. Fixed pricing from R3 000 and a live site in one to four weeks."
        path="/"
        jsonLd={organizationJsonLd}
      />

      {/* Hero */}
      <section className="wrap py-20 md:py-28">
        <p className="section-index">AISOM SYSTEMS / WEB DESIGN</p>
        <h1 className="mt-6 max-w-4xl text-[34px] leading-[1.08] text-slate md:text-[58px]">
          Websites for South African businesses that need to look serious online.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash md:text-[16px]">
          We build for owner run companies in Gauteng and across South Africa. Fixed price, no
          monthly lock in, and a site that is live in one to four weeks instead of one to four
          months.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contact">Get a free quote</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/work">See our work</Link>
          </Button>
        </div>
      </section>

      {/* Trust bar: facts only, no borrowed logos */}
      <section className="border-y border-border bg-secondary">
        <div className="wrap grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}>
              <p className="text-[22px] text-slate md:text-[26px]">{f.value}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ash">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services summary */}
      <section className="wrap py-20">
        <p className="section-index">WHAT WE DO</p>
        <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[34px]">
          Three things, done properly.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <Card key={s.name} className="rounded-md border-border shadow-none">
              <CardContent className="p-7">
                <p className="section-index">{s.index}</p>
                <h3 className="mt-4 text-[18px] text-slate">{s.name}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">{s.body}</p>
              </CardContent>
            </Card>
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
      <section className="border-t border-border bg-secondary">
        <div className="wrap py-20">
          <p className="section-index">HOW IT RUNS</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[34px]">
            Five steps from first call to live site.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-5">
            {processSteps.map((step) => (
              <div key={step.index} className="bg-background p-6">
                <p className="section-index">
                  {step.index} / 05
                </p>
                <h3 className="mt-4 text-[16px] text-slate">{step.name}</h3>
                <p className="mt-2 text-[12px] text-ash">{step.timeframe}</p>
              </div>
            ))}
          </div>
          <Link
            to="/process"
            className="mt-8 inline-flex items-center gap-2 text-[13px] text-slate hover:underline"
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
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.id} className="rounded-md border-border shadow-none">
                <CardContent className="p-7">
                  <h3 className="text-[16px] text-slate">{tier.name}</h3>
                  <p className="mt-4 text-[26px] text-slate">{tier.price}</p>
                  <p className="mt-1 text-[12px] text-ash">{tier.priceNote}</p>
                  <p className="mt-5 text-[13px] leading-relaxed text-ash">{tier.summary}</p>
                  <p className="mt-5 text-[12px] text-ash">{tier.timeline}</p>
                </CardContent>
              </Card>
            ))}
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
