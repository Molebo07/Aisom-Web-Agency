import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo, breadcrumbJsonLd } from "@/components/site/Seo";
import { track } from "@/lib/analytics";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Assistant", path: "/assistant" },
];

const faqs = [
  {
    q: "What does Aisom Assistant cost?",
    a: "Pricing has not been set. We are still validating the service and its costs, so no setup or monthly price is being offered.",
  },
  {
    q: "What will the assistant know?",
    a: "The intended approach is to use information a business provides and approves, such as services, opening hours and frequently asked questions. That knowledge workflow is not built yet.",
  },
  {
    q: "What happens if it does not know an answer?",
    a: "A safe response and handover to a person are design goals. The assistant is not live, so this behaviour has not been implemented or tested.",
  },
  {
    q: "Can a customer talk to a person?",
    a: "Human handover is planned, but it is not available in a working service today.",
  },
  {
    q: "Which languages will it support?",
    a: "No languages have been tested in a working assistant yet. English is an intended starting point, but we cannot promise language support until testing is complete.",
  },
  {
    q: "Where will my data be stored, and who can see it?",
    a: "No assistant conversations are being collected because the assistant is not live. The hosting region and model providers for a future service have not been selected. Early-access enquiries are handled as described in our privacy policy.",
  },
  {
    q: "Can I switch the assistant off?",
    a: "There is no live assistant to switch off. Giving businesses control to pause a future service is a design goal, not a feature available today.",
  },
  {
    q: "Will it work with a website I already have?",
    a: "The aim is to support websites built by other providers as well as Aisom sites, but no embed has been built or tested yet.",
  },
];

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Aisom Assistant",
  serviceType: "AI assistant early access",
  description:
    "Aisom is exploring an AI assistant for common customer questions. The service is in early access and is not live.",
  provider: {
    "@type": "Organization",
    name: "Aisom",
    url: "https://aisom.co.za",
  },
  url: "https://aisom.co.za/assistant",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

function trackAssistantCta() {
  track("assistant_cta_click", { page_path: "/assistant" });
}

export default function Assistant() {
  useEffect(() => {
    track("assistant_page_view");
  }, []);

  return (
    <SiteLayout crumbs={crumbs} cta={false}>
      <Seo
        title="AI Assistant for Your Business — Aisom"
        description="Aisom Assistant is in early access. Learn what we are building, what is not live yet, and register your interest."
        path="/assistant"
        jsonLd={[breadcrumbJsonLd(crumbs), serviceJsonLd, faqJsonLd]}
      />

      <section data-theme="dark" className="dark-section bg-navy">
        <div className="wrap py-16 md:py-24">
          <p className="section-index text-white/60">AI ASSISTANT · EARLY ACCESS</p>
          <h1 className="mt-6 max-w-4xl text-balance text-white">
            We are building an assistant for common customer questions.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            Aisom Assistant is an early-stage project. We are exploring how a business could use
            its own approved information to answer repeat questions and pass enquiries to a person.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-12">
              <Link to="/quote?service=assistant" onClick={trackAssistantCta}>
                Talk to us about an assistant
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="min-h-12 bg-white text-[#0A111F] hover:bg-white/90"
            >
              <a href="#how-it-could-work">How it could work</a>
            </Button>
          </div>
          <p className="mt-6 max-w-2xl border-t border-white/15 pt-4 text-sm leading-relaxed text-white/65">
            No live assistant, customer chat, WhatsApp integration or demo is available today.
            Joining the early-access list does not guarantee a pilot place or service.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-secondary">
        <div className="wrap grid gap-4 py-8 md:grid-cols-[180px_1fr] md:items-start">
          <p className="section-index">CURRENT STATUS</p>
          <p className="max-w-3xl text-sm leading-relaxed text-slate">
            The existing prototype uses mock data and has no AI model calls, database-backed
            assistant, authentication or WhatsApp integration. We are not offering it as a working
            product.
          </p>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <p className="section-index">INTENDED BEHAVIOUR</p>
        <h2 className="mt-4 max-w-2xl text-slate">What we are building toward</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ash">
          These are product goals, not features that are available or tested today.
        </p>
        <div className="mt-8 grid gap-10 border-y border-border py-7 md:grid-cols-2 md:gap-14">
          <div>
            <h3 className="text-lg text-slate">What it may do</h3>
            <ul className="mt-4 divide-y divide-border">
              <li className="py-3 text-sm leading-relaxed text-ash">
                Answer common questions using information the business has reviewed and approved.
              </li>
              <li className="py-3 text-sm leading-relaxed text-ash">
                Help a business receive an enquiry when a customer wants follow-up.
              </li>
              <li className="py-3 text-sm leading-relaxed text-ash">
                Offer a route to a person when an answer is uncertain or a customer asks for help.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg text-slate">What it should not do</h3>
            <ul className="mt-4 divide-y divide-border">
              <li className="py-3 text-sm leading-relaxed text-ash">
                Invent prices, opening hours, delivery dates or business policies.
              </li>
              <li className="py-3 text-sm leading-relaxed text-ash">
                Give legal, medical, financial or safety advice, or handle payment issues.
              </li>
              <li className="py-3 text-sm leading-relaxed text-ash">
                Replace staff for complaints, refunds, disputes or other sensitive issues.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="how-it-could-work" className="scroll-mt-20 border-y border-border bg-secondary">
        <div className="wrap py-16 md:py-20">
          <p className="section-index">A POSSIBLE PROCESS</p>
          <h2 className="mt-4 max-w-2xl text-slate">How it could work</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ash">
            This is a proposed process. The tools, controls and delivery timings are not in place
            yet.
          </p>
          <ol className="mt-8 border-y border-border">
            {[
              "Tell us about your business and the questions customers ask.",
              "Review and approve the information an assistant could use.",
              "Test its answers and handover behaviour before any launch.",
              "If a service becomes available, review enquiries and improve the approved information.",
            ].map((step, index) => (
              <li
                key={step}
                className="grid gap-3 border-b border-border py-5 last:border-b-0 sm:grid-cols-[48px_1fr] sm:items-start"
              >
                <span className="font-mono text-sm text-ash">0{index + 1}</span>
                <p className="text-sm leading-relaxed text-slate">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <p className="section-index">POSSIBLE CHANNELS</p>
        <h2 className="mt-4 max-w-2xl text-slate">Where customers may meet it</h2>
        <div className="mt-8 border-y border-border">
          <div className="grid gap-2 border-b border-border py-5 sm:grid-cols-[180px_1fr]">
            <h3 className="text-base text-slate">Website</h3>
            <p className="text-sm leading-relaxed text-ash">
              A website chat widget is being considered. It has not been built or tested.
            </p>
          </div>
          <div className="grid gap-2 py-5 sm:grid-cols-[180px_1fr]">
            <h3 className="text-base text-slate">WhatsApp</h3>
            <p className="text-sm leading-relaxed text-ash">
              WhatsApp is not available. The integration and onboarding requirements are still
              being assessed.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="wrap py-16 md:py-20">
          <p className="section-index">DESIGN GOALS</p>
          <h2 className="mt-4 max-w-2xl text-slate">Business owners should stay in control</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ash">
            Approved knowledge, human handover, control over data and the ability to pause the
            service are goals for a future product. None of these controls are available in the
            prototype today.
          </p>
        </div>
      </section>

      <section className="wrap py-16 md:py-20">
        <p className="section-index">CUSTOMER FIT</p>
        <h2 className="mt-4 max-w-2xl text-slate">We are still testing who it is for</h2>
        <div className="mt-8 grid gap-8 border-y border-border py-7 md:grid-cols-2">
          <div>
            <h3 className="text-base text-slate">A possible fit</h3>
            <p className="mt-3 text-sm leading-relaxed text-ash">
              We are exploring businesses that receive the same basic questions about services,
              location or opening hours. This customer fit has not been validated.
            </p>
          </div>
          <div>
            <h3 className="text-base text-slate">May not be a fit</h3>
            <p className="mt-3 text-sm leading-relaxed text-ash">
              Businesses that need complex, bespoke quotes or receive very few enquiries may not
              benefit. We are still researching this.
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-ash">
          A pilot offer and number of places have not been decided. Tell us what your business
          needs; we will be clear about what is and is not available.
        </p>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="wrap py-16 md:py-20">
          <p className="section-index">QUESTIONS</p>
          <h2 className="mt-4 max-w-2xl text-slate">A few things to know first</h2>
          <Accordion type="single" collapsible className="mt-8 max-w-3xl">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`assistant-faq-${index}`}>
                <AccordionTrigger className="min-h-11 text-left text-base text-slate">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-ash">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-8 text-sm text-ash">
            Looking for a website instead?{" "}
            <Link to="/services" className="font-medium text-slate underline underline-offset-4">
              See Aisom website services
            </Link>
            .
          </p>
        </div>
      </section>

      <section data-theme="dark" className="dark-section bg-navy">
        <div className="wrap flex flex-col items-start gap-6 border-t border-white/15 py-14 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <p className="section-index text-white/60">EARLY ACCESS</p>
            <h2 className="mt-3 max-w-2xl text-white">Tell us what your business needs.</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Register your interest. This is not an application for a live service or a confirmed
              pilot place.
            </p>
          </div>
          <Button asChild variant="secondary" className="min-h-11 shrink-0 bg-white text-slate hover:bg-white/90">
            <Link to="/quote?service=assistant" onClick={trackAssistantCta}>
              Register your interest
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
