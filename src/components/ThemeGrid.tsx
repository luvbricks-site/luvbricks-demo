import Image from "next/image";
import Link from "next/link";

/** Card can link to a theme (/themes/[slug]) or a custom href (/tiers, /gift-guide) */
type CardItem = {
  name: string;
  img?: string;
  slug?: string;  // e.g. "star-wars"
  href?: string;  // e.g. "/tiers"
};

const CARDS: CardItem[] = [
  { slug: "star-wars",    name: "Star Wars",    img: "/images/jangofett_starship_lego.webp" },
  { slug: "harry-potter", name: "Harry Potter", img: "/images/harrypotter_castle_set.jpg" },
  { slug: "friends",      name: "Friends",      img: "/images/friends_strandresort_set.jpg" },
  { slug: "duplo",        name: "Duplo",        img: "/images/first_time_airport_10443.jpg" },
  { slug: "city",         name: "City",         img: "/images/city_tower_set.jpg" },
  { slug: "marvel",       name: "Marvel",       img: "/images/marvel_logo_set.jpg" },
  { slug: "cmf-series",   name: "CMF Series",   img: "/images/cmf_series27.jpg" },

  // NEW promo cards to fill the empty space on the last row:
  { href: "/tiers",       name: "Shop by Tier",       img: "/images/bundle_card_image.jpg" },
  { href: "/gift-guide",  name: "Buyer’s Gift Guide", img: "/images/gift_guide_card_image.webp" },
];

export default function ThemeGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CARDS.map((item) => (
          <ThemeCard key={(item.href ?? item.slug)!} item={item} />
        ))}
      </div>
    </section>
  );
}

function ThemeCard({ item }: { item: CardItem }) {
  const href = item.href ?? `/themes/${item.slug}`;

  return (
    <Link
      href={href}
      className="group rounded-3xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all"
    >
      {/* keep your tall card look */}
      <div className="relative aspect-[3/4] bg-slate-50">
        {item.img ? (
          <Image
            src={item.img}
            alt={`${item.name} preview`}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <PlaceholderBrand title={item.name} />
        )}
      </div>

      <div className="px-5 py-4 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
          {item.name}
        </h3>
        <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Shop →
        </span>
      </div>
    </Link>
  );
}

function PlaceholderBrand({ title }: { title: string }) {
  return (
    <svg
      viewBox="0 0 1200 750"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1200" height="750" fill="#f8fafc" />
      <rect width="1200" height="750" fill="url(#grid)" />
      <g opacity="0.08" transform="translate(880,120) scale(1.2)">
        <path d="M120 40c-24-45-94-45-118 0-26 48 11 90 59 126 48-36 85-78 59-126z" fill="#0f172a" />
      </g>
    </svg>
  );
}
