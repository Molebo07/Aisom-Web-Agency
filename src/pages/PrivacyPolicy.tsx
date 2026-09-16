import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";

export default function PrivacyPolicy() {
  return (
    <SiteLayout>
      <Seo
        title="Privacy Policy"
        description="How Aisom collects, uses and protects personal information under POPIA."
        path="/privacy-policy"
      />

      <section className="wrap py-20">
        <h1 className="text-[26px] text-slate md:text-[34px]">Privacy policy</h1>
        <p className="mt-4 text-ash">Aisom Systems (Pty) Ltd, registration number 2026/234071/07, trading as Aisom ("Aisom", "we", "us", "our"), respects your privacy. This Privacy Policy explains how we collect, use, disclose, store and protect personal information when you use our website (aisom.co.za), our services, or otherwise interact with us, in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and the Electronic Communications and Transactions Act 25 of 2002.</p>

        <h2 className="mt-8 text-[18px] text-slate">1. Information we collect</h2>
        <p className="mt-2 text-ash">We may collect the following categories of personal information:</p>
        <ul className="mt-2 list-disc pl-6 text-ash">
          <li>Contact details: name, business name, email address, phone/WhatsApp number, physical or postal address.</li>
          <li>Business information: details you provide about your business for the purpose of building your website (services, pricing, images, logos, descriptions).</li>
          <li>Account and project information: login credentials for any website admin/CMS we set up for you, project correspondence, and files you upload or share with us.</li>
          <li>Payment information: banking reference details and payment history (we do not store full card numbers; payments are processed via our bank or a third-party payment processor).</li>
          <li>Technical information: IP address, browser type, device information, and usage data collected automatically via cookies and analytics tools when you visit aisom.co.za.</li>
          <li>Communications: records of emails, WhatsApp messages, calls or form submissions between you and Aisom.</li>
        </ul>

        <h2 className="mt-6 text-[18px] text-slate">2. How we use your information</h2>
        <p className="mt-2 text-ash">We use personal information for purposes including responding to enquiries and preparing quotes or proposals; providing, delivering and supporting our website design and development services; processing payments and issuing invoices; communicating with you about your project, account, or support requests; sending marketing communications where you have opted in; improving our website and services through analytics; and complying with legal, tax and regulatory obligations.</p>

        <h2 className="mt-6 text-[18px] text-slate">3. Lawful basis for processing</h2>
        <p className="mt-2 text-ash">We process personal information on one or more of the following bases: your consent; necessity to conclude or perform a contract with you; compliance with a legal obligation; or our legitimate business interests, provided these do not override your rights and interests as a data subject.</p>

        <h2 className="mt-6 text-[18px] text-slate">4. Sharing of information</h2>
        <p className="mt-2 text-ash">We do not sell or rent personal information. We may share personal information with service providers who help us operate our business, professional advisors where necessary, regulatory authorities where required by law, and a successor entity in the event of a merger or sale, subject to equivalent privacy protections.</p>

        <h2 className="mt-6 text-[18px] text-slate">5. Cookies & tracking technologies</h2>
        <p className="mt-2 text-ash">Our website uses cookies and similar technologies (such as Google Analytics) to understand how visitors use the site, remember preferences, and improve performance. You can control or disable cookies through your browser settings; disabling cookies may affect certain website functionality.</p>

        <h2 className="mt-6 text-[18px] text-slate">6. Data security</h2>
        <p className="mt-2 text-ash">We implement appropriate technical and organisational measures to protect personal information, including access controls, secure hosting, and encrypted connections (HTTPS/SSL). No method of transmission or storage is completely secure and we cannot guarantee absolute security.</p>

        <h2 className="mt-6 text-[18px] text-slate">7. Data retention</h2>
        <p className="mt-2 text-ash">We retain personal information only for as long as necessary to fulfil the purposes described in this Policy, to comply with legal or accounting obligations, or to resolve disputes, after which it is securely deleted or anonymised.</p>

        <h2 className="mt-6 text-[18px] text-slate">8. Cross-border transfers</h2>
        <p className="mt-2 text-ash">Where personal information is transferred to or processed by service providers outside South Africa, we take reasonable steps to ensure such recipients provide an adequate level of protection consistent with POPIA, including contractual safeguards.</p>

        <h2 className="mt-6 text-[18px] text-slate">9. Your rights as a data subject</h2>
        <p className="mt-2 text-ash">Subject to POPIA, you have the right to be informed, access your personal information, request correction or deletion, object to processing (including for direct marketing), withdraw consent where processing is based on consent, and lodge a complaint with the Information Regulator of South Africa.</p>

        <h2 className="mt-6 text-[18px] text-slate">10. Children's privacy</h2>
        <p className="mt-2 text-ash">Our website and services are not directed at children under 18. If we become aware that we have inadvertently collected personal information from a child without appropriate consent, we will take reasonable steps to delete it.</p>

        <h2 className="mt-6 text-[18px] text-slate">11. Changes to this policy</h2>
        <p className="mt-2 text-ash">We may update this Privacy Policy from time to time. We will post the updated Policy on this page with a revised "Last Updated" date. Continued use of our website or services after such changes constitutes acceptance of the updated Policy.</p>

        <h2 className="mt-6 text-[18px] text-slate">12. Contact & Information Officer</h2>
        <p className="mt-2 text-ash">Aisom Systems (Pty) Ltd · Reg. 2026/234071/07<br />Email: privacy@aisom.co.za · Phone: [___________] · Address: [___________], Gauteng, South Africa</p>

        <p className="mt-8 text-[13px] text-ash">Last Updated: [___________]</p>
      </section>
    </SiteLayout>
  );
}
