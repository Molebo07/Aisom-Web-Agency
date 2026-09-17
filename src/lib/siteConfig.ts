// Contact details: fill these in when they are ready.
// Anything left as an empty string is simply not rendered anywhere on the site.
export const siteConfig = {
  name: "Aisom",
  legalName: "Aisom Systems (Pty) Ltd",
  registration: "2026/234071/07",
  email: "sales.aisom@gmail.com",
  phone: "", // e.g. "+27 71 234 5678"
  whatsapp: "", // digits only, e.g. "27712345678"
  address: {
    street: "53 Crane Street",
    locality: "Johannesburg",
    region: "Gauteng",
    postalCode: "1632",
    country: "ZA",
  },
  areaServed: ["Gauteng", "South Africa"],
  priceRange: "R3000 - R5000",
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
