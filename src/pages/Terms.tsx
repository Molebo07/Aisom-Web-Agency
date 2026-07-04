import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function Terms() {
  const effectiveDate = "3 July 2026";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Terminal className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Aisom</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective date: {effectiveDate}</p>

        <p className="text-sm text-muted-foreground mb-10">
          These Terms are maintained by the operator of Aisom (the "App Owner") and govern your use
          of the Aisom website and application (the "Service"). This page is app-owned editable
          content; it is not an independent legal certification. By creating an account or using
          the Service you agree to these Terms.
        </p>

        <Section title="1. Who we are">
          <p>
            The Service is operated by Aisom Systems (Pty) Ltd, a business
            registered in the Republic of South Africa
            (registration number 2026/234071/07), with its address at{" "}
            53 Crane Street, Tembisa, 1632. You can contact us at{" "}
            <a
              href="mailto:sales.aisom@gmail.com"
              className="underline hover:text-primary"
            >
              sales.aisom@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Governing law and jurisdiction">
          <p>
            These Terms are governed by the laws of the Republic of South Africa, including the
            Electronic Communications and Transactions Act 25 of 2002 ("ECTA"), the Consumer
            Protection Act 68 of 2008 ("CPA") where applicable, and the Protection of Personal
            Information Act 4 of 2013 ("POPIA"). The parties consent to the jurisdiction of the
            Magistrates' Court and, where appropriate, the High Court of South Africa.
          </p>
        </Section>

        <Section title="3. Your account">
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years old, or the legal age of majority in your jurisdiction, to create an account.</li>
            <li>You are responsible for keeping your login credentials secure and for all activity on your account.</li>
            <li>You must provide accurate information and keep it up to date.</li>
          </ul>
        </Section>

        <Section title="4. Subscriptions and billing">
          <p>
            Aisom offers a free tier and paid subscription plans (Pro at R150/month and Team at
            R250/month, or the equivalent annual pricing). All prices are in South African Rand
            (ZAR) and include VAT where applicable.
          </p>
          <p>
            Payments are processed by <strong>PayFast (Pty) Ltd</strong>, a licensed South African
            payment service provider. By subscribing you also agree to PayFast's own terms available
            at{" "}
            <a
              href="https://payfast.io/legal/terms-of-use/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              payfast.io/legal
            </a>
            . We do not store your full card details; those remain with PayFast.
          </p>
          <p>
            Subscriptions renew automatically at the end of each billing cycle until cancelled. You
            can cancel at any time from your account settings — see our{" "}
            <Link to="/refund-policy" className="underline hover:text-primary">
              Refund &amp; Cancellation Policy
            </Link>{" "}
            for details.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upload unlawful, infringing, defamatory, or harmful content;</li>
            <li>Reverse engineer, scrape, or attempt to break the Service or its security;</li>
            <li>Resell or sublicense access without our written consent;</li>
            <li>Use the Service to send spam or violate any applicable law.</li>
          </ul>
          <p>We may suspend or terminate accounts that breach this section.</p>
        </Section>

        <Section title="6. Your content">
          <p>
            You retain ownership of the cards, notes, and any content you save in Aisom ("Your
            Content"). You grant us a limited licence to store, process, and display Your Content
            solely to provide the Service to you, including generating AI embeddings for semantic
            search. We do not sell Your Content, and we do not use it to train third-party models.
          </p>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            Aisom, its logo, and the underlying software are the property of the App Owner and its
            licensors. Except for the rights expressly granted to you in these Terms, all rights
            are reserved.
          </p>
        </Section>

        <Section title="8. Service availability">
          <p>
            We aim for high availability but do not guarantee that the Service will be uninterrupted
            or error-free. Scheduled maintenance and third-party outages (including hosting and
            payment providers) may temporarily affect access.
          </p>
        </Section>

        <Section title="9. Disclaimers and limitation of liability">
          <p>
            To the fullest extent permitted by South African law, the Service is provided "as is"
            and "as available" without warranties of any kind. Nothing in these Terms limits any
            right you have that cannot be excluded under the CPA or other mandatory law.
          </p>
          <p>
            Our total aggregate liability arising out of or relating to the Service is limited to
            the fees you paid to us in the three (3) months immediately preceding the event giving
            rise to the claim.
          </p>
        </Section>

        <Section title="10. Privacy and POPIA">
          <p>
            We process personal information in accordance with POPIA. For details on what we
            collect, how we use it, and your rights (including access, correction, and deletion),
            see our Privacy Policy at <Placeholder>[/privacy]</Placeholder> or email{" "}
            <a
              href="mailto:sales.aisom@gmail.com"
              className="underline hover:text-primary"
            >
              sales.aisom@gmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms from time to time. Material changes will be notified via
            email or an in-app notice at least 14 days before they take effect. Continued use of
            the Service after the effective date constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a
              href="mailto:sales.aisom@gmail.com"
              className="underline hover:text-primary"
            >
              sales.aisom@gmail.com
            </a>
            .
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-secondary px-1.5 py-0.5 text-foreground font-mono text-xs">
      {children}
    </span>
  );
}