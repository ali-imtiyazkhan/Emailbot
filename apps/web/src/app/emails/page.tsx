"use client";

import React, { useState, useEffect } from "react";
import { fetchEmails, ProcessedEmail } from "@/lib/api";

export default function EmailsPage() {
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const data = await fetchEmails();
      setEmails(data);
    } catch (err) {
      console.error("Failed to load emails:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = emails.filter((email) => {
    const matchesSearch =
      !search ||
      email.subject?.toLowerCase().includes(search.toLowerCase()) ||
      email.sender?.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      filterPriority === "all" ||
      (filterPriority === "high" && (email.priorityScore ?? 0) >= 8) ||
      (filterPriority === "medium" && (email.priorityScore ?? 0) >= 5 && (email.priorityScore ?? 0) < 8) ||
      (filterPriority === "low" && (email.priorityScore ?? 0) < 5);

    return matchesSearch && matchesPriority;
  });

  const getPriorityLabel = (score: number | null) => {
    if (!score) return { text: "N/A", color: "text-slate-500", bg: "bg-slate-500/10 border-slate-500/20" };
    if (score >= 8) return { text: "High", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
    if (score >= 5) return { text: "Medium", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
    return { text: "Low", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-black mb-1">Processed Emails</h1>
        <p className="text-slate-500 text-sm font-medium">
          Browse and search all emails analyzed by the AI engine.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass rounded-2xl p-5 mb-8 gradient-border animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by subject or sender..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["all", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${filterPriority === p
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/[0.03]"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: emails.length, color: "text-slate-300" },
          { label: "High Priority", value: emails.filter(e => (e.priorityScore ?? 0) >= 8).length, color: "text-rose-400" },
          { label: "Notified", value: emails.filter(e => e.notified).length, color: "text-emerald-400" },
          { label: "In Digest", value: emails.filter(e => e.digestIncluded).length, color: "text-purple-400" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.value}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Email List */}
      <div className="glass rounded-2xl gradient-border overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Loading emails...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {search ? "No emails match your search" : "No processed emails yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filtered.map((email) => {
              const priority = getPriorityLabel(email.priorityScore);
              const isExpanded = expandedId === email.id;
              return (
                <div key={email.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : email.id)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    {/* Priority Badge */}
                    <div className={`w-10 h-10 rounded-xl ${priority.bg} border flex items-center justify-center shrink-0`}>
                      <span className={`text-sm font-black ${priority.color}`}>
                        {email.priorityScore ?? "—"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-200 truncate">
                        {email.subject || "No Subject"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        <span className="text-slate-400">{email.sender || "Unknown"}</span>
                        {" "}•{" "}
                        <span className="uppercase text-[10px] font-bold tracking-wider">{email.emailAccount.provider}</span>
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      {email.notified && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                          Notified
                        </span>
                      )}
                      <span className={`text-[9px] font-black uppercase tracking-widest ${priority.color} ${priority.bg} px-2 py-1 rounded-md border`}>
                        {priority.text}
                      </span>
                    </div>

                    <div className="text-right shrink-0 w-20">
                      <p className="text-[10px] text-slate-600 font-medium">
                        {new Date(email.processedAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-slate-700">
                        {new Date(email.processedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Expand Icon */}
                    <svg
                      className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Summary */}
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <div className="ml-14 p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">
                          AI Summary
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {email.summary || "No summary available for this email."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
