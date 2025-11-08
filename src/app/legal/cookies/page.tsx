// src/app/legal/cookies/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies | LuvBricks",
  description:
    "How LuvBricks uses cookies and similar technologies, and how you can control them.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-800">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Cookies at LuvBricks</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: October 16, 2025</p>

      <Section title="A quick, honest overview">
        <p className="mb-3">
          We use cookies to keep your cart working, remember your sign-in, and understand what pages
          fans love most—so we can stock smarter and make the site smoother. We don’t run third-party
          ad networks, and we don’t sell your data. You’re in control and can change cookie settings
          any time.
        </p>
        <p className="text-sm text-slate-600">
          For how we handle personal data more broadly, see our{" "}
          <Link href="/legal/privacy" className="underline">
            Privacy Policy
          </Link>.
        </p>
      </Section>

      <Section title="What are cookies?">
        <p>
          Cookies are small text files stored on your device when you browse a website. They help
          sites remember things (like what’s in your cart) and collect basic analytics (like which
          pages are most popular). Similar tools (local storage, pixels) work in comparable ways, so
          we refer to them together as “cookies.”
        </p>
      </Section>

      <Section title="The cookies we use (plain English)">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Essential (required):</strong> Keep you signed in, remember your cart, process
            checkout, protect the site from fraud. Without these, the site won’t function correctly.
          </li>
          <li>
            <strong>Preferences (helpful):</strong> Save settings like addresses you use often or
            small UI preferences so things feel consistent next time.
          </li>
          <li>
            <strong>Analytics (anonymous-ish):</strong> Help us understand traffic and features
            people use (e.g., Google Analytics). We look at trends—not individuals—to improve
            navigation, content, and stock decisions.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          We do <strong>not</strong> use advertising or retargeting cookies from third-party ad
          networks.
        </p>
      </Section>

      <Section title="Who sets cookies here?">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>LuvBricks (first-party):</strong> Essential and preference cookies for login,
            cart, checkout, and site settings.
          </li>
          <li>
            <strong>Google Analytics (third-party):</strong> Basic site analytics (page views,
            session length, generic device/browser data). We use this to improve performance and
            usability. You can opt out—see “How to control cookies” below.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Operational tools like PayPal and Pirate Ship may read or set necessary cookies during
          checkout or label creation steps to complete your order securely. These are functional, not
          advertising.
        </p>
      </Section>

      <Section title="How long cookies stick around">
        <p>
          Some expire when you close your browser (session cookies). Others last longer so you don’t
          have to log in every visit or rebuild a cart (persistent cookies). Your browser lets you
          view and delete them at any time.
        </p>
      </Section>

      <Section title="How to control cookies">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Browser settings:</strong> Most browsers let you block or delete cookies. Search
            “cookies” in your browser’s settings to manage this.
          </li>
          <li>
            <strong>Analytics opt-out:</strong> Google offers a browser add-on to limit Analytics
            tracking. You can also block analytics cookies in your browser.
          </li>
          <li>
            <strong>Global Privacy Controls (GPC) / Do Not Track:</strong> If your browser sends
            these signals, we honor them where applicable for analytics cookies.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Heads up: blocking essential cookies will break sign-in, cart, and checkout.
        </p>
      </Section>

      <Section title="U.S. audience only">
        <p>
          LuvBricks serves U.S. customers and processes data in the United States. If you’re outside
          the U.S., please use the site at your discretion.
        </p>
      </Section>

      <Section title="Changes to this notice">
        <p>
          We may update this page as we refine our tools or add features. If changes are material,
          we’ll make it clear on-site. The “Last Updated” date shows the latest version.
        </p>
      </Section>

      <Section title="Questions?">
        <p>
          We’re here to help. Email{" "}
          <a href="mailto:customerservice@luvbricks.com" className="underline">
            customerservice@luvbricks.com
          </a>{" "}
          or write to: LuvBricks LLC, Attn: Privacy Team, 317 Elizabeth St, Vacaville, CA 95688.
        </p>
      </Section>
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
