"use client";

import { useEffect, useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/header";
import MainNav from "@/components/MainNav";

/**
 * Wraps your announcement bar + header + main nav
 * and makes the whole “hero” sticky with a subtle shadow on scroll.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll(); // set initial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={[
        "sticky top-0 z-50",
        // subtle translucent bg so it looks great over any content
        "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70",
        scrolled ? "shadow-[0_1px_0_0_rgba(15,23,42,0.08)]" : "shadow-none",
      ].join(" ")}
    >
      <AnnouncementBar />
      <Header />
      <MainNav />
      {/* keep your thin divider if you want */}
      <div className="border-b border-slate-200" />
    </div>
  );
}
