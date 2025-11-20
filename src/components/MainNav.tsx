// src/components/MainNav.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

type HrefObj = { pathname: string; query?: Record<string, string> };
type NavItem = { href: string | HrefObj; label: string };

// --- Helpers ---------------------------------------------------------------

// If your Prisma schema stores ageMin as an INT, map 1.5 → 2 for filtering.
// If you store Decimal/Float and want true 1.5 filtering, change to return "1.5".
const toQueryAge = (a: number) => (a === 1.5 ? "2" : String(a));

// Build AllProducts links with query
const allProducts = (q?: Record<string, string>): HrefObj => ({
  pathname: "/AllProducts",
  query: q ?? {},
});

// --- Menus -----------------------------------------------------------------

// Themes → /AllProducts?theme=<slug>
const THEMES: NavItem[] = [
  { label: "Star Wars",     href: allProducts({ theme: "star-wars" }) },
  { label: "Harry Potter",  href: allProducts({ theme: "harry-potter" }) },
  { label: "Friends",       href: allProducts({ theme: "friends" }) },
  { label: "Duplo",         href: allProducts({ theme: "duplo" }) },
  { label: "City",          href: allProducts({ theme: "city" }) },
  { label: "Marvel",        href: allProducts({ theme: "marvel" }) },
  { label: "CMF Series",    href: allProducts({ theme: "cmf-series" }) },
];

// Age Groups → /AllProducts?age=<min>
const AGE_VALUES = [1.5, 4, 6, 9, 13, 18] as const;
const AGES: NavItem[] = AGE_VALUES.map((a) => ({
  label: a === 1.5 ? "1.5+" : `${a}+`,
  href: allProducts({ age: toQueryAge(a) }),
}));

// --- Component -------------------------------------------------------------

export default function MainNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* MOBILE: Search bar at top of nav section */}
      <div className="md:hidden px-3 py-2 border-b border-slate-200">
        <form action="/search" method="GET">
          <label htmlFor="q-mobile" className="sr-only">Search</label>
          <div className="relative">
            <input
              id="q-mobile"
              name="q"
              type="search"
              placeholder="Search set #, name, theme..."
              className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-slate-600 hover:text-slate-900"
            >
              ↵
            </button>
          </div>
        </form>
      </div>

      {/* DESKTOP: Horizontal nav */}
      <nav
        className={[
          "hidden md:flex relative z-50 mx-auto max-w-7xl px-4 pt-5 pb-6",
          "flex-nowrap items-center justify-center",
          "gap-x-6 sm:gap-x-8 lg:gap-x-10",
        ].join(" ")}
        aria-label="Primary"
      >
        <NavLink href="/AllProducts" label="All Products" />
        <NavDropdown label="Themes" items={THEMES} />
        <NavDropdown label="Age Groups" items={AGES} />
        <NavLink href="/tiers" label="Shop by Tier" />
        <NavLink href="/set-request" label="Set Request" />
        <NavLink href="/customer-service" label="Customer Service" />
        <NavLink href="/gift-guide" label="Gift Buyer's Guide" />
        <NavLink href="/rewards" label="Rewards" />
      </nav>

      {/* MOBILE: Hamburger menu button */}
      <div className="md:hidden px-3 py-2 flex items-center justify-between bg-white border-b border-slate-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* MOBILE: Dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-3 py-2 space-y-1">
            <MobileNavLink href="/AllProducts" label="All Products" onClick={() => setMobileMenuOpen(false)} />
            
            <MobileNavSection label="Themes">
              {THEMES.map((item) => (
                <MobileNavLink
                  key={typeof item.href === "string" ? item.href : JSON.stringify(item.href)}
                  href={item.href}
                  label={item.label}
                  onClick={() => setMobileMenuOpen(false)}
                  indent
                />
              ))}
            </MobileNavSection>

            <MobileNavSection label="Age Groups">
              {AGES.map((item) => (
                <MobileNavLink
                  key={typeof item.href === "string" ? item.href : JSON.stringify(item.href)}
                  href={item.href}
                  label={item.label}
                  onClick={() => setMobileMenuOpen(false)}
                  indent
                />
              ))}
            </MobileNavSection>

            <MobileNavLink href="/tiers" label="Shop by Tier" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/set-request" label="Set Request" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/customer-service" label="Customer Service" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/gift-guide" label="Gift Buyer's Guide" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/rewards" label="Rewards" onClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label }: { href: string | HrefObj; label: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="text-base sm:text-lg lg:text-xl font-medium hover:text-slate-900 transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  onClick,
  indent = false,
}: {
  href: string | HrefObj;
  label: string;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-base hover:bg-slate-100 transition-colors ${
        indent ? "ml-4 text-slate-700" : "font-medium"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: NavItem[];
}) {
  return (
    <div className="relative group inline-block" tabIndex={0} aria-haspopup="menu">
      {/* Trigger */}
      <span
        className="relative inline-block px-2 py-1 text-base sm:text-lg lg:text-xl font-medium text-slate-800
                   group-hover:text-slate-900 focus:outline-none z-10"
        aria-expanded="false"
      >
        {label}
        {/* highlight pill sits BEHIND the text now */}
        <span
          className="pointer-events-none absolute inset-x-[-12px] inset-y-[-6px] rounded-full bg-slate-100
                     opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity -z-10"
        />
      </span>

      {/* HOVER BRIDGE: invisible area that keeps :hover alive while moving down */}
      <div className="absolute left-0 right-0 top-full h-3" />

      {/* Dropdown panel */}
      <div
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100
                   group-focus:visible group-focus:opacity-100
                   transition-opacity duration-150
                   absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)]
                   min-w-[220px] rounded-2xl border border-slate-200 bg-white shadow-xl p-2 z-20"
        role="menu"
      >
        <ul className="py-2">
          {items.map((it) => (
            <li key={typeof it.href === "string" ? it.href : JSON.stringify(it.href)}>
              <Link
                href={it.href}
                prefetch={false}
                role="menuitem"
                className="block px-4 py-2.5 text-sm sm:text-base rounded-xl
                           hover:bg-slate-50 hover:text-slate-900"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* little pill highlight behind the trigger (like your screenshot) */}
      <span
        className="pointer-events-none absolute inset-x-[-10px] -top-1 h-9 rounded-full bg-slate-100 opacity-0
                   group-hover:opacity-100 group-focus:opacity-100 transition-opacity"
      />
    </div>
  );
}
