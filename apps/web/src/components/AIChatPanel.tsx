"use client";

import React, { useState } from "react";

const recentTasks = [
  { text: "Summarize inbox", time: "Just now" },
  { text: "Create priority filter", time: "5m ago" },
  { text: "Check unread alerts", time: "8m ago" },
];

const quickActions = [
  "Summarize this page",
  "Help me write",
  "Find info",
];

const secondaryActions = ["Fill a form"];

export default function AIChatPanel() {
  const [query, setQuery] = useState("");

  return (
    <div
      className="hidden xl:flex fixed right-6 top-20 bottom-6 w-[320px] z-40 flex-col glass-chat rounded-2xl overflow-hidden animate-slide-in-right"
      id="ai-chat-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">EmailBot</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors" aria-label="New chat">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors" aria-label="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors" aria-label="Settings">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto">
        {/* Greeting */}
        <h2 className="text-xl font-black text-white mb-8">
          What can I help with?
        </h2>

        {/* Recent */}
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
            Recent
          </p>
          <div className="space-y-1">
            {recentTasks.map((task, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.03] transition-colors group"
              >
                <div className="w-4 h-4 rounded border border-slate-700 group-hover:border-slate-500 flex items-center justify-center shrink-0 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-sm bg-transparent group-hover:bg-slate-600 transition-colors" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-200 flex-1 truncate transition-colors">
                  {task.text}
                </span>
                <span className="text-[10px] text-slate-700 shrink-0 font-medium">
                  {task.time}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick Actions */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-end">
            {quickActions.map((action) => (
              <button key={action} className="chat-chip">
                {action}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-end mt-2">
            {secondaryActions.map((action) => (
              <button key={action} className="chat-chip">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="chat-input pr-20"
            id="ai-chat-input"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <button className="p-1.5 rounded-md hover:bg-white/[0.05] text-slate-600 hover:text-slate-400 transition-colors" aria-label="Attach file">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              className="p-1.5 rounded-md bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Model Badge */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          <span className="text-[10px] text-slate-700 font-medium">→</span>
          <span className="text-[11px] text-slate-600 font-medium">
            EmailBot AI Engine v2.0
          </span>
        </div>
      </div>
    </div>
  );
}
