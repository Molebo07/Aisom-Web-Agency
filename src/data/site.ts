export interface Tier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  timeline: string;
  who: string;
  summary: string;
  includes: string[];
  excludes?: string[];
}

export const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter Site",
    price: "R3 000",
    priceNote: "[CONFIRM: excl. VAT]",
    timeline: "Starter: Discovery 1 day, Design 2-3, Build 3-5, Review 2, Launch 1",
    who: "Sole traders and small teams with no website, or a Facebook page doing the job badly.",
    summary: "A clean one page site that tells people who you are, what you do, and how to reach you.",
    includes: [
      "One page, up to 6 sections",
      "Mobile first design",
      "Contact form that emails you",
      "Click to call and WhatsApp buttons",
      "Google Maps location block",
      "Basic on page SEO and page titles",
      "Google Business Profile setup help",
      "Two rounds of revisions",
    ],
    excludes: ["Online store", "Blog", "Copywriting beyond light editing"],
  },
  {
    id: "business",
    name: "Business Site",
    price: "R5 000",
    priceNote: "[CONFIRM: excl. VAT]",
    timeline: "Business: Discovery 2-3, Design 3-5, Build 5-10, Review 2-3, Launch 1",
    who: "Established SMEs that need to look credible next to bigger competitors.",
    summary:
      "A full multi page website built around the pages buyers actually look for before they call you.",
    includes: [
      "Up to 8 pages, including services and about",
      "Everything in Starter Site",
      "Gallery or portfolio section",
      "Blog setup, ready for articles",
      "Structured data and sitemap for search engines",
      "Google Analytics with lead tracking",
      "Copy polish on every page",
      "Three rounds of revisions",
    ],
    excludes: ["Online store", "Booking systems", "Custom integrations"],
  },
  {
    id: "growth",
    name: "Growth Site",
    price: "From R8 000",
    priceNote: "[CONFIRM: quoted per project, excl. VAT]",
    timeline: "[CONFIRM: quoted upfront after scoping]",
    who: "Businesses that need the site to do a job: sell, book, or connect to something else.",
    summary:
      "Everything in Business Site, plus the extra build work your operation needs.",
    includes: [
      "Everything in Business Site",
      "Online store or booking system",
      "Payment gateway setup",
      "Customer accounts or member area",
      "Integrations with tools you already use",
      "Ongoing support retainer available",
    ],
  },
];

export interface ProcessStep {
  index: string;
  name: string;
  timeframe: string;
  what: string;
  you: string;
}

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    name: "Discovery",
    timeframe: "[CONFIRM: 1-3 days]",
    what: "We ask what your business sells, who buys it, and what a good lead looks like. Then we agree on pages, price and a start date in writing.",
    you: "One 30 minute call. Send us your logo, photos and anything you already have.",
  },
  {
    index: "02",
    name: "Design",
    timeframe: "[CONFIRM: 2-5 days]",
    what: "You see the real home page design before anything is built. Layout, wording and structure, on desktop and mobile.",
    you: "Review the design and send one consolidated list of changes.",
  },
  {
    index: "03",
    name: "Build",
    timeframe: "[CONFIRM: 3-10 days]",
    what: "We build every page, connect the forms, compress the images and wire up analytics. Speed and mobile are tested as we go.",
    you: "Nothing. Send any remaining content if we are still waiting on it.",
  },
  {
    index: "04",
    name: "Review",
    timeframe: "[CONFIRM: 2-3 days]",
    what: "You get a private link to the finished site. We work through your feedback in the rounds included in your package.",
    you: "Click through every page on your own phone and tell us what is wrong.",
  },
  {
    index: "05",
    name: "Launch",
    timeframe: "[CONFIRM: 1 working day]",
    what: "We point your domain, install SSL, submit the sitemap to Google and hand over a short guide on how everything works.",
    you: "Approve the launch and settle the final payment.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const serviceFaqs: Faq[] = [
  {
    q: "What does it cost in total (domain, hosting, design)?",
    a: "The quoted website price covers the build and launch work. Domain registration and hosting are additional costs paid at cost, and we will confirm the exact amounts before launch. The final total depends on the package and any optional extras you approve.",
  },
  {
    q: "Who owns the site once it is built?",
    a: "You own the finished website, the content, and the domain once it is registered in your name. We do not lock you into a proprietary builder or a platform you cannot move away from.",
  },
  {
    q: "What if I do not have a logo or photos?",
    a: "That is okay. We can begin with what you have, and we will tell you what we need before launch. If stock or placeholder imagery is required, we will say so up front and keep it honest.",
  },
  {
    q: "Can you move my existing site?",
    a: "Yes, where the current site can be transferred or rebuilt cleanly. We review the structure, content and technical setup first so we can confirm whether a rebuild is the better option.",
  },
  {
    q: "Do you host the website?",
    a: "[CONFIRM: hosting is included for the first year, or paid at cost]. We will confirm the final hosting terms before we sign off the project.",
  },
  {
    q: "Can I edit it myself afterwards?",
    a: "Yes, for text and images on the pages you asked us to make editable. We show you how in a short handover and leave you a written guide. Structural changes come back to us.",
  },
];

export interface Founder {
  name: string;
  role: string;
  bio: string;
}

export const founders: Founder[] = [
  {
    name: "Molebogeng Lebea",
    role: "Founder and Lead Developer",
    bio: "Molebogeng builds every site Aisom ships and sets the standard for how fast and how clean they are. He also leads strategy and marketing, so the person planning your site is the person writing its code.",
  },
  {
    name: "Tumelo Molusi",
    role: "Sales and Marketing",
    bio: "Tumelo works with business owners before anything is designed. He scopes the project, sets the price, and makes sure the brief matches what the business actually needs to win work.",
  },
  {
    name: "Loyiso Bam",
    role: "Sales and Marketing",
    bio: "Loyiso handles client relationships across Gauteng and keeps projects moving. If you need an update or a change, he is the one who answers.",
  },
];
