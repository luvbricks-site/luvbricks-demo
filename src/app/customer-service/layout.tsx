import { CUSTOMER_SERVICE_LINKS } from "@/lib/nav";

export const revalidate = 60;

const NAV = CUSTOMER_SERVICE_LINKS;

import Link from "next/link";
import { headers } from "next/headers";

function isActive(pathname: string, href: string) {
  if (href === "/customer-service") return pathname === href;
  return pathname.startsWith(href);
}

export default async function CSLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? ""; // if you don’t set this header, no worries; active styles still look fine

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900">Customer Service</h1>
      <p className="mt-2 text-slate-600">
        Answers, policies, and ways to reach us. We ship within 24 hours on business days.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px,1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Small CTA card */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-900">Need help fast?</div>
            <div className="mt-0.5 text-xs text-slate-600">We respond within 1 business day.</div>
            <Link href="/customer-service/contact" className="mt-2 inline-block text-blue-700 text-sm font-semibold hover:underline">
              Contact Us →
            </Link>
          </div>
        </aside>

        {/* Page content */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </section>
      </div>
    </main>
  );
}
