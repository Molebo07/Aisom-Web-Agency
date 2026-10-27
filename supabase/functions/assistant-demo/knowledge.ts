export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  content: string;
}

export const aisomKnowledge: KnowledgeEntry[] = [
  {
    id: "website-packages",
    keywords: ["website", "starter", "business", "growth", "package", "price", "cost", "rand"],
    content:
      "Aisom website packages: Starter Site is R3 000 once-off and usually takes 1 to 2 weeks. Business Site is R5 000 once-off and usually takes 2 to 4 weeks. Growth Site starts from R8 000; the final price and timing are agreed in writing after scoping.",
  },
  {
    id: "starter-site",
    keywords: ["starter", "one page", "six sections", "sole trader"],
    content:
      "Starter Site is a one-page website with up to 6 sections. It includes mobile-first design, a contact form, click-to-call and WhatsApp buttons, a Google Maps block, basic on-page SEO, Google Business Profile setup help and two revision rounds. Online stores, blogs and copywriting beyond light editing are not included.",
  },
  {
    id: "business-site",
    keywords: ["business site", "eight pages", "gallery", "blog", "structured data"],
    content:
      "Business Site includes up to 8 pages, everything in Starter Site, a gallery or portfolio, blog setup, structured data and sitemap, Google Analytics with lead tracking, copy polish and three revision rounds. Online stores, booking systems and custom integrations are not included.",
  },
  {
    id: "growth-site",
    keywords: ["growth site", "store", "booking", "payment gateway", "integration"],
    content:
      "Growth Site starts from R8 000 and is scoped in writing. It includes everything in Business Site plus an online store or booking system, payment gateway setup, customer accounts or a member area, and integrations with tools the business already uses.",
  },
  {
    id: "additional-costs",
    keywords: ["hosting", "domain", "extra page", "copywriting", "support", "monthly"],
    content:
      "For Aisom website projects, first-year hosting is included. After that hosting is R150 per month, or the customer can move the site to their own hosting at no charge. The domain is billed separately by the registrar, usually around R150 per year for a .co.za. Extra pages are R450 each and full copywriting is R600 per page.",
  },
  {
    id: "payment-terms",
    keywords: ["deposit", "eft", "card", "payfast", "payment terms"],
    content:
      "Aisom website payment terms are 50% deposit to book a start date and 50% on approval before launch. Growth Site projects are split across agreed milestones. Payment is by EFT or card through PayFast, with an invoice for every payment.",
  },
  {
    id: "ownership",
    keywords: ["own", "ownership", "domain", "content", "move", "lock in"],
    content:
      "Aisom states that the customer owns the finished website, content and domain once registered in the customer's name. Aisom does not lock customers into a proprietary builder; they can move the site.",
  },
  {
    id: "process",
    keywords: ["process", "steps", "discovery", "design", "build", "review", "launch", "timeline"],
    content:
      "Aisom's website process has five steps: Discovery, Design, Build, Review and Launch. A written scope, price and start date are agreed before work begins. The overall timeline depends on scope and how quickly content and feedback are supplied.",
  },
  {
    id: "company",
    keywords: ["aisom", "company", "who", "where", "johannesburg", "gauteng", "south africa"],
    content:
      "Aisom Systems (Pty) Ltd is a Johannesburg-based web design studio working across Gauteng and South Africa. Contact: sales@aisom.co.za.",
  },
  {
    id: "assistant-status",
    keywords: ["assistant", "ai assistant", "whatsapp", "chatbot", "demo", "pilot", "languages"],
    content:
      "Aisom Assistant is an early-stage pilot. This demo answers only from Aisom's published information. A customer assistant service, WhatsApp integration, published assistant pricing and language support beyond this English demo are not available or promised.",
  },
];
