// src/app/legal/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal | LuvBricks",
  description:
    "Legal information for LuvBricks: terms, privacy, cookies, IP notices, accessibility, and contact details.",
};

export default function LegalIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Legal</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: October 19, 2025</p>

      <Intro>
        LuvBricks is a U.S.–based ecommerce site for LEGO® sets. This page collects our core legal
        information in one place. It’s written in plain language. Use the quick links below.
      </Intro>

      <QuickLinks />

      <Section title="About LuvBricks & Scope">
        <p>
          LuvBricks (“we,” “us,” or “our”) operates <strong>luvbricks.com</strong> for customers in
          the United States. We currently ship domestically within the U.S. only. These notices
          cover your use of the site, your orders, and how we handle information when you interact
          with us online.
        </p>
      </Section>

      <Section title="Trademarks & Brand Notices">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>LEGO®</strong>, the LEGO logo, and the Minifigure are trademarks of the LEGO
            Group. The LEGO Group does not sponsor, authorize, or endorse this site.
          </li>
          <li>
            “LuvBricks” and all related site graphics, logos, and content are owned by or licensed
            to LuvBricks. Please do not use our trademarks without explicit permission.
          </li>
        </ul>
      </Section>

      <Section title="Content & Intellectual Property">
        <p>
          Site content—text, images, graphics, and product data—is protected by intellectual
          property laws. You may browse and share links for personal, non-commercial use. Any
          scraping, bulk download, or reproduction without permission is not allowed. If you believe
          content on this site infringes your rights, see “Notices & Takedowns” below.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the site lawfully and respectfully—no abuse, fraud, or harassment.</li>
          <li>No automated scraping, credential stuffing, or attempts to bypass purchase limits.</li>
          <li>Security research? Contact us first so we can coordinate a safe test.</li>
        </ul>
      </Section>

      <Section title="Orders, Pricing & Availability (Summary)">
        <p>
          Orders are accepted when we send a confirmation email. Prices are in USD and exclude tax
          and shipping unless stated. Inventory and pricing may change. We may limit quantities or
          cancel suspected fraudulent orders. Full details live in our{" "}
          <Link href="/legal/terms" className="underline">Terms & Conditions</Link>.
        </p>
      </Section>

      <Section title="Shipping & Returns (Summary)">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            U.S.–only shipping; rates and credits are explained in{" "}
            <Link href="/customer-service/shipping" className="underline">Shipping & Delivery</Link>.
          </li>
          <li>
            Returns within 30 days; items unused and in original packaging. Customer pays return
            shipping. Damaged sets may be exchanged for the same product with proof. See{" "}
            <Link href="/customer-service/returns" className="underline">Returns</Link>.
          </li>
          <li>
            Bundle discounts and LuvPoints can stack. See{" "}
            <Link href="/bundle" className="underline">Bundle Program</Link> and{" "}
            <Link href="/rewards" className="underline">Rewards</Link>.
          </li>
        </ul>
      </Section>

      <Section title="Privacy, Cookies & Security (Summary)">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            We collect basic account and order info (name, email, U.S. address), plus usage data via
            cookies. We don’t sell personal data. See our{" "}
            <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
          </li>
          <li>
            Cookies keep carts and logins working and help us improve the site (Google Analytics).
            Details and controls are in our{" "}
            <Link href="/legal/cookies" className="underline">Cookies</Link> page.
          </li>
          <li>
            Payments are processed through partners (e.g., PayPal). We don’t store full card numbers
            on our servers. Saved payment method is optional.
          </li>
        </ul>
      </Section>

      <Section title="Accessibility">
        <p>
          We aim to make LuvBricks usable for all fans. If any page or flow is difficult to use with
          assistive technologies, email{" "}
          <a href="mailto:customerservice@luvbricks.com" className="underline">
            customerservice@luvbricks.com
          </a>{" "}
          with the page URL and what you’re trying to do—we’ll help and prioritize a fix.
        </p>
      </Section>

      <Section title="Notices & Takedowns (DMCA-style)">
        <p>
          If you believe material on this site infringes your copyright or trademark, send a notice
          to the address below with: (1) your contact info; (2) a description of the work and the
          exact URL of the allegedly infringing content; (3) a statement of good-faith belief that
          use is not authorized; and (4) a statement under penalty of perjury that your notice is
          accurate and that you’re authorized to act. We’ll review promptly and, if appropriate,
          remove or disable access to the content while we assess.
        </p>
      </Section>

      <Section title="Disputes & Governing Law">
        <p>
          This site is operated in California for U.S. customers. Disputes will be governed by
          California law (without regard to conflicts rules) and handled in the state or federal
          courts of Solano County, California. Nothing here limits either party’s ability to seek
          equitable relief for misuse of IP or confidential information.
        </p>
      </Section>

      <Section title="Changes to This Page">
        <p>
          We may update legal content to reflect new features or laws. The “Last Updated” date shows
          the current version. For material changes, we’ll provide a clearer on-site notice.
        </p>
      </Section>

      <Section title="Contact">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Email:{" "}
            <a href="mailto:customerservice@luvbricks.com" className="underline">
              customerservice@luvbricks.com
            </a>
          </li>
          <li>
            Mail: LuvBricks LLC, Attn: Legal, 317 Elizabeth St, Vacaville, CA 95688
          </li>
        </ul>
      </Section>

      <hr className="my-10 border-slate-200" />
      <p className="text-xs text-slate-500">
        © 2025 LuvBricks LLC. All rights reserved.
      </p>
    </main>
  );
}

/* ---------- Local UI bits ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="text-slate-700 text-base leading-7">{children}</div>
    </section>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-700 text-base leading-7 mb-6">{children}</p>;
}

function QuickLinks() {
  const linkCls = "underline";
  return (
    <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Quick Links</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
        <li><Link href="/legal/terms" className={linkCls}>Terms & Conditions</Link></li>
        <li><Link href="/legal/privacy" className={linkCls}>Privacy Policy</Link></li>
        <li><Link href="/legal/cookies" className={linkCls}>Cookies</Link></li>
        <li><Link href="/customer-service/shipping" className={linkCls}>Shipping & Delivery</Link></li>
        <li><Link href="/customer-service/returns" className={linkCls}>Returns</Link></li>
        <li><Link href="/bundle" className={linkCls}>Bundle Program</Link></li>
        <li><Link href="/rewards" className={linkCls}>LuvPoints Rewards</Link></li>
        <li><Link href="/customer-service" className={linkCls}>Customer Service</Link></li>
      </ul>
    </div>
  );
}
