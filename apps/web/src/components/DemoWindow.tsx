"use client";

import React from "react";

export default function DemoWindow() {
  return (
    <section className="relative px-6 pb-20" id="demo-section">
      <div
        className="max-w-5xl mx-auto animate-fade-in"
        style={{ animationDelay: "800ms", animationFillMode: "both" }}
      >
        <div className="demo-window overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full demo-dot-red" />
              <div className="w-3 h-3 rounded-full demo-dot-yellow" />
              <div className="w-3 h-3 rounded-full demo-dot-green" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/[0.04] rounded-md px-4 py-1 text-[11px] text-slate-500 font-mono">
                emailbot.app/dashboard
              </div>
            </div>
            <div className="w-12" />
          </div>

          {/* Content area - dual panel */}
          <div className="flex flex-col md:flex-row min-h-[380px]">
            {/* Left panel - Email processing demo */}
            <div className="flex-1 p-6 border-r border-white/[0.04]">
              {/* Shimmer loading lines */}
              <div className="space-y-3 mb-6">
                <div className="demo-line w-3/4" style={{ animationDelay: "0s" }} />
                <div className="demo-line w-full" style={{ animationDelay: "0.5s" }} />
                <div className="demo-line w-5/6" style={{ animationDelay: "1s" }} />
                <div className="demo-line w-2/3" style={{ animationDelay: "1.5s" }} />
              </div>

              {/* Mock email cards */}
              <div className="space-y-3">
                {[
                  { priority: 9, subject: "Q4 Board Meeting — Action Required", from: "ceo@acme.co", tag: "Critical" },
                  { priority: 7, subject: "AWS Invoice — $2,847.32", from: "billing@aws.amazon.com", tag: "Finance" },
                  { priority: 3, subject: "Weekly Newsletter #142", from: "updates@techcrunch.com", tag: "Low" },
                ].map((email, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    style={{ animation: `fade-in 0.4s ease-out ${i * 150 + 1000}ms both` }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        email.priority >= 8
                          ? "bg-rose-500/15 text-rose-400"
                          : email.priority >= 5
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {email.priority}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-300 truncate">{email.subject}</p>
                      <p className="text-[10px] text-slate-600 truncate">{email.from}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        email.priority >= 8
                          ? "text-rose-400 bg-rose-400/10"
                          : email.priority >= 5
                          ? "text-amber-400 bg-amber-400/10"
                          : "text-emerald-400 bg-emerald-400/10"
                      }`}
                    >
                      {email.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel - AI Chat interaction */}
            <div className="w-full md:w-[280px] p-5 flex flex-col">
              {/* Chat header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-300">EmailBot</span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 space-y-3">
                {/* User message */}
                <div
                  className="bg-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-300 font-medium border border-white/[0.04] ml-auto max-w-[200px]"
                  style={{ animation: "fade-in 0.4s ease-out 1200ms both" }}
                >
                  Mark all overdue tasks as done
                </div>

                {/* Bot response */}
                <div
                  className="space-y-2"
                  style={{ animation: "fade-in 0.4s ease-out 1600ms both" }}
                >
                  <p className="text-[11px] text-slate-500 font-medium">Scanning for overdue tasks...</p>
                  <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-emerald-400 font-mono">
                      → get_page_content()
                    </p>
                  </div>
                </div>

                <div
                  className="space-y-2"
                  style={{ animation: "fade-in 0.4s ease-out 2000ms both" }}
                >
                  <p className="text-[11px] text-slate-500 font-medium">Found 4. Clicking each checkbox now...</p>
                  <div className="bg-purple-500/8 border border-purple-500/15 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-purple-400 font-mono">
                      → click(&quot;.task-checkbox&quot;, &#123;index: 4&#125;)
                    </p>
                  </div>
                </div>

                <div
                  className="bg-white/[0.06] rounded-lg px-3 py-2 text-xs text-slate-300 font-medium border border-white/[0.04]"
                  style={{ animation: "fade-in 0.4s ease-out 2400ms both" }}
                >
                  Good. Now export to CSV
                </div>
              </div>

              {/* Input */}
              <div
                className="mt-4 bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5 flex items-center gap-2"
                style={{ animation: "fade-in 0.4s ease-out 2600ms both" }}
              >
                <span className="text-xs text-slate-600">Ask me anything...</span>
                <div className="ml-auto w-1 h-4 bg-indigo-500/60 rounded-full animate-typewriter-cursor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
