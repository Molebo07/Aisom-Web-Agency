import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    period: "forever",
    currency: "$",
    desc: "For developers exploring Aisom.",
    features: [
      "Up to 50 cards (all types)",
      "Basic search",
      "Web app",
    ],
    cta: "Start for free",
    ctaVariant: "outline" as const,
    ctaLink: "/auth/signup",
    featured: false,
  },
  {
    name: "Pro",
    monthlyPrice: 10,
    period: "per month",
    currency: "$",
    desc: "For engineers who want the full second brain.",
    features: [
      "Unlimited cards",
      "AI semantic search",
      "Spaced repetition daily brief",
      "Mobile app",
      "CLI capture tool",
      "Knowledge graph view",
      "Obsidian import",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaVariant: "default" as const,
    ctaLink: "/auth/signup",
    featured: true,
    badge: "Most popular",
  },
  {
    name: "Team",
    monthlyPrice: 20,
    period: "per user / month",
    currency: "$",
    desc: "For engineering teams sharing institutional knowledge.",
    features: [
      "Everything in Pro",
      "Shared card library",
      "Team ADR repository",
      "Shared bug knowledge base",
      "Admin dashboard",
      "SSO (Google Workspace)",
    ],
    cta: "Contact us",
    ctaVariant: "outline" as const,
    ctaLink: "/auth/signup",
    featured: false,
  },
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
            Simple pricing. No surprises.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-pretty">
            Start free. Upgrade when it pays for itself — usually after the first bug you don't have to re-debug.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setAnnual(false)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              !annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2 ${
              annual ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annual
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">2 months free</Badge>
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const displayPrice = plan.monthlyPrice === 0
              ? `${plan.currency}0`
              : annual
                ? `${plan.currency}${plan.monthlyPrice * 10}`
                : `${plan.currency}${plan.monthlyPrice}`;
            const displayPeriod = plan.monthlyPrice === 0
              ? "forever"
              : annual
                ? "per year"
                : plan.period;

            return (
              <div
                key={plan.name}
                className={`relative rounded-[10px] p-6 flex flex-col ${
                  plan.featured
                    ? "border-2 border-primary bg-background shadow-lg"
                    : "border border-border bg-background"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs px-3 py-0.5">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-foreground">{displayPrice}</span>
                    <span className="text-sm text-muted-foreground">/{displayPeriod}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.desc}</p>
                </div>

                <hr className="border-border mb-6" />

                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" className="fill-emerald-100" />
                        <path d="M6 10l3 3 5-5" stroke="hsl(var(--aisom-success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant={plan.ctaVariant} className="w-full h-11" asChild>
                  <Link to={plan.ctaLink}>{plan.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[13px] text-muted-foreground">
          <span>14-day free trial on Pro</span>
          <span>·</span>
          <span>No credit card required</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>Used by 500+ engineers</span>
        </div>

        <div className="text-center mt-6">
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Questions? See the full FAQ ↓
          </a>
        </div>
      </div>
    </section>
  );
}
