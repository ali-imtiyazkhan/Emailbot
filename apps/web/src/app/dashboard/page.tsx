"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchStats, fetchFilters, fetchEmails, Stats, FilterRule, ProcessedEmail } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, f, e] = await Promise.all([fetchStats(), fetchFilters(), fetchEmails()]);
      setStats(s);
      setFilters(f);
      setEmails(e);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const recentEmails = emails.slice(0, 5);

  const getPriorityColor = (score: number | null) => {
    if (!score) return "text-white/40";
    if (score >= 8) return "text-white";
    if (score >= 5) return "text-white/80";
    return "text-white/60";
  };

  const getPriorityBg = (score: number | null) => {
    if (!score) return "bg-white/[0.02] border-white/5";
    if (score >= 8) return "bg-white/[0.08] border-white/20";
    if (score >= 5) return "bg-white/[0.05] border-white/10";
    return "bg-white/[0.03] border-white/5";
  };

  return (
    <div className="p-8 md:p-12 xl:p-16 w-full ml-auto mr-auto max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">Dashboard</h1>
            <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-lg">
              Welcome back. Your AI agent is monitoring <span className="text-slate-300">2 connected accounts</span> and prioritizing your incoming communications.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 w-fit">
            <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              System Live & Online
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {[
          {
            label: "Processed",
            value: stats?.totalProcessed ?? 0,
            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          },
          {
            label: "Active Rules",
            value: filters.length,
            icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
          },
          {
            label: "Alerts Sent",
            value: emails.filter(e => e.notified).length,
            icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
          },
          {
            label: "Priority Actions",
            value: emails.filter(e => (e.priorityScore ?? 0) >= 8).length,
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group bg-[#0f0f0f] border border-white/5 rounded-lg p-6 hover:border-white/10 transition-all duration-300 cursor-default"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-8 h-8 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1.5 tracking-tight">
              {loading ? <span className="animate-pulse text-white/10">—</span> : stat.value}
            </div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/5 rounded-lg p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-[19px] font-bold mb-1.5 tracking-tight">Recent Intelligence</h2>
              <p className="text-[13px] text-slate-600 font-medium">Insights generated from your latest processed emails</p>
            </div>
            <Link
              href="/emails"
              className="text-[12px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors no-underline"
            >
              View Full Feed →
            </Link>
          </div>

          <div className="space-y-1">
            {recentEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-center gap-5 px-4 py-4 rounded-md hover:bg-white/[0.02] transition-all group"
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center text-[12px] font-black ${getPriorityBg(email.priorityScore)} border transition-all`}>
                  <span className={getPriorityColor(email.priorityScore)}>
                    {email.priorityScore ?? "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                    {email.subject || "No Subject"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[11px] text-slate-600 truncate font-medium">
                      {email.sender || "Unknown"}
                    </p>
                    <span className="text-slate-800 text-[10px]">•</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                      {email.emailAccount.provider}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-700 font-black uppercase tracking-tighter">
                    {new Date(email.processedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-5 px-4 py-4">
                <div className="w-9 h-9 rounded-md bg-white/5" />
                <div className="flex-1 h-3 bg-white/5 rounded-full" />
                <div className="w-16 h-2 bg-white/5 rounded-full" />
              </div>
            ))}
            {!loading && recentEmails.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-lg">
                <p className="text-slate-600 text-[14px] font-medium">No activity to display yet. Connect an account to begin.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-8">Management Controls</h3>
            <div className="space-y-3">
              <Link href="/rules" className="flex items-center justify-between p-4 rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all no-underline group">
                 <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors border border-white/5">
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-semibold text-slate-400 group-hover:text-white transition-colors tracking-tight">Automation Rules</span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link href="/settings" className="flex items-center justify-between p-4 rounded-md bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all no-underline group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors border border-white/5">
                     <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-semibold text-slate-400 group-hover:text-white transition-colors tracking-tight">System Settings</span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-8">Node Infrastructure</h3>
            <div className="space-y-6">
              {[
                { name: "Email Parser", status: "Online", load: "2%" },
                { name: "LLM Worker", status: "Active", load: "14%" },
                { name: "Push Gateway", status: "Synced", load: "Active" },
              ].map((service) => (
                <div key={service.name} className="flex flex-col gap-1.5 ">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-slate-500 font-bold uppercase tracking-tighter">{service.name}</span>
                    <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">{service.load}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
