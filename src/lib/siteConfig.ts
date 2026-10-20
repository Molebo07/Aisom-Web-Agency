export const siteConfig = {
  name: "Aisom",
  legalName: "Aisom Systems (Pty) Ltd",
  registration: "2026/234071/07",
  email: "sales@aisom.co.za",
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
