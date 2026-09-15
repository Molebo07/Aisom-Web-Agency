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
    priceNote: "once off",
    timeline: "Live in 1 to 2 weeks",
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
    priceNote: "once off",
    timeline: "Live in 2 to 4 weeks",
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
    priceNote: "quoted per project",
    timeline: "Timeline quoted upfront",
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
    timeframe: "2 to 3 days",
    what: "We ask what your business sells, who buys it, and what a good lead looks like. Then we agree on pages, price and a start date in writing.",
    you: "One 30 minute call. Send us your logo, photos and anything you already have.",
  },
  {
    index: "02",
    name: "Design",
    timeframe: "3 to 5 days",
    what: "You see the real home page design before anything is built. Layout, wording and structure, on desktop and mobile.",
    you: "Review the design and send one consolidated list of changes.",
  },
  {
    index: "03",
    name: "Build",
    timeframe: "5 to 10 days",
    what: "We build every page, connect the forms, compress the images and wire up analytics. Speed and mobile are tested as we go.",
    you: "Nothing. Send any remaining content if we are still waiting on it.",
  },
  {
    index: "04",
    name: "Review",
    timeframe: "2 to 3 days",
    what: "You get a private link to the finished site. We work through your feedback in the rounds included in your package.",
    you: "Click through every page on your own phone and tell us what is wrong.",
  },
  {
    index: "05",
    name: "Launch",
    timeframe: "1 day",
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
    q: "Do you host the website?",
    a: "Yes. Hosting is included free for the first year on every package. After that it is R150 a month, or you can move the site to your own hosting at no charge. Your domain is billed separately by the registrar, usually around R150 a year for a .co.za.",
  },
  {
    q: "Can I edit it myself afterwards?",
    a: "Yes, for text and images on the pages you asked us to make editable. We show you how in a short handover call and leave you a written guide. Structural changes come back to us.",
  },
  {
    q: "What if I need more pages later?",
    a: "Extra pages are R450 each on a Starter or Business Site. No contract, no monthly fee attached to it. You ask, we quote, you approve.",
  },
  {
    q: "Do you write the copy?",
    a: "We polish and structure what you give us, included in the price. If you have nothing written, full copywriting is R600 per page and we interview you to get the detail right.",
  },
  {
    q: "What do you need from me to start?",
    a: "Your logo if you have one, photos of your work or premises, your services and prices, and your contact details. If photos are the blocker, tell us. We can start without them.",
  },
  {
    q: "What happens if the site breaks after launch?",
    a: "Anything that we built and that stops working is fixed free for 30 days after launch. After that, small fixes are quoted per job or covered by a support retainer.",
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
    bio: "Molebogeng builds every site Aisom ships and sets the standard for how fast and how clean they are. She also leads strategy and marketing, so the person planning your site is the person writing its code.",
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
