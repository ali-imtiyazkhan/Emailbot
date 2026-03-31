"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchProfile, User } from "@/lib/api";
import { LayoutDashboard, Mail, SlidersHorizontal, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Emails",    href: "/emails",    icon: Mail              },
  { label: "Rules",     href: "/rules",     icon: SlidersHorizontal },
  { label: "Settings",  href: "/settings",  icon: Settings          },
];

const LogoMark = () => (
  <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="7" width="5.5" height="1.6" rx="0.8" fill="#d4d4d4" />
      <path d="M9 7.8 C10.8 7.8 10.8 13.6 15 13.6" stroke="#d4d4d4" strokeWidth="1.3" strokeLinecap="round" opacity="0.35" />
      <rect x="15.5" y="13" width="5" height="1.6" rx="0.8" fill="#d4d4d4" />
      <rect x="3.5" y="15.5" width="17" height="1.4" rx="0.7" fill="#555" />
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
      <aside className="hidden lg:flex w-[220px] h-screen shrink-0 flex-col bg-[#050505] border-r border-[#161616] sticky top-0">
        <div className="flex flex-col h-full px-4 py-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors mb-7 no-underline group">
            <LogoMark />
            <div>
              <p className="text-[14px] font-semibold text-white leading-none">EmailBot</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 mt-1">AI Engine</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 flex-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all no-underline
                    ${active
                      ? "bg-white/[0.07] text-white border border-[#1e1e1e]"
                      : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
                    }`}
                >
                  <Icon size={15} className={active ? "text-white/70" : "text-white/22"} strokeWidth={1.8} />
                  {label}
                  {active && <span className="ml-auto w-1 h-1 rounded-full bg-white/30" />}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div>
            <div className="h-px bg-[#161616] mb-4" />
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
              <div className="w-7 h-7 rounded-md bg-[#111] border border-[#222] flex items-center justify-center text-[10px] font-bold text-white/30 uppercase shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white/50 truncate leading-none mb-1">{displayName}</p>
                <p className="text-[10px] text-white/18 truncate">{displayEmail}</p>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-[#161616] flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 no-underline transition-colors ${active ? "text-white" : "text-white/25"}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}