import { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Breadcrumbs, Crumb } from "@/components/site/Breadcrumbs";
import { CtaBand } from "@/components/site/CtaBand";

interface SiteLayoutProps {
  children: ReactNode;
  crumbs?: Crumb[];
  cta?: { heading?: string; body?: string } | false;
}

export function SiteLayout({ children, crumbs, cta }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {crumbs && crumbs.length > 0 && <Breadcrumbs items={crumbs} />}
        {children}
        {cta !== false && <CtaBand {...(cta ?? {})} />}
      </main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  index,
  title,
  lead,
}: {
  index?: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="wrap py-14 md:py-20">
      {index && <p className="section-index">{index}</p>}
      <h1 className="mt-4 max-w-3xl text-[32px] leading-[1.1] text-slate md:text-[46px]">{title}</h1>
      {lead && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ash">{lead}</p>}
    </section>
  );
}
