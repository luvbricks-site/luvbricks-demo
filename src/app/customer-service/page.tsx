// src/app/customer-service/page.tsx
import Link from "next/link";

export default function Page() {
  const links = [
    { title: "FAQs",      desc: "Quick answers to common questions.",            href: "/customer-service/faqs" },
    { title: "Shipping",  desc: "Speeds, carriers, and tracking.",               href: "/customer-service/shipping" },
    { title: "Returns",   desc: "30-day policy and how to start a return.",      href: "/customer-service/returns" },
    { title: "Contact Us",desc: "Email form and response times.",                href: "/customer-service/contact" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">How we can help</h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((x) => (
          <li key={x.href} className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-sm">
            <Link href={x.href} className="text-base font-semibold text-slate-900 hover:underline">
              {x.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{x.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

