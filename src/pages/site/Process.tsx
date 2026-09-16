import { Link } from "react-router-dom";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { processSteps } from "@/data/site";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Process", path: "/process" },
];

export default function Process() {
  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="How We Build Your Website | Aisom Process"
        description="Discovery, design, build, review, launch. See exactly what happens in each step of an Aisom website project and what we need from you."
        path="/process"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="PROCESS"
        title="You always know what is happening and what we need from you."
        lead="Most website projects stall because nobody said who owes what, and by when. Here is the whole run, start to finish, with your part written down next to ours."
      />

      <section className="wrap pb-20">
        <div className="divide-y divide-border border-y border-border">
          {processSteps.map((step) => (
            <article key={step.index} className="grid gap-6 py-10 md:grid-cols-[120px_1fr_1fr]">
              <div>
                <p className="section-index">
                  {step.index} / 0{processSteps.length}
                </p>
                <p className="mt-3 text-[12px] text-ash">{step.timeframe}</p>
              </div>
              <div>
                <h2 className="text-[20px] text-slate">{step.name}</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">{step.what}</p>
              </div>
              <div className="md:border-l md:border-border md:pl-6">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate">
                  Your part
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ash">{step.you}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-[14px] leading-relaxed text-ash">
          Total time from deposit to live site is one to two weeks on a{" "}
          <Link to="/services" className="text-slate hover:underline">
            Starter Site
          </Link>{" "}
          and two to four weeks on a Business Site, as long as we have your content. Growth Site
          timelines are quoted upfront. Package prices are on the{" "}
          <Link to="/pricing" className="text-slate hover:underline">
            pricing page
          </Link>
          .
        </p>
      </section>
    </SiteLayout>
  );
}
