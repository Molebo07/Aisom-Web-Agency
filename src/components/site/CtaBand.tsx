import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function CtaBand({ title = "Ready to start?", cta = "/contact", ctaLabel = "Get a free quote" }: { title?: string; cta?: string; ctaLabel?: string }) {
  return (
    <section className="bg-slate text-white">
      <div className="wrap flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <h2 className="text-[18px] font-medium">{title}</h2>
        <div>
          <Button asChild size="lg">
            <Link to={cta}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CtaBandProps {
  heading?: string;
  body?: string;
}

export function CtaBand({
  heading = "Ready for a website that pulls its weight?",
  body = "Tell us about your business. You get a fixed quote and a start date, usually within one working day.",
}: CtaBandProps) {
  return (
    <section className="bg-slate text-white">
      <div className="wrap flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-[24px] leading-tight text-white md:text-[30px]">{heading}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-white/70">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="secondary" className="bg-white text-slate hover:bg-white/90">
            <Link to="/contact">Get a free quote</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white hover:text-slate"
          >
            <Link to="/pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
