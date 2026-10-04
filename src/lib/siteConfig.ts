// Contact details: a few values remain placeholders until the team confirms exact commercial terms.
// These are intentionally surfaced as visible TODO markers rather than guessed.
export const siteConfig = {
  name: "Aisom",
  legalName: "Aisom Systems (Pty) Ltd",
  registration: "2026/234071/07",
  vatNumber: "[CONFIRM: VAT number]",
  email: "sales@aisom.co.za",
  phone: "[CONFIRM: +27 00 000 0000]",
  whatsapp: "[CONFIRM: 27820000000]",
  openingHours: "[CONFIRM: Mon-Fri, 08:00-17:00]",
  address: {
    street: "53 Crane Street",
    locality: "Johannesburg",
    region: "Gauteng",
    postalCode: "1632",
    country: "ZA",
  },
  areaServed: ["Gauteng", "South Africa"],
  priceRange: "R3000 - R10000",
  social: {
    linkedin: "",
    instagram: "",
    facebook: "",
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  name: "Aisom",
  legalName: siteConfig.legalName,
  url: "https://aisom.co.za",
  email: siteConfig.email,
  ...(siteConfig.phone.startsWith("[CONFIRM:") ? {} : { telephone: siteConfig.phone }),
  description:
    "Aisom designs and builds websites for small and medium businesses in Gauteng and across South Africa.",
  priceRange: siteConfig.priceRange,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  areaServed: siteConfig.areaServed.map((a) => ({ "@type": "AdministrativeArea", name: a })),
};
