"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import { fetchStats, fetchFilters, fetchEmails, fetchAccounts, Stats, FilterRule, ProcessedEmail, EmailAccount } from "@/lib/api";
import {
  Mail, SlidersHorizontal, Zap, Bell,
  ArrowRight, CheckCircle2, Activity, Server, Database, Cpu
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
} as const;


function getPriorityStyle(score: number | null) {
  if (!score) return { textClass: "text-zinc-500", bgClass: "bg-zinc-500/5 border-zinc-500/10", label: "—" };
  if (score >= 8) return { textClass: "text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]", label: `${score}` };
  if (score >= 5) return { textClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20", label: `${score}` };
  return { textClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20", label: `${score}` };
}

function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Custom elegant easeOutExpo
        onUpdate(v) {
          node.textContent = Math.round(v).toLocaleString();
        },
      });
      return () => controls.stop();
    }
  }, [value]);

  return <span ref={nodeRef} className="font-semibold tracking-tight tabular-nums text-white">{value}</span>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [health, setHealth] = useState<{ status: string; services: { database: string; redis: string } } | null>(null);
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
    
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth(data);
    } catch { /* Offline recovery fallback */ }
    
    setLoading(false);
  };

  const recentEmails = emails.slice(0, 5);
  const priorityEmails = emails.filter(e => (e.priorityScore ?? 0) >= 8).length;
  const alertsSent = emails.filter(e => e.notified).length;

  const statCards = [
    { label: "Total Processed", value: stats?.totalProcessed ?? 0, icon: Mail, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
    { label: "Active Rules", value: filters.length, icon: SlidersHorizontal, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
    { label: "Alerts Dispatched", value: alertsSent, icon: Bell, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10", tag: "Live" },
    { label: "Critical Actions", value: priorityEmails, icon: Zap, color: "text-rose-400 bg-rose-500/5 border-rose-500/10", tag: priorityEmails > 0 ? "Urgent" : null },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-white/20 selection:text-white">
      {/* Dynamic Background Atmosphere Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] right-[-10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 flex flex-col gap-8 relative z-10">
        
        {/* Header Block */}
        <PageHeader 
          title="Dashboard"
          description={`AI agent actively monitoring ${accounts.length} connected channel${accounts.length !== 1 ? 's' : ''}.`}
          actions={
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/40 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              </span>
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                System Operational
              </span>
            </div>
          }
        />

        {/* ── Key Metrics Grid ── */}
        <motion.div
          initial="hidden" animate="show" variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {statCards.map((card, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="relative overflow-hidden group p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md hover:border-neutral-700/60 hover:bg-neutral-900/50 transition-all duration-300 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                {/* Micro-hover glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.color}`}>
                    <card.icon size={18} strokeWidth={2} />
                  </div>
                  {card.tag && (
                    <Badge variant={card.tag === "Urgent" ? "danger" : "default"} className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${card.tag === "Urgent" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-neutral-800 text-neutral-400 border border-neutral-700"}`}>
                      {card.tag}
                    </Badge>
                  )}
                </div>

                <div>
                  <div className="text-3xl font-semibold tracking-tight text-white mb-1.5">
                    {loading ? (
                      <span className="inline-block w-16 h-8 bg-neutral-800 rounded-md animate-pulse" />
                    ) : (
                      <AnimatedCounter value={card.value} />
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{card.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main content structural division ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Core Analytics Feed (Left Column Area) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md flex flex-col overflow-hidden shadow-sm">
              <CardHeader className="flex items-center justify-between border-b border-neutral-800/60 px-6 py-5">
                <div className="flex items-center gap-2.5">
                  <Activity size={16} className="text-neutral-500" />
                  <h2 className="text-[15px] font-semibold text-neutral-200">Recent Intelligence</h2>
                </div>
                <Link
                  href="/emails"
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors group no-underline"
                >
                  View Feed <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </CardHeader>

              <div className="divide-y divide-neutral-900">
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-neutral-800 rounded w-1/3" />
                      <div className="h-2.5 bg-neutral-800 rounded w-1/4 opacity-60" />
                    </div>
                  </div>
                ))}

                {!loading && recentEmails.length === 0 && (
                  <div className="py-24 text-center">
                    <Mail size={32} className="text-neutral-700 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-[14px] text-neutral-400 font-medium">Data engine idling.</p>
                    <p className="text-[12px] text-neutral-500 mt-1">Connect an inbox to stream active pipelines.</p>
                  </div>
                )}

                {!loading && recentEmails.map((email) => {
                  const style = getPriorityStyle(email.priorityScore);
                  return (
                    <div
                      key={email.id}
                      className="group flex items-center gap-4 px-6 py-4 hover:bg-neutral-900/40 transition-all duration-200 cursor-pointer"
                    >
                      {/* Priority Score Shield */}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[12px] font-bold shrink-0 transition-all ${style.bgClass} ${style.textClass}`}>
                        {style.label}
                      </div>

                      {/* Content Fragment */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-medium text-neutral-200 truncate group-hover:text-white transition-colors mb-0.5">
                          {email.subject || "No Title Provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11.5px] text-neutral-500 truncate font-normal">{email.sender || "System Origin"}</span>
                          <span className="text-neutral-800 text-[10px]">•</span>
                          <Badge className="bg-neutral-950 px-2 py-0 border border-neutral-800 text-neutral-400 text-[9px] font-medium uppercase tracking-wider rounded">
                            {email.emailAccount.provider}
                          </Badge>
                        </div>
                      </div>

                      {/* Metadata Timestamp */}
                      <span className="text-[11px] font-medium text-neutral-500 whitespace-nowrap">
                        {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Right Action Sidecar Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* System Routing Controls */}
            <Card className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Operations Center</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/rules", label: "Automation Engines", icon: SlidersHorizontal, desc: `${filters.length} active pipelines` },
                  { href: "/settings", label: "System Preferences", icon: CheckCircle2, desc: "Global core configuration" },
                ].map(({ href, label, icon: Icon, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/20 border border-neutral-800/40 hover:border-neutral-700/60 hover:bg-neutral-900/60 transition-all duration-200 no-underline group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center group-hover:border-neutral-700 transition-colors">
                        <Icon size={15} className="text-neutral-400 group-hover:text-neutral-200 transition-colors" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-neutral-300 group-hover:text-white transition-colors mb-0.5">{label}</p>
                        <p className="text-[11px] text-neutral-500 font-normal">{loading ? "Synchronizing..." : desc}</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Network Node Infrastructure Status */}
            <Card className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Infrastructure Matrix</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: "Global REST API", icon: Server, connected: !!health },
                  { name: "Relational Database", icon: Database, connected: health?.services?.database === 'connected' },
                  { name: "In-Memory Broker (Redis)", icon: Cpu, connected: health?.services?.redis === 'connected' },
                ].map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full relative ${
                        loading 
                          ? 'bg-neutral-700 animate-pulse' 
                          : svc.connected 
                            ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]' 
                            : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                      }`} />
                      <div>
                        <p className="text-[13px] font-medium text-neutral-300 leading-tight mb-0.5">{svc.name}</p>
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                          {loading ? 'Handshaking...' : svc.connected ? 'Online' : 'Interrupted'}
                        </p>
                      </div>
                    </div>
                    <svc.icon size={15} className="text-neutral-600" strokeWidth={1.8} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Micro Session Matrix */}
            <Card className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">Pipeline Volumes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: loading ? "—" : String(stats?.totalProcessed ?? 0), label: "Routed Total" },
                  { value: loading ? "—" : String(alertsSent), label: "Dispatched" },
                ].map((metric) => (
                  <div key={metric.label} className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl px-4 py-3.5 relative overflow-hidden group">
                    <p className="text-xl font-semibold tracking-tight text-neutral-200 mb-1">{metric.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{metric.label}</p>
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