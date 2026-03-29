"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-navbar-scrolled" : "glass-navbar"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" id="landing-logo">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            E
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            EmailBot
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8" id="landing-nav">
          {["Features", "How it works", "Docs"].map((item) => (
            <button
              key={item}
              className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
            >
              {item}
            </button>
          ))}
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-white font-medium transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="hidden sm:block text-sm text-slate-400 hover:text-white font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="btn-primary-landing !py-2.5 !px-5 !text-[13px] flex items-center gap-2"
            id="landing-cta"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
