"use client";

import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 px-6 text-center" id="hero-section">
      {/* Badge */}
      <div
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 mb-8 animate-fade-in"
        style={{ animationDelay: "100ms", animationFillMode: "both" }}
      >
        <span className="text-slate-600">✦</span>
        <span>AI-Powered</span>
        <span className="text-slate-600">·</span>
        <span>Email Intelligence</span>
      </div>

      {/* Heading */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 max-w-4xl mx-auto animate-fade-in"
        style={{ animationDelay: "200ms", animationFillMode: "both" }}
      >
        <span className="gradient-text-landing">The AI agent that</span>
        <br />
        <span className="text-serif-italic text-white/90 font-normal">
          manages your inbox.
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10 animate-fade-in"
        style={{ animationDelay: "350ms", animationFillMode: "both" }}
      >
        Connect your email. Describe what matters. EmailBot reads,
        prioritizes, and alerts you — on WhatsApp, without scripts
        or setup.
      </p>

      {/* CTA Buttons */}
      <div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in"
        style={{ animationDelay: "500ms", animationFillMode: "both" }}
      >
        <Link href="/dashboard" className="btn-primary-landing flex items-center gap-2" id="hero-cta-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Get Started — free
        </Link>
        <button className="btn-secondary-landing" id="hero-cta-secondary">
          See how it works
        </button>
      </div>

      {/* Social Proof */}
      <div
        className="flex items-center justify-center gap-3 animate-fade-in"
        style={{ animationDelay: "650ms", animationFillMode: "both" }}
      >
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {["bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"].map(
            (color, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full ${color} border-2 border-[#050816] flex items-center justify-center text-[9px] font-bold text-white`}
              >
                {["A", "B", "K", "M"][i]}
              </div>
            )
          )}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          <span className="text-slate-400 font-bold">547 developers</span>{" "}
          on the waitlist
        </span>
      </div>
    </section>
  );
}
