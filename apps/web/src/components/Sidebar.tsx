"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchProfile, User } from "@/lib/api";
import { LayoutDashboard, Mail, SlidersHorizontal, Settings, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Emails", href: "/emails", icon: Mail },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Rules", href: "/rules", icon: SlidersHorizontal },
  { label: "Settings", href: "/settings", icon: Settings },
];

const LogoMark = () => (
  <div className="nav-logo-mark">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
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
  const displayName = user?.name || "Account";
  const displayEmail = user?.email || "";

  return (
    <>
      <aside className="app-sidebar">
        <div className="app-sidebar-inner">
          <Link href="/" className="app-sidebar-brand">
            <LogoMark />
            <span>EmailBot</span>
          </Link>

          <nav className="app-sidebar-nav">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={`app-sidebar-link ${active ? "app-sidebar-link--active" : ""}`}>
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="app-sidebar-link-bg"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={16} strokeWidth={active ? 2 : 1.6} className="app-sidebar-link-icon" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="app-sidebar-user">
            <div className="app-sidebar-avatar">{initial}</div>
            <div className="app-sidebar-user-text">
              <p>{displayName}</p>
              <p>{displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
