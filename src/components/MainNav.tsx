// src/components/MainNav.tsx
import Link from "next/link";

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
  return (
    <div className="bg-white">
      <nav
        className={[
          "relative z-50 mx-auto max-w-7xl px-4 pt-5 pb-6",
          "flex flex-nowrap items-center justify-center", // single row, no wrap
          "gap-x-6 sm:gap-x-8 lg:gap-x-10",               // compact gaps on small screens
        ].join(" ")}
        aria-label="Primary"
      >
        <NavLink href="/AllProducts" label="All Products" />

        <NavDropdown label="Themes" items={THEMES} />

        <NavDropdown label="Age Groups" items={AGES} />

        <NavLink href="/tiers" label="Shop by Tier" />

        <NavLink href="/set-request" label="Set Request" />

        <NavLink href="/customer-service" label="Customer Service" />

        <NavLink href="/gift-guide" label="Gift Buyer’s Guide" />

        <NavLink href="/rewards" label="Rewards" />
      </nav>
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
