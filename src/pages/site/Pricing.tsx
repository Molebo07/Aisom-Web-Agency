import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { tiers } from "@/data/site";
import { trackViewItem } from "@/lib/analytics";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
];

type Cell = boolean | string;

const comparison: { feature: string; values: [Cell, Cell, Cell] }[] = [
  { feature: "Pages", values: ["1 page, up to 6 sections", "Up to 8 pages", "8 pages and up"] },
  { feature: "Mobile first design", values: [true, true, true] },
  { feature: "Contact form to your inbox", values: [true, true, true] },
  { feature: "Click to call and WhatsApp", values: [true, true, true] },
  { feature: "Google Maps location block", values: [true, true, true] },
  { feature: "On page SEO and page titles", values: [true, true, true] },
  { feature: "Structured data and sitemap", values: [false, true, true] },
  { feature: "Gallery or portfolio", values: [false, true, true] },
  { feature: "Blog setup", values: [false, true, true] },
  { feature: "Google Analytics lead tracking", values: [false, true, true] },
  { feature: "Online store or bookings", values: [false, false, true] },
  { feature: "Payment gateway setup", values: [false, false, true] },
  { feature: "Customer accounts or member area", values: [false, false, true] },
  { feature: "Revision rounds", values: ["Two", "Three", "Three or more, scoped"] },
  { feature: "Hosting, first year", values: ["Included", "Included", "Included"] },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="h-4 w-4 text-slate" aria-label="Included" />;
  if (value === false) return <Minus className="h-4 w-4 text-ash/50" aria-label="Not included" />;
  return <span className="text-[13px] text-ash">{value}</span>;
}

export default function Pricing() {
  useEffect(() => {
    tiers.forEach((t) => trackViewItem(t.name));
  }, []);

  return (
    <SiteLayout crumbs={crumbs}>
      <Seo
        title="Website Pricing in South African Rand | Aisom"
        description="Fixed website pricing for SA businesses. Starter from R3 000, Business R5 000, Growth from R8 000. Hosting included for the first year."
        path="/pricing"
        jsonLd={breadcrumbJsonLd(crumbs)}
      />

      <PageHeader
        index="PRICING"
        title="Fixed prices in Rand. No hourly billing, no surprises."
        lead="You get a written quote with the final number and a start date before any work begins. If the scope changes, we quote the change first and you approve it in writing."
      />

      <section className="wrap pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.id} className="flex flex-col rounded-md border-border shadow-none">
              <CardContent className="flex flex-1 flex-col p-7">
                <h2 className="text-[18px] text-slate">{tier.name}</h2>
                <p className="mt-4 text-[30px] text-slate">{tier.price}</p>
                <p className="mt-1 text-[12px] text-ash">{tier.priceNote}</p>
                <p className="mt-5 text-[13px] leading-relaxed text-ash">{tier.summary}</p>
                <p className="mt-5 text-[12px] text-ash">{tier.timeline}</p>
                <div className="mt-auto pt-7">
                  <Button asChild className="w-full">
                    <Link to="/contact">Ask about {tier.name}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="wrap py-20">
          <p className="section-index">COMPARE</p>
          <h2 className="mt-4 text-[26px] leading-tight text-slate md:text-[32px]">
            Line by line, what each package includes.
          </h2>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="sr-only">Comparison of Aisom website packages</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-4 pr-4 text-[12px] font-medium text-ash">
                    Feature
                  </th>
                  {tiers.map((t) => (
                    <th key={t.id} scope="col" className="py-4 pr-4 text-[13px] text-slate">
                      {t.name}
                      <span className="mt-1 block text-[12px] font-normal text-ash">{t.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.feature} className="border-b border-border">
                    <th scope="row" className="py-4 pr-4 text-[13px] font-normal text-slate">
                      {row.feature}
                    </th>
                    {row.values.map((v, i) => (
                      <td key={i} className="py-4 pr-4">
                        <CellValue value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="wrap grid gap-10 py-20 md:grid-cols-3">
          <div>
            <p className="section-index">PAYMENT TERMS</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ash">
              50% deposit to book your start date, 50% on approval before launch. Growth Site
              projects are split across agreed milestones. Payment by EFT or card through PayFast.
              An invoice is issued for every payment.
            </p>
          </div>
          <div>
            <p className="section-index">HOSTING AND DOMAIN</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ash">
              Hosting is free for the first year, then R150 a month, or move the site to your own
              hosting at no charge. Your domain is billed by the registrar, usually around R150 a
              year for a .co.za.
            </p>
          </div>
          <div>
            <p className="section-index">EXTRAS</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ash">
              Extra pages are R450 each. Full copywriting is R600 per page. Anything we built that
              breaks is fixed free for 30 days after launch. Longer support is quoted as a monthly
              retainer.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
