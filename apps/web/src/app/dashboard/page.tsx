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
    if (!score) return "text-slate-500";
    if (score >= 8) return "text-rose-400";
    if (score >= 5) return "text-amber-400";
    return "text-emerald-400";
  };

  const getPriorityBg = (score: number | null) => {
    if (!score) return "bg-slate-500/10 border-slate-500/20";
    if (score >= 8) return "bg-rose-500/10 border-rose-500/20";
    if (score >= 5) return "bg-amber-500/10 border-amber-500/20";
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-black mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">
              Welcome back. Here&apos;s your email processing overview.
            </p>
          </div>
          <span className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          {
            label: "Emails Processed",
            value: stats?.totalProcessed ?? 0,
            change: "+12%",
            color: "text-indigo-400",
            glow: "glow-indigo",
            icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          },
          {
            label: "Active Rules",
            value: filters.length,
            change: `${filters.length} active`,
            color: "text-purple-400",
            glow: "glow-purple",
            icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
          },
          {
            label: "Alerts Sent",
            value: emails.filter(e => e.notified).length,
            change: "WhatsApp",
            color: "text-pink-400",
            glow: "glow-pink",
            icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
          },
          {
            label: "Queue Ready",
            value: "Active",
            change: "Redis",
            color: "text-emerald-400",
            glow: "glow-emerald",
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`glass glass-hover rounded-2xl p-6 ${stat.glow} gradient-border`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color.replace("text-", "bg-").replace("400", "500/10")} flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={stat.icon} />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {stat.change}
              </span>
            </div>
            <div className={`text-3xl font-black tracking-tight ${stat.color} mb-1`}>
              {loading ? <span className="animate-pulse text-slate-600">—</span> : stat.value}
            </div>
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass rounded-2xl p-8 gradient-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black mb-0.5">Recent Activity</h2>
              <p className="text-xs text-slate-500 font-medium">Latest processed emails</p>
            </div>
            <Link
              href="/emails"
              className="text-indigo-400 text-xs font-bold uppercase tracking-wider hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentEmails.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">No emails processed yet</p>
              <p className="text-slate-600 text-xs mt-1">Connect your email account to start</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEmails.map((email, i) => (
                <div
                  key={email.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5"
                  style={{ animation: `fade-in 0.4s ease-out ${i * 80}ms both` }}
                >
                  <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${getPriorityBg(email.priorityScore)} border`}>
                    <span className={getPriorityColor(email.priorityScore)}>
                      {email.priorityScore ?? "—"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">
                      {email.subject || "No Subject"}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {email.sender || "Unknown"} • {email.emailAccount.provider}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-600 font-medium">
                      {new Date(email.processedAt).toLocaleDateString()}
                    </p>
                    {email.notified && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Notified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 gradient-border">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-5">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/rules" className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Add New Rule</p>
                  <p className="text-[10px] text-slate-500">Create filter or alert</p>
                </div>
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Connect Account</p>
                  <p className="text-[10px] text-slate-500">Gmail or Outlook</p>
                </div>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div className="glass rounded-2xl p-6 gradient-border">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-5">System Status</h3>
            <div className="space-y-4">
              {[
                { name: "API Server", status: "Online", color: "bg-emerald-500" },
                { name: "Redis Queue", status: "Active", color: "bg-emerald-500" },
                { name: "Email Sync", status: "Scheduled", color: "bg-amber-500" },
                { name: "WhatsApp", status: "Connected", color: "bg-emerald-500" },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 font-medium">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${service.color} animate-pulse`} />
                    <span className="text-xs font-bold text-slate-300">{service.status}</span>
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
