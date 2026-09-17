# Aisom Agency Visual Upgrade

## Goal

Turn the current agency site into a confident, motion-led studio experience while preserving its real South African business copy, pricing, legal content, enquiry flow, auth routes, and payment plumbing. The supplied v2 SVG logos will be used exactly once uploaded.

## Visual system

- Keep Roboto Mono and the light-first white/slate/ash foundation.
- Add semantic Navy and Accent Blue tokens, including the lighter dark-surface accent, focus rings, borders, glows, and accessible dark-section text roles.
- Use Navy only for major bookends and selected contrast areas, not as the default page background.
- Increase headline scale and whitespace while keeping mobile line lengths and controls stable.
- Restyle shared shadcn buttons and interactive states with restrained accent glow, lift, press feedback, and visible keyboard focus.

## Shared experience

- Replace every old mark with the supplied light, reversed, and icon-only v2 assets; derive the complete favicon set from the supplied logomark.
- Build a scroll-aware sticky header that is transparent over dark page headers and becomes a solid blurred surface after scrolling.
- Add a route-level `ScrollToTop` mounted above all routes and audit every header/footer internal link.
- Add reusable reduced-motion-aware reveal components using `motion/react`, with staggered section, card, and numbered-content entrances.
- Rework the dark CTA band and footer into calm, spacious brand bookends with the correct reversed logo and existing sitemap columns.

## Homepage

- Create a full-bleed Navy first view with an oversized staggered headline, concise supporting copy, and two clear actions.
- Build a lightweight self-assembling browser scene using semantic HTML/CSS shapes and transform-only motion: typed `aisom.co.za`, staged navigation, image, text, and button blocks.
- Replace generic service cards with three numbered benefits: fast launch, conversion-minded design, and support after launch.
- Present the process with an animated connecting line, keep claims aligned to the real package timelines, and clearly state that client work is coming soon rather than inventing proof.
- Finish with transparent pricing and a centered dark CTA.

## Remaining pages

- **Services:** oversized dark header, numbered service narrative, current deliverables, and shadcn FAQ accordion with FAQPage structured data.
- **Work:** honest “first client work in progress” presentation, industry filter tabs, build-standard proof, and a reusable dialog-ready case-study pattern without fabricated clients or metrics.
- **Pricing:** shadcn tabs for project/package views, three real package cards, recommended badge, hover motion, comparison table, ZAR and payment-term clarity.
- **About:** strong founder-led story using the three supplied real bios and no invented credentials.
- **Process:** five-step flow with an animated connecting line and clear client responsibilities.
- **Contact:** retain Zod validation, honeypot, lead capture, founder-email function, Sonner feedback, and GA4 `generate_lead`; improve field hierarchy and accessible inline errors.
- **Legal:** restyle Privacy Policy, Terms of Service, and existing refund policy using the real company details and current South African-law wording; remove visible placeholders and use the supplied address/email.
- **Blog:** restore the missing `/blog` destination and three launch articles required by the original sitemap, with Article metadata and related links, so existing navigation does not lead to a 404.
- **404:** bring the not-found page into the same brand system.

## Technical and SEO corrections

- Replace stale Study Buddy metadata in `index.html`, `llms.txt`, sitemap, and robots references with agency-specific content for `https://aisom.co.za`.
- Preserve per-page canonical tags, unique titles/descriptions, Organization/LocalBusiness/Breadcrumb/FAQ/Article structured data, semantic heading order, and meaningful alt text.
- Preserve the existing auth, protected placeholders, PayFast routes, environment variables, and backend schema.
- Repair the existing TypeScript failures in the unused legacy landing and lead function dependency so the project is green.
- Keep animations GPU-friendly, avoid video/canvas, lazy-load noncritical page code where practical, and disable motion through `prefers-reduced-motion`.

## Verification

- Check the current and new layouts at desktop and mobile sizes, including hero framing, menu behavior, forms, tabs, accordions, dialogs, and reduced-motion mode.
- Click every header and footer destination from multiple pages and verify each route starts at scroll position zero.
- Verify the enquiry success/error paths and GA4 event call without exposing secrets.
- Run focused tests, inspect runtime/console/network diagnostics, confirm the final preview visually, and audit Lighthouse targets. Aim for 90+ across Performance, Accessibility, Best Practices, and SEO; report any environment-dependent limitation rather than claiming an unmeasured score.

## Required input

- Await `aisom-logomark-v2.svg`, `aisom-primary-logo-v2.svg`, and `aisom-primary-logo-v2-dark.svg` before implementation so the exact brand assets and favicon set can be completed in one pass.
