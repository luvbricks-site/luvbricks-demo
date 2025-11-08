// src/components/header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import HeaderAccount from "@/components/HeaderAccount";
import CartBadge from "@/components/header/CartBadge";
import { DEMO_MODE } from "@/lib/demoMode";

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
        "sticky top-0 z-50",
        "transition-shadow",
        "bg-white text-slate-900 border-b",
        scrolled ? "shadow-sm" : "",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 pt-5 pb-3 flex items-center gap-6">
        {/* Left: Logo */}
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2"
          aria-label="LuvBricks Home"
        >
          <Image
            src="/brand/Finished_LB_Brand_transparent.png"
            alt="LuvBricks"
            width={180}
            height={40}
            priority
          />
        </Link>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center">
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

          {/* Mobile */}
          <form action="/search" method="GET" className="md:hidden w-full">
            <label htmlFor="q-mobile" className="sr-only">Search</label>
            <div className="relative">
              <input
                id="q-mobile"
                name="q"
                type="search"
                placeholder="Search set #, name, theme..."
                className="w-full rounded-full border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
        {DEMO_MODE && (
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-500">
          Demo
        </span>
   )}

        {/* Right: account + cart */}
        <nav className="flex items-center gap-5">
          <HeaderAccount />
          {/* Live cart (badge updates via /api/cart + localStorage ping) */}
          <CartBadge />
        </nav>
      </div>

      <div className="border-b border-slate-200 mt-3" />
    </header>
  );
}
