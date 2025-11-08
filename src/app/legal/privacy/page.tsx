// src/app/legal/privacy/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how LuvBricks collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6">LuvBricks Privacy Policy</h1>
      <p className="text-med text-slate-500 mb-10">Last Updated: October 16, 2025</p>

      <Section title="Information We Collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, email, shipping address</li>
          <li>Login credentials, order history, shipping preferences</li>
          <li>Optional saved payment method (if selected)</li>
          <li>Usage data</li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <ul className="list-disc pl-5 space-y-1">
          <li>To process orders and manage your account</li>
          <li>Support the LuvPoints rewards program</li>
          <li>Send service updates and (optional) marketing emails</li>
          <li>Improve the site experience using analytics</li>
          <li>Protect site security and prevent fraud</li>
        </ul>
      </Section>

      <Section title="Sharing Your Data">
        <p>
          We never sell your data. We only share it with trusted service providers:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>PayPal (payments)</li>
          <li>Pirate Ship (shipping)</li>
          <li>Zoho One (operations)</li>
          <li>Google Analytics (anonymous usage stats)</li>
        </ul>
        <p className="mt-2">
          Data may also be shared when legally required or with your consent.
        </p>
      </Section>

      <Section title="Your Choices & Rights">
        <ul className="list-disc pl-5 space-y-1">
          <li>Update or delete your account</li>
          <li>Manage email and cookie preferences</li>
          <li>Request specific data deletion</li>
        </ul>
      </Section>

      <Section title="U.S.-Only Customers">
        <p>
          LuvBricks serves U.S. customers only. All data is stored and processed in the United States.
        </p>
      </Section>

      <Section title="Children’s Privacy">
        <p>
          We do not knowingly collect data from children under 13. If we become aware, we’ll delete it.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>Have questions or requests?</p>
        <ul className="mt-2">
          <li>Email: <a href="mailto:customerservice@luvbricks.com" className="text-blue-600 hover:underline">customerservice@luvbricks.com</a></li>
          <li>Mail: LuvBricks LLC, Attn: Privacy Team, 317 Elizabeth St, Vacaville, CA 95688</li>
        </ul>
      </Section>

      <Section title="Updates to This Policy">
        <p>We may update this policy periodically. Please check back regularly for changes.</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="text-slate-700 text-base">{children}</div>
    </section>
  );
}
