import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Aisom free to use?",
    a: "Yes — the Free plan gives you up to 50 cards, the browser extension, VS Code extension, and basic search. No credit card required. Upgrade to Pro (R150/mo) for unlimited cards, AI semantic search, and spaced repetition.",
  },
  {
    q: "How is Aisom different from Notion or Obsidian?",
    a: "Aisom is purpose-built for developers. Instead of blank pages, you get structured card types (Bug Cards, ADRs, Concept Cards) designed around how engineers actually capture knowledge. Semantic search finds answers by meaning, not just keywords.",
  },
  {
    q: "Can I import my existing notes?",
    a: "Yes — Pro users can import from Obsidian (markdown files). We parse your existing notes and suggest card types. More import sources (Notion, GitHub Issues) are on the roadmap.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. Row-level security ensures you can only access your own cards. We never train AI models on your data. See our security documentation for full details.",
  },
  {
    q: "Does the spaced repetition actually work?",
    a: "It uses the SM-2 algorithm — the same proven system behind Anki. Each morning, your Daily Brief surfaces 3 cards at the optimal review interval. Most users report significantly better retention of technical concepts within 2 weeks.",
  },
  {
    q: "Can I use Aisom with my team?",
    a: "Yes — the Team plan (R250/user/month) includes shared card libraries, a team ADR repository, shared bug knowledge base, admin dashboard, and SSO via Google Workspace.",
  },
];

export function LandingFAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance mb-4">
            Frequently asked questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-[10px] border border-border bg-background px-6"
              >
                <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
