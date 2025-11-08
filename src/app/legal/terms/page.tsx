// src/app/legal/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | LuvBricks",
  description:
    "The rules for using LuvBricks, placing orders, shipping, returns, warranties, and other important terms.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms & Conditions</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: October 19, 2025</p>

      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using <strong>luvbricks.com</strong> (the “Site”) and by placing an order,
          you agree to these Terms & Conditions and to any policies referenced here (including{" "}
          <Link href="/legal/privacy" className="underline">Privacy</Link>,{" "}
          <Link href="/customer-service/returns" className="underline">Returns</Link>, and{" "}
          <Link href="/bundle" className="underline">Bundle Program</Link>). If you do not agree,
          please do not use the Site.
        </p>
      </Section>

      <Section title="2. Who can use LuvBricks">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be 18+ to create an account or place an order.</li>
          <li>We currently serve U.S. customers only; orders ship to U.S. addresses.</li>
        </ul>
      </Section>

      <Section title="3. Products, pricing & availability">
        <ul className="list-disc pl-5 space-y-1">
          <li>We do our best to keep product info current, but listings may change without notice.</li>
          <li>Prices are shown in USD and exclude taxes and shipping unless stated otherwise.</li>
          <li>Inventory status (including “Temporarily Out of Stock”) can change at any time.</li>
          <li>We may limit quantities or cancel orders that appear fraudulent or abusive.</li>
        </ul>
      </Section>

      <Section title="4. Orders & payment">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Payment is processed securely through our payment partners (e.g., PayPal and Stripe). We don’t store
            full card numbers on our servers.
          </li>
          <li>
            An order is accepted when we email a confirmation. If we cannot fulfill all or part of an
            order, we’ll cancel the affected items and refund as applicable.
          </li>
          <li>
            Sales tax is calculated where required by law based on your shipping address.
          </li>
        </ul>
      </Section>

      <Section title="5. Shipping & delivery">
        <ul className="list-disc pl-5 space-y-1">
          <li>We ship within the United States. Estimated delivery windows are provided at checkout.</li>
          <li>
            Shipping rates follow our posted policies; see{" "}
            <Link href="/customer-service/shipping" className="underline">Shipping & Delivery</Link>{" "}
            for weight tiers, credits, and carrier notes.
          </li>
          <li>
            Risk of loss passes to you upon carrier’s acceptance. Please inspect packages promptly and
            contact us if anything arrives damaged or incorrect.
          </li>
        </ul>
      </Section>

      <Section title="6. Returns, exchanges & cancellations">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Our customer-facing returns policy is summarized here:
            {" "}
            <Link href="/customer-service/returns" className="underline">Returns</Link>.
          </li>
          <li>
            In brief: 30-day window; items must be unused, in original packaging. Customer covers
            return shipping. Engraved/customized items are not returnable. Damaged items eligible for
            exchange for the same product with proof.
          </li>
          <li>You may cancel an order before it ships. After shipment, please follow the returns process.</li>
        </ul>
      </Section>

      <Section title="7. Rewards & bundles">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>LuvPoints:</strong> Earn and redeem per the{" "}
            <Link href="/rewards" className="underline">Rewards</Link> page. One account per person;
            verification may be required to prevent abuse.
          </li>
          <li>
            <strong>Bundle Program:</strong> Savings apply at checkout when eligible sets from the
            same tier are in the cart; discounts stack with LuvPoints. See{" "}
            <Link href="/bundle" className="underline">Bundle Program</Link>.
          </li>
          <li>We may adjust, pause, or end promotional programs prospectively with notice.</li>
        </ul>
      </Section>

      <Section title="8. Errors & inaccuracies">
        <p>
          Occasionally product info, pricing, or availability may contain errors. We may correct such
          errors and cancel orders placed under incorrect terms; if your payment was captured, you’ll
          receive a prompt refund for the canceled portion.
        </p>
      </Section>

      <Section title="9. Accounts, security & acceptable use">
        <ul className="list-disc pl-5 space-y-1">
          <li>You’re responsible for maintaining the confidentiality of your login.</li>
          <li>
            Use the Site only for lawful purposes. Automated scraping, fraudulent activity, and
            attempts to circumvent purchase limits are prohibited.
          </li>
          <li>
            We may suspend or terminate accounts for suspected abuse, fraud, or violations of these terms.
          </li>
        </ul>
      </Section>

      <Section title="10. Intellectual property">
        <p>
          Site content (text, graphics, logos, images) is owned by or licensed to LuvBricks and is
          protected by applicable IP laws. LEGO® trademarks are the property of the LEGO Group, which
          does not sponsor, authorize, or endorse this site.
        </p>
      </Section>

      <Section title="11. Warranties & liability (the short version)">
        <ul className="list-disc pl-5 space-y-1">
          <li>The Site and products are provided “as is” except where required by law.</li>
          <li>
            To the fullest extent permitted, LuvBricks is not liable for indirect or consequential
            damages. Our total liability related to a purchase is limited to the amount you paid for
            the affected order.
          </li>
          <li>These limits do not restrict rights that cannot be waived under applicable law.</li>
        </ul>
      </Section>

      <Section title="12. Governing law & disputes">
        <p>
          These terms are governed by the laws of the State of California, without regard to its
          conflict-of-laws rules. You agree to the exclusive jurisdiction and venue of the state and
          federal courts located in Solano County, California, for any claims not subject to informal
          resolution. Nothing here prevents either party from seeking equitable relief for misuse of
          IP or breach of confidentiality.
        </p>
      </Section>

      <Section title="13. Changes to these terms">
        <p>
          We may update these terms to reflect changes in our services or the law. When we do, we’ll
          revise the “Last Updated” date above. Continued use of the Site after changes means you
          accept the new terms.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          Questions about these terms? Email{" "}
          <a href="mailto:customerservice@luvbricks.com" className="underline">
            customerservice@luvbricks.com
          </a>{" "}
          or write: LuvBricks LLC, 317 Elizabeth St, Vacaville, CA 95688.
        </p>
      </Section>

      <hr className="my-10 border-slate-200" />
      <p className="text-xs text-slate-500">
        © 2025 LuvBricks LLC. All rights reserved.
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="text-slate-700 text-base leading-7">{children}</div>
    </section>
  );
}
