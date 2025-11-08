"use client";
import Link from "next/link";
import { Youtube, Instagram, Facebook } from "lucide-react";
import { SiTiktok } from "react-icons/si"; // ← TikTok from react-icons
import { SiPaypal, SiMastercard, SiVisa, SiAmericanexpress, SiDiscover } from "react-icons/si";


function BrandIconPill({
  label, color, children,
}: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 h-8 px-3 rounded-md bg-white/95 text-slate-900 shadow-sm">
      <span className="grid place-items-center" style={{ color }}>{children}</span>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-[#F8FAFC] mt-16">
      {/* Top content band */}
      <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Become a Member (left) */}
        <section aria-labelledby="member-title">
          <h3 id="member-title" className="text-xl font-extrabold">Become a Member</h3>
          <p className="mt-2 text-sm/6 text-slate-200 max-w-prose">
            Stay up to date on the latest news about LuvBricks, seasonal deals and promotions.
          </p>

          <form
            className="mt-4 grid grid-cols-1 gap-3 max-w-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="member-name">Name</label>
            <input
              id="member-name"
              type="text"
              placeholder="Your name"
              className="rounded-lg bg-white/95 text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
            />
            <label className="sr-only" htmlFor="member-email">Email</label>
            <input
              id="member-email"
              type="email"
              placeholder="you@example.com"
              className="rounded-lg bg-white/95 text-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="mt-1 inline-flex w-fit rounded-lg bg-amber-500 text-slate-900 px-4 py-2 text-sm font-semibold hover:brightness-95"
            >
              Sign Me Up
            </button>
          </form>
        </section>

        {/* Company + links (middle) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-extrabold">LuvBricks LLC</h4>
            <address className="not-italic mt-1 text-sm text-slate-200">
              317 Elizabeth St.<br />
              Vacaville, CA 95688
            </address>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              <Link href="#" aria-label="YouTube" className="p-2 rounded-lg bg-white/10 hover:bg-white/15">
                <Youtube size={18} />
              </Link>
              <Link href="#" aria-label="TikTok" className="p-2 rounded-lg bg-white/10 hover:bg-white/15"><SiTiktok size={18} />
              </Link>
              <Link href="#" aria-label="Instagram" className="p-2 rounded-lg bg-white/10 hover:bg-white/15">
                <Instagram size={18} />
              </Link>
              <Link href="#" aria-label="Facebook" className="p-2 rounded-lg bg-white/10 hover:bg-white/15">
                <Facebook size={18} />
              </Link>
            </div>
          </div>

          <nav className="grid grid-cols-1 gap-2 text-sm">
            {/* Keep all links except how to order/how to pay/gift cards */}
            <FooterLink href="/customer-service/shipping">Shipping and delivery</FooterLink>
            <FooterLink href="/rewards">Earn LuvPoints</FooterLink>
            <FooterLink href="/bundle">Bundle Program</FooterLink>
            <FooterLink href="/customer-service/returns">Returns</FooterLink>
            <FooterLink href="/customer-service">Customer service</FooterLink>
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/cookies">Cookies</FooterLink>
            <FooterLink href="/legal/terms">Terms and conditions</FooterLink>
            <FooterLink href="/legal">Legal</FooterLink>
          </nav>
        </section>

        {/* Payments + warning (right) */}
        <section className="grid grid-rows-[auto_1fr] gap-5">
          <div className="flex flex-wrap items-center gap-3">
  <BrandIconPill label="PayPal"          color="#00457C"><SiPaypal size={18} /></BrandIconPill>
  <BrandIconPill label="Mastercard"      color="#EB001B"><SiMastercard size={18} /></BrandIconPill>
  <BrandIconPill label="VISA"            color="#1A1F71"><SiVisa size={18} /></BrandIconPill>
  <BrandIconPill label="American Express" color="#2E77BC"><SiAmericanexpress size={18} /></BrandIconPill>
  <BrandIconPill label="Discover"        color="#F47216"><SiDiscover size={18} /></BrandIconPill>
</div>


          <div>
            <h5 className="font-extrabold">Small Parts Warning</h5>
            <p className="mt-2 text-sm text-slate-200 max-w-sm">
              Warning! Choking Hazard! LEGO contains small parts and is not suitable for children under the age of 3!
            </p>
          </div>
        </section>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Bottom row */}
      <div className="mx-auto max-w-7xl px-4 py-6 relative">
        <p className="text-xs text-slate-300">
          LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this website.
        </p>

        {/* black bubble (bottom-right inside footer) */}
        <div className="absolute right-4 bottom-4">
          <div className="rounded-xl bg-black text-white text-xs px-3 py-2 shadow">
            © LuvBricks LLC 2025 · Powered by [placeholder] · Web design by LuvBricks LLC
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hover:underline underline-offset-4 decoration-amber-500/70"
    >
      {children}
    </Link>
  );
}
