"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchProfile, User } from "@/lib/api";
import { LayoutDashboard, Mail, SlidersHorizontal, Settings, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Emails",     href: "/emails",     icon: Mail              },
  { label: "Analytics",  href: "/analytics",  icon: BarChart3         },
  { label: "Rules",      href: "/rules",      icon: SlidersHorizontal },
  { label: "Settings",   href: "/settings",   icon: Settings          },
];

const LogoMark = () => (
  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="7.5" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
      <path d="M9 8.25 C10.5 8.25 10.5 13.5 14.5 13.5" stroke="#E0E0E0" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      <rect x="15" y="12.75" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
      <rect x="3.5" y="15" width="17" height="1.5" rx="0.75" fill="#888" opacity="0.45" />
    </svg>
  </div>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setUser)
      .catch((err) => console.error("Failed to load user profile:", err));
  }, []);

  const initial = user?.name?.[0] || user?.email?.[0] || "A";
  const displayName = user?.name || "Loading...";
  const displayEmail = user?.email || "";

  return (
    <>
      {/* ── Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] h-screen shrink-0 flex-col bg-[rgba(5,5,5,0.82)] backdrop-blur-[20px] border-r border-[#1c1c1c] sticky top-0 z-50">
        <div className="flex flex-col h-full px-5 py-7 relative">
          
          {/* Subtle accent line */}
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-50" />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300 mb-8 no-underline group">
            <LogoMark />
            <div>
              <p className="text-[15px] font-bold text-white tracking-tight">EmailBot</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9a9a9a] mt-0.5">AI Engine</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-2.5 flex-1 w-full relative z-10">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-[13.5px] font-medium transition-all duration-300 no-underline group overflow-hidden
                    ${active
                      ? "text-white shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                      : "text-[#888] hover:text-white hover:bg-[#0f0f0f]"
                    }`}
                >
                  {/* Active highlight background via Framer Motion */}
                  {active && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator"
                      className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {active && (
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 blur-xl pointer-events-none rounded-full" />
                  )}

                  <Icon size={16} className={`relative z-10 ${active ? "text-white" : "text-[#888] group-hover:text-[#d4d4d4]"}`} strokeWidth={active ? 2 : 1.8} />
                  <span className="relative z-10 tracking-tight">{label}</span>
                  {active && (
                    <motion.span 
                      layoutId="sidebarActiveDot"
                      className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-[#e8e8e8] shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="relative z-10 mt-auto">
            <div className="h-px bg-[#1c1c1c] mb-4" />
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#0f0f0f] border border-transparent hover:border-[#2a2a2a] transition-all duration-300 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-[#171717] border border-[#2a2a2a] flex items-center justify-center text-[11px] font-bold text-[#e8e8e8] uppercase shrink-0 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition-all">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white/80 truncate leading-none mb-1.5">{displayName}</p>
                <p className="text-[10px] text-[#888] font-medium truncate">{displayEmail}</p>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(5,5,5,0.85)] backdrop-blur-[20px] border-t border-[#1c1c1c] flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1.5 py-4 no-underline transition-colors ${active ? "text-white bg-white/[0.03]" : "text-[#888] hover:bg-white/[0.02]"}`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}