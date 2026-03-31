"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchStats, fetchFilters, fetchEmails, Stats, FilterRule, ProcessedEmail } from "@/lib/api";
import {
  Mail, SlidersHorizontal, Zap, Bell,
  ArrowRight, CheckCircle2, Activity,
} from "lucide-react";

/* ── Animations ──────────────────────────────────────────── */
const up      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ── Card wrapper ────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] ${className}`}>
      {children}
    </div>
  );
}

/* ── Priority helpers ────────────────────────────────────── */
function getPriorityStyle(score: number | null) {
  if (!score) return { text: "text-white/20", bg: "bg-white/[0.03]", border: "border-[#1a1a1a]", label: "—" };
  if (score >= 8) return { text: "text-red-400",   bg: "bg-red-500/10",   border: "border-red-500/20",   label: `${score}` };
  if (score >= 5) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: `${score}` };
  return              { text: "text-white/30",  bg: "bg-white/[0.03]", border: "border-[#1a1a1a]",    label: `${score}` };
}

/* ── Component ───────────────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [emails, setEmails]   = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

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

  const recentEmails   = emails.slice(0, 5);
  const priorityEmails = emails.filter(e => (e.priorityScore ?? 0) >= 8).length;
  const alertsSent     = emails.filter(e => e.notified).length;

  const statCards = [
    { label: "Processed",        value: stats?.totalProcessed ?? 0, icon: Mail,             trend: null   },
    { label: "Active Rules",      value: filters.length,             icon: SlidersHorizontal,trend: null   },
    { label: "Alerts Sent",       value: alertsSent,                 icon: Bell,             trend: true   },
    { label: "Priority Actions",  value: priorityEmails,             icon: Zap,              trend: priorityEmails > 0 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1160px] mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── Page header ──────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={cascade}>
          <motion.div variants={up} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-white/15 border border-[#1c1c1c] px-2.5 py-1 rounded-md">
                  Agent v4.0.2
                </span>
                <span className="text-white/10">·</span>
                <span className="text-[9.5px] font-medium uppercase tracking-[0.15em] text-white/10">
                  Intelligence Suite
                </span>
              </div>
              <h1
                className="text-[48px] font-normal leading-tight mb-2"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}
              >
                Dashboard
              </h1>
              <p className="text-[14px] text-white/25 leading-relaxed max-w-md">
                Your AI agent is monitoring{" "}
                <span className="text-white/55 font-medium">2 connected accounts</span>{" "}
                and prioritizing your communications.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
              <span className="text-[10px] font-medium text-white/25 uppercase tracking-widest whitespace-nowrap">
                System Live
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Stats ────────────────────────────────────── */}
        <motion.div
          initial="hidden" animate="show" variants={cascade}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {statCards.map((s, i) => (
            <motion.div key={i} variants={up}>
              <Card className="p-5 hover:border-[#242424] transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#1c1c1c] flex items-center justify-center">
                    <s.icon size={14} className="text-white/28" strokeWidth={1.8} />
                  </div>
                  {s.trend && (
                    <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">
                      live
                    </span>
                  )}
                </div>
                <div className="text-[28px] font-bold tracking-tight text-white leading-none mb-1.5">
                  {loading
                    ? <span className="inline-block w-12 h-7 bg-[#111] rounded-lg animate-pulse" />
                    : s.value
                  }
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/20">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Intelligence — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#111]">
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-white/20" strokeWidth={2} />
                  <h2 className="text-[13px] font-semibold text-white/55">Recent Intelligence</h2>
                </div>
                <Link
                  href="/emails"
                  className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.15em] text-white/18 hover:text-white/50 transition-colors no-underline"
                >
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              {/* Email rows */}
              <div>
                {loading && [1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#0d0d0d] last:border-0 animate-pulse">
                    <div className="w-9 h-9 rounded-lg bg-[#111]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-[#111] rounded-full w-3/4" />
                      <div className="h-2.5 bg-[#0d0d0d] rounded-full w-1/2" />
                    </div>
                    <div className="w-14 h-2.5 bg-[#0d0d0d] rounded-full" />
                  </div>
                ))}

                {!loading && recentEmails.length === 0 && (
                  <div className="py-16 text-center">
                    <Mail size={24} className="text-white/10 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[13px] text-white/20 font-medium">No activity yet.</p>
                    <p className="text-[12px] text-white/12 mt-1">Connect an account to begin.</p>
                  </div>
                )}

                {!loading && recentEmails.map((email) => {
                  const p = getPriorityStyle(email.priorityScore);
                  return (
                    <div
                      key={email.id}
                      className="group flex items-center gap-4 px-6 py-4 border-b border-[#0d0d0d] last:border-0 hover:bg-[#0d0d0d] transition-colors cursor-pointer"
                    >
                      {/* Priority score badge */}
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-[12px] font-bold shrink-0 ${p.text} ${p.bg} ${p.border}`}>
                        {p.label}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/70 truncate group-hover:text-white/90 transition-colors mb-0.5">
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/22 truncate">{email.sender || "Unknown"}</span>
                          <span className="text-white/10 text-[10px]">·</span>
                          <span className="text-[9.5px] font-semibold uppercase tracking-wider text-white/15 shrink-0">
                            {email.emailAccount.provider}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <span className="text-[10.5px] text-white/18 font-medium shrink-0">
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
            className="flex flex-col gap-4"
          >
            {/* Management Controls */}
            <Card className="p-5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/18 mb-4">Controls</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/rules",    label: "Automation Rules", icon: SlidersHorizontal, desc: `${filters.length} active` },
                  { href: "/settings", label: "System Settings",  icon: CheckCircle2,       desc: "Configure" },
                ].map(({ href, label, icon: Icon, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f0f0f] border border-[#161616] hover:border-[#222] hover:bg-[#111] transition-all no-underline group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-[#161616] border border-[#1c1c1c] flex items-center justify-center">
                        <Icon size={13} className="text-white/25" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-semibold text-white/50 group-hover:text-white/80 transition-colors">{label}</p>
                        <p className="text-[10px] text-white/18">{loading ? "..." : desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-white/15 group-hover:text-white/40 transition-colors" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Node Infrastructure */}
            <Card className="p-5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/18 mb-4">Node Infrastructure</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Email Parser", status: "Online",  load: "2%"    },
                  { name: "LLM Worker",   status: "Active",  load: "14%"   },
                  { name: "Push Gateway", status: "Synced",  load: "Active"},
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse shrink-0" />
                      <div>
                        <p className="text-[12px] font-semibold text-white/40">{svc.name}</p>
                        <p className="text-[9.5px] text-white/18 uppercase tracking-wider">{svc.status}</p>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-semibold text-white/20">{svc.load}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick stats */}
            <Card className="p-5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/18 mb-4">This Session</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: loading ? "—" : String(stats?.totalProcessed ?? 0), l: "Processed" },
                  { v: loading ? "—" : String(alertsSent),                  l: "Alerts"    },
                  { v: loading ? "—" : String(filters.length),              l: "Rules"     },
                  { v: loading ? "—" : String(priorityEmails),              l: "Priority"  },
                ].map(s => (
                  <div key={s.l} className="bg-[#0f0f0f] border border-[#161616] rounded-lg px-3 py-2.5">
                    <p className="text-[18px] font-bold tracking-tight text-white/50 leading-none mb-1">{s.v}</p>
                    <p className="text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/18">{s.l}</p>
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