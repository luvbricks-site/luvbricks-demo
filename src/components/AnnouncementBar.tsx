"use client";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Bundle & Save: add 3+ in the same price tier—savings show at checkout.",
  "Rewards: 1 pt per $1 on every purchase (account required).",
  "Ships within 24 hours; packed for collectors.",
];

export default function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(prev => (prev + 1) % MESSAGES.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full bg-[#0F172A] text-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-3 py-1 text-center font-medium">
        {MESSAGES[i]}
      </div>
    </div>
  );
}
