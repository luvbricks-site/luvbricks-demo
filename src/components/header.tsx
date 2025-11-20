// src/components/header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import HeaderAccount from "@/components/HeaderAccount";
import CartBadge from "@/components/header/CartBadge";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll(); // initialize on first paint
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "md:sticky md:top-0 z-50",
        "transition-shadow",
        "bg-white text-slate-900 border-b",
        scrolled ? "md:shadow-sm" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-3 md:px-4 pt-2 pb-1 md:pt-5 md:pb-3 flex items-center gap-4 md:gap-6">
        {/* Left: Logo */}
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2"
          aria-label="LuvBricks Home"
        >
          <Image
            src="/brand/Finished_LB_Brand_transparent.png"
            alt="LuvBricks"
            width={140}
            height={32}
            priority
            className="md:w-[180px] md:h-[40px] w-[140px] h-[32px]"
          />
        </Link>

        {/* Center: Search - hidden on mobile, shown on desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          {/* Desktop */}
          <form action="/search" method="GET" className="hidden md:block w-full max-w-2xl">
            <label htmlFor="q-desktop" className="sr-only">Search</label>
            <div className="relative">
              <input
                id="q-desktop"
                name="q"
                type="search"
                placeholder="Search set #, name, theme..."
                className="w-full rounded-full border border-slate-300 px-6 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-slate-600 hover:text-slate-900"
              >
                ↵
              </button>
            </div>
          </form>
        </div>

        {/* Right: account + cart */}
        <nav className="flex items-center gap-3 md:gap-5">
          <HeaderAccount />
          {/* Live cart (badge updates via /api/cart + localStorage ping) */}
          <CartBadge />
        </nav>
      </div>

      <div className="border-b border-slate-200 mt-2 md:mt-3" />
    </header>
  );
}
