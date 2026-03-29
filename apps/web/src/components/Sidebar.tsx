"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchProfile, User } from "@/lib/api";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
      </svg>
    ),
  },
  {
    label: "Emails",
    href: "/emails",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Rules",
    href: "/rules",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const LogoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#111" />
    <rect x="3.5" y="7.5" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <path d="M9 8.25 C10.5 8.25 10.5 13.5 14.5 13.5" stroke="#E0E0E0" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    <rect x="15" y="12.75" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <rect x="3.5" y="15" width="17" height="1.5" rx="0.75" fill="#888" opacity="0.45" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setUser)
      .catch((err) => console.error("Failed to load user profile:", err));
  }, []);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] z-50 flex-col bg-black border-r border-white/5">
        <div className="flex flex-col h-full py-8 px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 px-3 mb-12 group no-underline">
            <LogoIcon />
            <div>
              <h1 className="text-[16px] font-bold text-white tracking-tight leading-none">EmailBot</h1>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1.5">AI Engine</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3.5 px-4 py-3 rounded-md text-[13px] font-bold transition-all duration-200
                    ${isActive
                      ? "bg-white/[0.04] text-white border border-white/5 shadow-2xl shadow-black"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                    }
                  `}
                >
                  <span className={isActive ? "text-white" : "text-slate-600 group-hover:text-slate-400 transition-colors"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Profile */}
          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 px-3 py-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-9 h-9 rounded-md bg-white/[0.03] border border-white/10 flex items-center justify-center text-[11px] font-black text-slate-400 uppercase">
                {user?.name?.[0] || user?.email?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-200 truncate">
                  {user?.name || "Initializing..."}
                </p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter truncate">
                  {user?.email || "..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between px-6 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-2 transition-all active:scale-90
                  ${isActive ? "text-white" : "text-slate-600"}
                `}
              >
                <div className={`p-1 rounded-md transition-colors ${isActive ? "bg-white/5" : ""}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
