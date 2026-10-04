import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { serviceFaqs, tiers } from "@/data/site";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: serviceFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Services() {
  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="Web Design Services for SMEs | Aisom"
        description="One page sites, multi page business sites and online stores for South African SMEs. See what is included in each package and what it costs."
        path="/services"
        jsonLd={[breadcrumbJsonLd(crumbs), faqJsonLd]}
      />

      <PageHeader
        index="SERVICES"
        title="Website packages built around what your buyers look for."
        lead="Choose a focused one-page site, a multi-page business site, or a larger build scoped around the way your business works. Each package lists what is included and what sits outside the price."
      />

      <section className="wrap pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.id} className="flex flex-col rounded-md border-border shadow-none">
              <CardContent className="flex flex-1 flex-col p-7">
                <h2 className="text-[18px] text-slate">{tier.name}</h2>
                <p className="mt-4 text-[28px] text-slate">{tier.price}</p>
                <p className="mt-1 text-[12px] text-ash">{tier.priceNote}</p>
                <p className="mt-5 text-[13px] leading-relaxed text-ash">{tier.summary}</p>

                <p className="mt-7 text-[12px] font-medium text-slate">Who it is for</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ash">{tier.who}</p>

                <p className="mt-7 text-[12px] font-medium text-slate">What you get</p>
                <ul className="mt-3 space-y-2">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ash">
                      <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-slate" />
                      {item}
                    </li>
                  ))}
                </ul>

                {tier.excludes && (
                  <>
                    <p className="mt-7 text-[12px] font-medium text-slate">Not included</p>
                    <ul className="mt-3 space-y-2">
                      {tier.excludes.map((item) => (
                        <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-ash">
                          <X className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ash" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="mt-7 text-[12px] text-ash">{tier.timeline}</p>
                <div className="mt-7 pt-2">
                  <Button asChild className="w-full">
                    <Link to="/contact">Ask about {tier.name}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-[13px] text-ash">
          Full price breakdown and payment terms are on the{" "}
          <Link to="/pricing" className="text-slate hover:underline">
            pricing page
          </Link>
          . If you want to see how a build runs week by week, read the{" "}
          <Link to="/process" className="text-slate hover:underline">
            process
          </Link>
          .
        </p>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="wrap py-20">
          <p className="section-index">QUESTIONS</p>
          <h2 className="mt-4 text-[26px] leading-tight text-slate md:text-[32px]">
            The things owners ask us first.
          </h2>
          <Accordion type="single" collapsible className="mt-10 max-w-3xl">
            {serviceFaqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-[15px] text-slate">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-ash">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
