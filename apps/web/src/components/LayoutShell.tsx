"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white/20">
      {!isLanding && <Sidebar />}
      <main className={`flex-1 min-w-0 relative z-10 min-h-screen overflow-x-hidden ${isLanding ? "" : "pb-20 lg:pb-0"}`}>
        {children}
      </main>
    </div>
  );
}