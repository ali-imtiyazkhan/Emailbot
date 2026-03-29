"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50 selection:bg-indigo-500/30">
      {/* Animated mesh background */}
      <div className={isLanding ? "landing-mesh" : "mesh-bg"} />

      {/* Sidebar (hidden on landing) */}
      {!isLanding && <Sidebar />}

      {/* Main content area */}
      <main className={`relative z-10 min-h-screen ${isLanding ? "" : "lg:ml-[260px] pb-20 lg:pb-0"}`}>
        {children}
      </main>
    </div>
  );
}
