import { Link } from "react-router-dom";
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
        <p className="section-index">THE PEOPLE BEHIND AISOM</p>
        <div className="mt-6 divide-y divide-border border-y border-border">
          {founders.map((founder, index) => (
            <article key={founder.name} className="grid gap-3 py-6 md:grid-cols-[180px_1fr] md:gap-8">
              <div>
                <p className="font-mono text-xs tracking-[0.12em] text-ash">0{index + 1}</p>
                <h2 className="mt-2 text-lg text-slate">{founder.name}</h2>
                <p className="mt-1 text-sm text-ash">{founder.role}</p>
              </div>
              <p className="text-base leading-relaxed text-ash">{founder.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="wrap py-20">
          <p className="section-index">WHAT WE BELIEVE</p>
          <h2 className="mt-4 max-w-2xl text-[26px] leading-tight text-slate md:text-[32px]">
            Three rules we will not bend.
          </h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {beliefs.map((belief) => (
              <article key={belief.index} className="grid gap-3 py-6 md:grid-cols-[180px_1fr] md:gap-8">
                <div>
                  <p className="section-index">{belief.index} / 03</p>
                  <h3 className="mt-2 text-lg text-slate">{belief.title}</h3>
                </div>
                <p className="text-base leading-relaxed text-ash">{belief.body}</p>
              </article>
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
