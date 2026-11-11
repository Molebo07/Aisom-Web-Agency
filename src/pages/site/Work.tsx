import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/work" },
];

const workItems = [
  {
    name: "VaalForge",
    industry: "Steel fabrication & engineering",
    status: "Live project",
    summary:
      "A workshop-led website for a Gauteng steel fabricator, built to showcase fabrication, machining, repairs, and installation services with clear quote requests and WhatsApp conversion paths.",
    href: "https://ironwood-engineering.vercel.app/",
    image: "/vaalforge-thumbnail.jpg",
    imageAlt: "Steel fabrication work at the VaalForge workshop",
    external: true,
  },
  {
    name: "Industrial supplier",
    industry: "Concept layout",
    status: "Concept",
    summary:
      "A homepage concept for an industrial supplier, focused on making the product range easy to scan and quote requests easy to find. This is a design concept, not a client website.",
    href: "/",
    image: "/industrial-supplier-concept.svg",
    imageAlt: "Concept website layout for an industrial supplier",
    external: false,
  },
];

const proof = [
  {
    title: "Concept layouts",
    detail: "The industrial supplier card is clearly marked as a concept, not a live client site.",
  },
  {
    title: "Client websites",
    detail: "VaalForge is shown as a live project, separately from our concept work.",
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
        description="Explore Aisom's live website work and clearly labeled design concepts."
        path="/work"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="WORK"
        title="Honest proof, not fake screenshots."
        lead="Aisom is a new South African web studio. We will not present concepts as client work or publish numbers we have not measured."
      />

      <section className="wrap pb-20">
        <div className="grid gap-6 pb-12 sm:grid-cols-2">
          {workItems.map((project) => (
            <article key={project.name} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate shadow-sm">
                  {project.status}
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-ash">{project.industry}</p>
                <h2 className="mt-2 text-2xl text-slate">{project.name}</h2>
                <p className="mt-3 text-base leading-relaxed text-ash">{project.summary}</p>
                {project.external ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline"
                  >
                    Visit website <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    to={project.href}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate hover:underline"
                  >
                    See the concept <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

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
