import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/work" },
];

const proof = [
  {
    title: "Concept layouts",
    detail: "The industrial supplier preview on our homepage is a concept, not a live client site.",
  },
  {
    title: "Client websites",
    detail: "No client websites have been published here yet. We will add real work when it is ready to share.",
  },
  {
    title: "Performance results",
    detail: "We do not publish Lighthouse scores until they have been measured and dated.",
  },
  {
    title: "Testimonials",
    detail: "We will publish a client quote only with that person's written permission.",
  },
];

export default function Work() {
  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="Our Work | Aisom"
        description="See what Aisom can verify today, and how we keep concepts separate from real client work."
        path="/work"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="WORK"
        title="Honest proof, not fake screenshots."
        lead="Aisom is a new South African web studio. We will not present concepts as client work or publish numbers we have not measured."
      />

      <section className="wrap pb-20">
        <div className="divide-y divide-border border-y border-border">
          {proof.map((item, index) => (
            <article key={item.title} className="grid gap-3 py-6 md:grid-cols-[160px_1fr] md:gap-8">
              <p className="font-mono text-xs tracking-[0.12em] text-ash">0{index + 1}</p>
              <div>
                <h2 className="text-lg text-slate">{item.title}</h2>
                <p className="mt-2 text-base leading-relaxed text-ash">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button asChild className="min-h-11">
            <Link to="/quote">Get a quote</Link>
          </Button>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline">
            See the concept layout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
