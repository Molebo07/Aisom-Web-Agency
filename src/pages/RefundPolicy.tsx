import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function RefundPolicy() {
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
        <h1 className="text-3xl font-bold mb-2">Refund &amp; Cancellation Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Effective date: {effectiveDate}</p>

        <p className="text-sm text-muted-foreground mb-10">
          This policy is maintained by the operator of Aisom (the "App Owner") and applies to all
          paid subscriptions purchased through the Aisom website. It sets out your cancellation
          and refund rights under South African law and describes how refunds are processed
          through our payment provider, PayFast.
        </p>

        <Section title="1. Nature of the Service">
          <p>
            Aisom is a digital subscription service (Software-as-a-Service). Access to paid
            features is granted immediately upon successful payment. Because the Service is a
            digital product that begins performance on activation, the automatic 7-day cooling-off
            right under section 44 of the Electronic Communications and Transactions Act 25 of
            2002 ("ECTA") does not apply once you have started using the paid tier — this is
            expressly excluded by section 42(2)(d) of ECTA for services that begin, with your
            agreement, before the end of the cooling-off period.
          </p>
          <p>
            Your rights under the Consumer Protection Act 68 of 2008 ("CPA"), where applicable, are
            not affected by this policy.
          </p>
        </Section>

        <Section title="2. Cancelling your subscription">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You may cancel your paid subscription at any time from{" "}
              <strong>Settings → Billing</strong> in the app, or by emailing{" "}
              <Placeholder>[billing@aisom.co.za]</Placeholder>.
            </li>
            <li>
              Cancellation stops the next automatic renewal. You will keep access to paid features
              until the end of the billing period you have already paid for.
            </li>
            <li>
              We do not pro-rate refunds for the unused portion of the current billing period,
              except where required by law or where clause 3 applies.
            </li>
            <li>
              Recurring PayFast billing tokens are cancelled with the payment provider as part of
              the cancellation process, so no further charges will be taken.
            </li>
          </ul>
        </Section>

        <Section title="3. When we will refund you">
          <p>We will issue a refund in the following cases:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Duplicate or incorrect charge.</strong> Any duplicate charge or amount billed
              in error is refunded in full.
            </li>
            <li>
              <strong>Failed activation.</strong> Payment was captured but paid features were not
              made available due to a fault on our side — refunded in full.
            </li>
            <li>
              <strong>Material defect (CPA s 56).</strong> Where the Service materially fails to
              perform as described and we cannot resolve the issue within a reasonable time after
              you report it, you may request a refund of the affected billing period.
            </li>
            <li>
              <strong>Goodwill refund within 7 days.</strong> If you paid for a plan and have made
              no meaningful use of the paid features, you may request a refund within 7 days of the
              charge. This is offered as a discretionary goodwill remedy, not as an ECTA cooling-off
              right.
            </li>
          </ul>
        </Section>

        <Section title="4. When we will not refund">
          <ul className="list-disc pl-6 space-y-2">
            <li>Change of mind after the paid features have been actively used;</li>
            <li>Partially used months following a cancellation;</li>
            <li>Charges older than 90 days, save where South African law requires otherwise;</li>
            <li>
              Accounts suspended or terminated for breach of the{" "}
              <Link to="/terms" className="underline hover:text-primary">Terms and Conditions</Link>.
            </li>
          </ul>
        </Section>

        <Section title="5. How to request a refund">
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Email <Placeholder>[billing@aisom.co.za]</Placeholder> from the email address on your
              Aisom account.
            </li>
            <li>
              Include the PayFast payment reference (`m_payment_id` or `pf_payment_id`), the date
              of the charge, and a brief reason.
            </li>
            <li>We will acknowledge your request within 3 business days.</li>
            <li>
              Approved refunds are processed within 7–14 business days back to the original payment
              method through PayFast. The time it takes to appear on your statement depends on your
              bank.
            </li>
          </ol>
        </Section>

        <Section title="6. Chargebacks and disputes">
          <p>
            If you believe a charge is unauthorised, please contact us first — most disputes can
            be resolved faster directly than through a chargeback. You retain your right to lodge
            a dispute with your card issuer or bank, and to escalate unresolved complaints to the
            Payments Association of South Africa (PASA), the National Consumer Commission (NCC),
            or the relevant Ombud.
          </p>
        </Section>

        <Section title="7. Price changes">
          <p>
            If we change subscription prices, we will notify you at least 30 days before the change
            applies to your renewal. You may cancel before the new price takes effect if you do not
            wish to accept it.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Billing and refund queries: <Placeholder>[billing@aisom.co.za]</Placeholder>
            <br />
            General support: <Placeholder>[support@aisom.co.za]</Placeholder>
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