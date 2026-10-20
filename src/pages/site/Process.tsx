import { Link } from "react-router-dom";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";

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

      <section data-theme="dark" className="dark-section bg-navy">
        <div className="wrap py-16 md:py-24">
          <p className="section-index text-white/60">THE PROJECT TIMELINE</p>
          <ProcessTimeline />
          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-white/65">
            The overall timeline depends on the agreed scope and how quickly content and feedback are supplied. We confirm the schedule in writing before work begins. See the{" "}
            <Link to="/services" className="text-white underline underline-offset-4">package options</Link>
            {" "}and compare their inclusions on the{" "}
            <Link to="/pricing" className="text-white underline underline-offset-4">pricing page</Link>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
