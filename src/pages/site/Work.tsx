import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/work" },
];

const industries = ["All", "Trades and services", "Retail", "Professional services", "Hospitality"];

// No client work is live yet. These are the build slots we are quoting on now.
// Nothing here claims a finished project or a result we have not produced.
const slots = [
  {
    industry: "Trades and services",
    title: "Plumbing and electrical contractors",
    body: "A one page site that answers the three questions every caller asks: what areas you cover, what you charge to come out, and how fast you can get there.",
  },
  {
    industry: "Retail",
    title: "Independent retailers",
    body: "A product or catalogue site with your stock, your store hours and a map, plus an online store when you are ready to sell beyond the counter.",
  },
  {
    industry: "Professional services",
    title: "Accountants, brokers and consultants",
    body: "A credibility site. Services, team, qualifications and a contact form that lands in your inbox with enough detail to price the job.",
  },
  {
    industry: "Hospitality",
    title: "Guesthouses and venues",
    body: "Photos that load fast on a phone, rates that are easy to find, and an enquiry or booking form that does not lose the guest halfway.",
  },
];

const standard = [
  { index: "01", label: "Loads in under 3 seconds on a phone on mobile data" },
  { index: "02", label: "Every page tested on a real Android handset before launch" },
  { index: "03", label: "Titles, descriptions and a sitemap submitted to Google at launch" },
  { index: "04", label: "Forms tested end to end so no enquiry is ever silently lost" },
];

export default function Work() {
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? slots : slots.filter((s) => s.industry === filter);

  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="Our Work and Build Standard | Aisom"
        description="Aisom is a new South African web design studio. See the industries we build for and the standard every site we ship has to meet."
        path="/work"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="WORK"
        title="Our first client sites are in build."
        lead="Aisom launched in 2026. Rather than dress this page up with stock screenshots and invented numbers, here is what we are building, for whom, and the standard every site has to clear before it goes live."
      />

      <section className="wrap pb-20">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by industry">
          {industries.map((ind) => (
            <Button
              key={ind}
              role="tab"
              aria-selected={filter === ind}
              variant={filter === ind ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(ind)}
              className="text-[12px]"
            >
              {ind}
            </Button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {visible.map((slot) => (
            <Card key={slot.title} className="rounded-md border-border shadow-none">
              <CardContent className="p-7">
                <div className="flex items-center justify-between gap-4">
                  <Badge variant="secondary" className="rounded-sm text-[11px] font-normal">
                    {slot.industry}
                  </Badge>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-ash">
                    Coming soon
                  </span>
                </div>
                <h2 className="mt-5 text-[18px] text-slate">{slot.title}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">{slot.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="wrap py-20">
          <p className="section-index">BUILD STANDARD</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[32px]">
            What we hold every site to, client one included.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
            {standard.map((s) => (
              <div key={s.index} className="bg-background p-7">
                <p className="section-index">{s.index} / 04</p>
                <p className="mt-4 text-[15px] leading-relaxed text-slate">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[13px] text-ash">
            Want to be one of the first sites on this page? Start with{" "}
            <Link to="/pricing" className="text-slate hover:underline">
              pricing
            </Link>{" "}
            or{" "}
            <Link to="/contact" className="text-slate hover:underline">
              send us the brief
            </Link>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
