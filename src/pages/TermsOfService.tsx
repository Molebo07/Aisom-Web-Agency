import { SiteLayout } from "@/components/site/SiteLayout";
import { Seo } from "@/components/site/Seo";
import { siteConfig } from "@/lib/siteConfig";

export default function TermsOfService() {
  return (
    <SiteLayout>
      <Seo
        title="Terms of Service"
        description="Terms governing the use of Aisom's website and services."
        path="/terms-of-service"
      />

      <section className="wrap py-20">
        <h1 className="text-[26px] text-slate md:text-[34px]">Terms of service</h1>
        <p className="mt-4 text-ash">Welcome to Aisom Systems (Pty) Ltd, registration number 2026/234071/07, trading as Aisom. These Terms of Service govern your access to and use of our website (aisom.co.za) and any related services. By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy.</p>

        <h2 className="mt-8 text-[18px] text-slate">1. Acceptance of terms</h2>
        <p className="mt-2 text-ash">By accessing or using our Services, browsing our website, submitting an enquiry, or engaging Aisom for website design and development work, you agree to be bound by these Terms.</p>

        <h2 className="mt-6 text-[18px] text-slate">2. Eligibility</h2>
        <p className="mt-2 text-ash">You must be at least 18 years old, or the age of majority in your jurisdiction, and have the legal capacity to enter into binding agreements, to use our Services or enter into a contract with Aisom on behalf of a business.</p>

        <h2 className="mt-6 text-[18px] text-slate">3. Description of services</h2>
        <p className="mt-2 text-ash">Aisom provides website design, development and related digital services to small and medium businesses. The specific scope, deliverables, timelines and fees for any project are set out in a separate signed Client Services Agreement and/or quotation, which takes precedence over these Terms for that project.</p>

        <h2 className="mt-6 text-[18px] text-slate">4. User obligations</h2>
        <p className="mt-2 text-ash">You agree to use our website and Services lawfully, provide accurate information when submitting enquiries or content, not misuse our Services or attempt unauthorised access, and not infringe third-party rights.</p>

        <h2 className="mt-6 text-[18px] text-slate">5. Intellectual property</h2>
        <p className="mt-2 text-ash">All content, trademarks, logos, designs, code, and other intellectual property on this website and in our marketing materials are the property of Aisom or our licensors. Ownership of intellectual property created for a specific client project is governed separately by the client's signed Client Services Agreement.</p>

        <h2 className="mt-6 text-[18px] text-slate">6. Payments & billing</h2>
        <p className="mt-2 text-ash">Where you purchase paid Services, you agree to pay all fees as set out in the applicable quotation, invoice, or Client Services Agreement. Unless stated otherwise, payments are non-refundable once work has commenced, and are due within the timeframes specified on the relevant invoice.</p>

        <h2 className="mt-6 text-[18px] text-slate">7. Third-party services</h2>
        <p className="mt-2 text-ash">Our website and Services may contain links to, or integrate with, third-party platforms. We are not responsible for the content, availability, policies, or practices of any third-party services.</p>

        <h2 className="mt-6 text-[18px] text-slate">8. Disclaimer of warranties</h2>
        <p className="mt-2 text-ash">Our website and general Services are provided on an "as is" and "as available" basis. To the maximum extent permitted by South African law, we make no warranties, express or implied, except any specific warranties expressly given in a signed Client Services Agreement or rights that cannot lawfully be excluded under the Consumer Protection Act 68 of 2008, where applicable.</p>

        <h2 className="mt-6 text-[18px] text-slate">9. Limitation of liability</h2>
        <p className="mt-2 text-ash">To the maximum extent permitted by law, Aisom shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of our website or general Services. Nothing in these Terms limits liability that cannot lawfully be excluded under South African law.</p>

        <h2 className="mt-6 text-[18px] text-slate">10. Indemnification</h2>
        <p className="mt-2 text-ash">You agree to indemnify, defend and hold harmless Aisom Systems (Pty) Ltd, its affiliates, directors, employees and partners from and against any claims, damages, liabilities, costs and expenses arising out of your breach of these Terms or misuse of our Services.</p>

        <h2 className="mt-6 text-[18px] text-slate">11. Termination</h2>
        <p className="mt-2 text-ash">We may suspend or terminate your access to our website or general Services at any time, without notice, for conduct that violates these Terms or is harmful to Aisom, other users, or third parties. Termination of a specific client project is governed by the Client Services Agreement.</p>

        <h2 className="mt-6 text-[18px] text-slate">12. Governing law & jurisdiction</h2>
        <p className="mt-2 text-ash">These Terms are governed by the laws of the Republic of South Africa. Any dispute shall first be addressed through good-faith negotiation and, failing resolution, may be referred to arbitration under the rules of AFSA or to the courts of South Africa having jurisdiction.</p>

        <h2 className="mt-6 text-[18px] text-slate">13. Changes to these terms</h2>
        <p className="mt-2 text-ash">We may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on our website with a revised "Last Updated" date. Continued use of our website or Services after such changes constitutes acceptance of the updated Terms.</p>

        <h2 className="mt-6 text-[18px] text-slate">14. Severability & entire agreement</h2>
        <p className="mt-2 text-ash">If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect. These Terms, together with our Privacy Policy and, where applicable, a signed Client Services Agreement, constitute the entire agreement between you and Aisom regarding your use of our Services.</p>

        <h2 className="mt-6 text-[18px] text-slate">15. Contact</h2>
        <p className="mt-2 text-ash">Aisom Systems (Pty) Ltd · Reg. {siteConfig.registration}<br />Email: <a className="underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br />Address: {siteConfig.address.street}, {siteConfig.address.locality}, {siteConfig.address.region} {siteConfig.address.postalCode}, South Africa</p>

        <p className="mt-8 text-[13px] text-ash">Last updated: 4 October 2026</p>
      </section>
    </SiteLayout>
  );
}
