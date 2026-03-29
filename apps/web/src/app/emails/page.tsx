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
    if (!score) return { text: "N/A", color: "text-white/40", bg: "bg-white/[0.02] border-white/5" };
    if (score >= 8) return { text: "High", color: "text-white font-bold", bg: "bg-white/[0.08] border-white/20" };
    if (score >= 5) return { text: "Medium", color: "text-white/80", bg: "bg-white/[0.05] border-white/10" };
    return { text: "Low", color: "text-white/60", bg: "bg-white/[0.03] border-white/5" };
  };

  return (
    <div className="p-8 md:p-12 xl:p-16 w-full ml-auto mr-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-14">
        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">Processed Emails</h1>
        <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-lg">
          Browse and search all emails analyzed by the AI engine.
        </p>
      </div>


      {/* Search & Filter Bar */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-6 mb-10">
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
              className="w-full bg-white/[0.03] border border-white/5 rounded-md pl-11 pr-4 py-2.5 text-[14px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/20 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            {["all", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all
                  ${filterPriority === p
                    ? "bg-white text-black"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total", value: emails.length, color: "text-white" },
          { label: "High", value: emails.filter(e => (e.priorityScore ?? 0) >= 8).length, color: "text-white" },
          { label: "Notified", value: emails.filter(e => e.notified).length, color: "text-white/80" },
          { label: "In Digest", value: emails.filter(e => e.digestIncluded).length, color: "text-white/60" },
        ].map((s, i) => (
          <div key={i} className="bg-[#0f0f0f] border border-white/5 rounded-lg p-5 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Email List */}
      <div className="bg-[#0f0f0f] border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 text-[13px] font-medium">Loading emails...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5">
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-500 text-[14px] font-medium">
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
                    className="w-full flex items-center gap-5 p-5 hover:bg-white/[0.02] transition-colors text-left group"
                  >
                    {/* Priority Badge */}
                    <div className={`w-9 h-9 rounded-md ${priority.bg} border flex items-center justify-center shrink-0 transition-all`}>
                      <span className={`text-[12px] font-black ${priority.color}`}>
                        {email.priorityScore ?? "—"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                        {email.subject || "No Subject"}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">
                        <span className="text-slate-500 font-medium">{email.sender || "Unknown"}</span>
                        {" "}•{" "}
                        <span className="uppercase text-[9px] font-bold tracking-widest">{email.emailAccount.provider}</span>
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      {email.notified && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                          Notified
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0 w-24">
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                        {new Date(email.processedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Expand Icon */}
                    <svg
                      className={`w-3.5 h-3.5 text-slate-700 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Summary */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <div className="ml-14 p-5 rounded-md bg-white/[0.02] border border-white/5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                          AI Analysis
                        </h4>
                        <p className="text-[14px] text-slate-400 leading-relaxed font-medium">
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
