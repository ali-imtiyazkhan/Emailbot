"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white/20 relative">
      {!isLanding && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle dot grid */}
          <div 
            className="absolute inset-0 opacity-[0.35]" 
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.042) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 10%, transparent 80%)"
            }} 
          />
          {/* Global top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_65%)]" />
        </div>
      )}
      
      {!isLanding && <Sidebar />}
      
      <main className={`flex-1 min-w-0 relative z-10 min-h-screen overflow-x-hidden ${isLanding ? "" : "pb-20 lg:pb-0"}`}>
        {children}
      </main>
    </div>
  );
}