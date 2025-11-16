import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "LuvBricks",
  description: "Build more. Spend smart.",
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

        {/* Page content */}
        <main className="min-h-[60vh]">{children}</main>

        {/* Global Footer on every page */}
        <Footer />
      </body>
    </html>
  );
}
