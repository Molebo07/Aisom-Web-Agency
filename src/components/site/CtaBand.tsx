import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CtaBandProps {
  title?: string;
  heading?: string;
  body?: string;
  cta?: string;
  ctaLabel?: string;
}

export function CtaBand({
  title,
  heading = "Tell us about your business. We’ll send a written price.",
  body = "Share what you need and we will confirm scope, price and timing before work begins.",
  cta = "/quote",
  ctaLabel = "Get a free quote",
}: CtaBandProps) {
  const headingText = heading ?? title ?? "Ready for a website that pulls its weight?";

  return (
    <section data-theme="dark" className="dark-section bg-navy text-white">
      <div className="wrap flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-[24px] leading-tight text-white md:text-[30px]">{headingText}</h2>
          {body && <p className="mt-3 text-[14px] leading-relaxed text-white/70">{body}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" className="min-h-11 bg-white text-slate hover:bg-white/90">
            <Link to={cta}>{ctaLabel}</Link>
          </Button>
          <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white hover:underline">See pricing</Link>
        </div>
      </div>
    </section>
  );
}
