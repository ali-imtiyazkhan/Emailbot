"use client";

import React, { useState } from "react";

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#111" />
    <rect x="3.5" y="7.5" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <path d="M9 8.25 C10.5 8.25 10.5 13.5 14.5 13.5" stroke="#E0E0E0" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
    <rect x="15" y="12.75" width="5.5" height="1.5" rx="0.75" fill="#E0E0E0" />
    <rect x="3.5" y="15" width="17" height="1.5" rx="0.75" fill="#888" opacity="0.45" />
  </svg>
);

const recentAnalyses = [
  { text: "Priority scores calculated", time: "2m ago" },
  { text: "WhatsApp bridge active", time: "5m ago" },
  { text: "4 spam threads blocked", time: "22m ago" },
];

export default function AIChatPanel() {
  const [query, setQuery] = useState("");

  return (
    <div
      className="hidden xl:flex fixed right-6 top-20 bottom-6 w-[320px] z-40 flex-col bg-[#050505] border border-white/5 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-in-right"
      id="ai-chat-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">EmailBot</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-md hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors" aria-label="Settings">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 mb-10 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-md">
           <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engine Active</p>
        </div>

        {/* Intelligence Greeting */}
        <h2 className="text-2xl font-serif italic text-white mb-10">
          How can I assist your workflow?
        </h2>

        {/* Recent Analytics */}
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-5">
            Real-time Insights
          </p>
          <div className="space-y-2">
            {recentAnalyses.map((task, i) => (
              <div
                key={i}
                className="w-full flex items-center justify-between px-4 py-3 rounded-md bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors group cursor-default"
              >
                <span className="text-[13px] text-slate-400 group-hover:text-slate-200 transition-colors">
                  {task.text}
                </span>
                <span className="text-[9px] text-slate-800 font-black uppercase tracking-tighter">
                  {task.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Presets */}
        <div className="space-y-2 mb-6">
          {[
            "Summarize unread priority emails",
            "Generate draft for follow-ups",
            "Update forwarding logic",
          ].map((text) => (
            <button
               key={text}
               className="w-full text-right px-4 py-2 text-[12px] font-medium text-slate-500 hover:text-white transition-colors bg-white/[0.02] hover:bg-white/[0.04] rounded-md border border-white/5"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Command Input Area */}
      <div className="px-6 pb-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="relative">
          <input
            type="text"
            placeholder="System Command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-md px-5 py-4 text-[13px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-all shadow-2xl"
            id="ai-chat-input"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <button className="p-1 rounded-md bg-white/5 text-slate-400 hover:text-white transition-colors" aria-label="Send message">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Manifest Badge */}
        <div className="flex items-center gap-2 mt-5 justify-center opacity-40">
          <span className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">
             Engine Protocol v4.0.2
          </span>
        </div>
      </div>
    </div>
  );
}
