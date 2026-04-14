"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchStats, fetchFilters, fetchEmails, fetchAccounts, Stats, FilterRule, ProcessedEmail, EmailAccount } from "@/lib/api";
import {
  Mail, SlidersHorizontal, Zap, Bell,
  ArrowRight, CheckCircle2, Activity, Server, Database, Cpu, Wifi,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/* ── Animations ──────────────────────────────────────────── */
const up      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ── Priority helpers ────────────────────────────────────── */
function getPriorityStyle(score: number | null) {
  if (!score) return { variant: "default" as const, label: "—" };
  if (score >= 8) return { variant: "danger" as const, label: `${score}` };
  if (score >= 5) return { variant: "warning" as const, label: `${score}` };
  return { variant: "default" as const, label: `${score}` };
}

export default function DashboardPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [emails, setEmails]   = useState<ProcessedEmail[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [health, setHealth]   = useState<{ status: string; services: { database: string; redis: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, f, e, acc] = await Promise.all([fetchStats(), fetchFilters(), fetchEmails(), fetchAccounts()]);
      setStats(s);
      setFilters(f);
      setEmails(e);
      setAccounts(acc);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
    
    // Health check in parallel (non-blocking)
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch { /* API might be down */ }
    
    setLoading(false);
  };

  const recentEmails   = emails.slice(0, 5);
  const priorityEmails = emails.filter(e => (e.priorityScore ?? 0) >= 8).length;
  const alertsSent     = emails.filter(e => e.notified).length;

  const statCards = [
    { label: "Processed",        value: stats?.totalProcessed ?? 0, icon: Mail,             trend: null   },
    { label: "Active Rules",      value: filters.length,             icon: SlidersHorizontal,trend: null   },
    { label: "Alerts Sent",       value: alertsSent,                 icon: Bell,             trend: "live" },
    { label: "Priority Actions",  value: priorityEmails,             icon: Zap,              trend: priorityEmails > 0 ? "urgent" : null },
  ];

  return (
    <div className="min-h-screen text-white relative z-10">
      <div className="max-w-[1400px] mx-auto px-8 py-10 flex flex-col gap-10">

        <PageHeader 
          title="Dashboard"
          description={`Your AI agent is monitoring ${accounts.length} connected account${accounts.length !== 1 ? 's' : ''} and prioritizing your communications.`}
          actions={
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest whitespace-nowrap">
                System Live
              </span>
            </div>
          }
        />

        {/*  Stats */}
        <motion.div
          initial="hidden" animate="show" variants={cascade}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((s, i) => (
            <motion.div key={i} variants={up}>
              <Card hoverable className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.03)]">
                    <s.icon size={16} className="text-white/60" strokeWidth={1.8} />
                  </div>
                  {s.trend && (
                    <Badge variant={s.trend === "urgent" ? "danger" : "success"} dot>
                      {s.trend}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tight text-white mb-1 drop-shadow-sm">
                    {loading
                      ? <span className="inline-block w-12 h-8 bg-white/5 rounded-lg animate-pulse" />
                      : s.value
                    }
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888]">{s.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Intelligence — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="lg:col-span-2"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[#888]" strokeWidth={2} />
                  <h2 className="text-[14px] font-bold text-[#e8e8e8] tracking-tight">Recent Intelligence</h2>
                </div>
                <Link
                  href="/emails"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#888] hover:text-white transition-colors no-underline group"
                >
                  View all <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </CardHeader>

              <div className="flex-1">
                {loading && [1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-8 px-10 py-8 border-b border-[#1c1c1c] last:border-0 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded-full w-3/4" />
                      <div className="h-2.5 bg-white/5 rounded-full w-1/2 opacity-50" />
                    </div>
                  </div>
                ))}

                {!loading && recentEmails.length === 0 && (
                  <div className="py-20 text-center">
                    <Mail size={28} className="text-[#444] mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-[14px] text-white/50 font-medium">No activity detected yet.</p>
                    <p className="text-[12px] text-white/30 mt-1">Connect an account to begin processing.</p>
                  </div>
                )}

                {!loading && recentEmails.map((email) => {
                  const p = getPriorityStyle(email.priorityScore);
                  return (
                    <div
                      key={email.id}
                      className="group flex items-center gap-8 px-10 py-8 border-b border-[#1c1c1c] last:border-0 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.01)] transition-all cursor-pointer relative"
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[13px] font-bold shrink-0 transition-all ${p.variant === 'danger' ? 'text-red-400 bg-red-400/5 border-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.15)]' : p.variant === 'warning' ? 'text-amber-400 bg-amber-400/5 border-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'text-white/40 bg-white/[0.02] border-[#2a2a2a]'}`}>
                        {p.label}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white/80 truncate group-hover:text-white transition-colors mb-1 shadow-sm">
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#888] truncate font-medium">{email.sender || "Unknown"}</span>
                          <span className="text-white/10 text-[10px]">·</span>
                          <Badge variant="default" className="bg-[#171717] py-0 px-1.5 border-[#2a2a2a] text-[8px] font-medium tracking-wider">
                            {email.emailAccount.provider}
                          </Badge>
                        </div>
                      </div>

                      <span className="text-[11px] text-[#888] font-bold uppercase tracking-tighter shrink-0">
                        {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
            className="flex flex-col gap-6"
          >
            {/* Management Controls */}
            <Card hoverable className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] mb-6">Management</p>
              <div className="flex flex-col gap-3">
                {[
                  { href: "/rules",    label: "Automation Rules", icon: SlidersHorizontal, desc: `${filters.length} active` },
                  { href: "/settings", label: "System Settings",  icon: CheckCircle2,       desc: "Configure" },
                ].map(({ href, label, icon: Icon, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-[#2a2a2a] hover:border-[#444] hover:bg-white/[0.04] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all no-underline group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center">
                        <Icon size={14} className="text-[#888] group-hover:text-[#e8e8e8] transition-colors" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-white/70 group-hover:text-white transition-colors leading-none mb-1">{label}</p>
                        <p className="text-[11px] text-[#888] font-medium">{loading ? "..." : desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Node Infrastructure */}
            <Card className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] mb-4">Core Infrastructure</p>
              <div className="flex flex-col gap-5">
                {[
                  { name: "API Server", icon: Server, connected: !!health },
                  { name: "Database", icon: Database, connected: health?.services?.database === 'connected' },
                  { name: "Redis Queue", icon: Cpu, connected: health?.services?.redis === 'connected' },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        loading ? 'bg-white/20 animate-pulse' : svc.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
                      }`} />
                      <div>
                        <p className="text-[13px] font-bold text-white/70">{svc.name}</p>
                        <p className="text-[10px] text-[#888] uppercase tracking-[0.1em] font-medium">
                          {loading ? 'Checking...' : svc.connected ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <svc.icon size={14} className="text-white/20" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Session Stats */}
            <Card className="p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] mb-4">Session Intelligence</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: loading ? "—" : String(stats?.totalProcessed ?? 0), l: "Processed" },
                  { v: loading ? "—" : String(alertsSent),                  l: "Alerts"    },
                ].map(s => (
                  <div key={s.l} className="bg-white/[0.02] border border-[#2a2a2a] rounded-xl px-4 py-3.5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                    <p className="text-2xl font-semibold tracking-tight text-[#e8e8e8] mb-1 relative z-10">{s.v}</p>
                    <p className="text-[9.5px] font-black uppercase tracking-[0.15em] text-[#888] relative z-10">{s.l}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
