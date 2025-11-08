import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DEMO_MODE } from '@/lib/demoMode';

// NEW: import the sticky header wrapper and footer
import SiteHeader from "@/components/SiteHeader"; // or "../components/SiteHeader"
import Footer from "@/components/Footer";         // or "../components/Footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ CHANGED: metadata now reacts to DEMO_MODE
export const metadata: Metadata = {
  title: DEMO_MODE ? "LuvBricks Demo Store" : "LuvBricks",
  description: "Build more. Spend smart.",
  robots: DEMO_MODE
    ? {
        index: false,
        follow: false,
        nocache: true,
      }
    : {
        index: true,
        follow: true,
      },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}
      >
        {/* Sticky Hero (announcement + header + nav) on every page */}
        <SiteHeader />

        {/* ✅ NEW: global demo notice, only in DEMO_MODE */}
        {DEMO_MODE && (
          <div className="w-full border-b border-amber-500/40 bg-amber-500/10 py-1 text-center text-[10px] font-medium text-amber-600">
            Demo mode preview – UI/UX only. Orders, payments, and account
            changes are disabled in this environment.
          </div>
        )}

        {/* Page content */}
        <main className="min-h-[60vh]">{children}</main>

        {/* Global Footer on every page */}
        <Footer />
      </body>
    </html>
  );
}
