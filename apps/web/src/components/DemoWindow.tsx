"use client";

import React from "react";

const LogoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#111" />
    <rect x="3.5" y="7.5" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <path d="M9 8.25 C10.5 8.25 10.5 13.5 14.5 13.5" stroke="#E0E0E0" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    <rect x="15" y="12.75" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <rect x="3.5" y="15" width="17" height="1.5" rx="0.75" fill="#888" opacity="0.45" />
  </svg>
);

export default function DemoWindow() {
  return (
    <section className="relative px-6 pb-20" id="demo-section">
      <div
        className="max-w-5xl mx-auto animate-fade-in"
        style={{ animationDelay: "800ms", animationFillMode: "both" }}
      >
        <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/5" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/5" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/5" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/[0.04] rounded-md px-4 py-1 text-[10px] text-slate-600 font-mono tracking-tight uppercase font-bold">
                emailbot.app/intelligence
              </div>
            </div>
            <div className="w-12" />
          </div>

          {/* Content area - dual panel */}
          <div className="flex flex-col md:flex-row min-h-[420px]">
            {/* Left panel - Inbox stream */}
            <div className="flex-1 p-7 border-r border-white/5 bg-black/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-700">Incoming Feed</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Scanning...</span>
                </div>
              </div>

              {/* Shimmer loading lines */}
              <div className="space-y-3 mb-8 opacity-20">
                <div className="h-1 bg-white/10 w-3/4 rounded-full" />
                <div className="h-1 bg-white/10 w-full rounded-full" />
              </div>

              {/* Mock email cards */}
              <div className="space-y-3">
                {[
                  { priority: 9, subject: "Urgent: Q4 Data Review", from: "ceo@acme.corp", time: "2m ago" },
                  { priority: 7, subject: "New Feature Request: API", from: "dev-team@github.com", time: "14m ago" },
                  { priority: 4, subject: "Weekly Newsletter #402", from: "daily@tech.io", time: "1h ago" },
                ].map((email, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-md bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group cursor-default"
                    style={{ animation: `fade-in 0.4s ease-out ${i * 150 + 1000}ms both` }}
                  >
                    <div className="w-8 h-8 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:text-white transition-colors">
                      {email.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-300 truncate group-hover:text-white transition-colors">{email.subject}</p>
                      <p className="text-[10px] text-slate-600 truncate mt-0.5">{email.from}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-black text-slate-700 uppercase">{email.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel - AI Interaction */}
            <div className="w-full md:w-[320px] p-7 flex flex-col bg-black/40">
              {/* Agent header */}
              <div className="flex items-center gap-3 mb-10">
                <LogoIcon />
                <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">EmailBot</span>
              </div>

              {/* Interaction log */}
              <div className="flex-1 space-y-6">
                <div
                  className="bg-white/[0.04] border border-white/5 rounded-md px-4 py-3 text-[12px] text-slate-400 font-medium leading-relaxed max-w-[240px] ml-auto"
                  style={{ animation: "fade-in 0.4s ease-out 1200ms both" }}
                >
                  "Summarize the most urgent thread from this morning."
                </div>

                <div
                  className="space-y-2.5"
                  style={{ animation: "fade-in 0.4s ease-out 1600ms both" }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">Agent Intelligence</p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-md px-4 py-3">
                    <p className="text-[12px] text-slate-400 leading-relaxed italic font-serif">
                      Found a critical thread regarding "Q4 Data Review". Summary: The board needs the final numbers by 5 PM today. No further blockers identified.
                    </p>
                  </div>
                </div>

                <div
                  className="bg-white/[0.04] border border-white/5 rounded-md px-4 py-3 text-[12px] text-slate-400 font-medium leading-relaxed max-w-[240px]"
                  style={{ animation: "fade-in 0.4s ease-out 2200ms both" }}
                >
                  "Forward that summary to Slack and notify me via WhatsApp."
                </div>

                <div
                  className="flex items-center gap-2"
                  style={{ animation: "fade-in 0.4s ease-out 2600ms both" }}
                >
                   <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Executing Automation...</p>
                </div>
              </div>

              {/* Input simulator */}
              <div
                className="mt-10 bg-white/[0.02] border border-white/5 rounded-md px-4 py-3 flex items-center gap-3 opacity-60"
                style={{ animation: "fade-in 0.4s ease-out 3000ms both" }}
              >
                <div className="w-3 h-3 text-slate-700">
                   <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
                <span className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">Ask EmailBot...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
