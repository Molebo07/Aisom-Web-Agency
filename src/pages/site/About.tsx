import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { founders } from "@/data/site";
import { siteConfig } from "@/lib/siteConfig";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

const beliefs = [
  {
    index: "01",
    title: "The price is on the website",
    body: "If a studio will not tell you what a site costs until the third meeting, that is a negotiating tactic, not a process. Ours is published.",
  },
  {
    index: "02",
    title: "Mobile is the real site",
    body: "Most South Africans reach you on a phone, often on mobile data. We design for that screen first and test on a real handset.",
  },
  {
    index: "03",
    title: "You own what we build",
    body: "No proprietary builder you can never leave. The site, the domain and the content are yours, and you can move them whenever you want.",
  },
];

export default function About() {
  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="About Aisom | A Gauteng Web Design Studio"
        description="Aisom Systems is a small South African web studio based in Johannesburg, Gauteng. Meet the three people who design, build and sell every site we ship."
        path="/about"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="ABOUT"
        title="A small studio, three people, no account managers."
        lead="Aisom Systems (Pty) Ltd is a registered South African company based in Johannesburg, Gauteng. You deal with the people who do the work, not a call centre in front of them."
      />

      <section className="wrap pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {founders.map((f) => (
            <Card key={f.name} className="rounded-md border-border shadow-none">
              <CardContent className="p-7">
                <h2 className="text-[17px] text-slate">{f.name}</h2>
                <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-ash">{f.role}</p>
                <p className="mt-5 text-[14px] leading-relaxed text-ash">{f.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="wrap py-20">
          <p className="section-index">WHAT WE BELIEVE</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[32px]">
            Three rules we will not bend.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {beliefs.map((b) => (
              <div key={b.index} className="bg-background p-7">
                <p className="section-index">{b.index} / 03</p>
                <h3 className="mt-4 text-[16px] text-slate">{b.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="wrap grid gap-10 py-20 md:grid-cols-2">
          <div>
            <p className="section-index">THE COMPANY</p>
            <div className="mt-4 space-y-2 text-[14px] leading-relaxed text-ash">
              <p className="text-slate">{siteConfig.legalName}</p>
              <p>Registration number {siteConfig.registration}</p>
              <p>
                {siteConfig.address.street}, {siteConfig.address.locality},{" "}
                {siteConfig.address.region}, {siteConfig.address.postalCode}
              </p>
              <p>
                <a className="text-slate hover:underline" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>
          <div>
            <p className="section-index">WHERE WE WORK</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ash">
              We are based in Johannesburg and work across Gauteng in person, from Pretoria to
              Ekurhuleni. Everywhere else in South Africa we run the same process
              remotely, by call and shared link. Read the{" "}
              <Link to="/process" className="text-slate hover:underline">
                process
              </Link>{" "}
              or{" "}
              <Link to="/contact" className="text-slate hover:underline">
                tell us about your business
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
