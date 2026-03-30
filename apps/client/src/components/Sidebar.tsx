"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, SlidersHorizontal, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Emails",    href: "/emails",    icon: Mail             },
  { label: "Rules",     href: "/rules",     icon: SlidersHorizontal},
  { label: "Settings",  href: "/settings",  icon: Settings         },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[220px] mt-10 gap-5 h-screen shrink-0 flex-col bg-[#050505] border-r border-[#1a1a1a]">
        {/* Logo */}
        <div className="px-5 pt-7 pb-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center shrink-0">
              <Mail size={14} className="text-white/50" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white leading-none">EmailBot</p>
              <p className="text-[10px] font-medium text-white/20 mt-1 uppercase tracking-widest">AI Engine</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <div className="px-3 flex-1">
          <p className="text-[10px] font-semibold text-white/15 uppercase tracking-[0.18em] px-3 mb-3">Menu</p>
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all no-underline
                    ${active
                      ? "bg-white/[0.08] text-white"
                      : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
                    }`}
                >
                  <Icon size={16} className={active ? "text-white/70" : "text-white/25"} strokeWidth={1.8} />
                  {label}
                  {active && <span className="ml-auto w-1 h-1 rounded-full bg-white/40" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User */}
        <div className="px-3 pb-6">
          <div className="h-px bg-[#1a1a1a] mb-4" />
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-md bg-[#111] border border-[#222] flex items-center justify-center text-[10px] font-bold text-white/30 uppercase shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white/50 truncate">Account</p>
              <p className="text-[10px] text-white/20 truncate">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-[#1a1a1a] flex">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-1.5 py-3 no-underline transition-colors ${active ? "text-white" : "text-white/25"}`}>
              <Icon size={18} strokeWidth={1.8} />
              <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}