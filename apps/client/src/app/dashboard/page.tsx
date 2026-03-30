"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Zap, ShieldCheck, MessageSquare,
  ArrowUpRight, Search, Bell, CheckCircle2,
  MoreHorizontal, TrendingUp, Activity,
} from "lucide-react";

/* ── Data ────────────────────────────────────────────────── */

const stats = [
  { label: "Emails Processed", value: "2,841", change: "+12%",    icon: Mail,           trend: true  },
  { label: "High Priority",     value: "47",    change: "+3 today",icon: Zap,            trend: true  },
  { label: "Rules Active",      value: "12",    change: "online",  icon: ShieldCheck,    trend: false },
  { label: "WhatsApp Alerts",   value: "189",   change: "sent",    icon: MessageSquare,  trend: false },
];

const emails = [
  { from: "Sarah Chen", ini: "SC", subject: "Q4 Board Meeting — Agenda Finalized",     time: "2m ago",    priority: "high",   read: false, hex: "#a78bfa" },
  { from: "GitHub",     ini: "GH", subject: "New security alert for your repository",   time: "18m ago",   priority: "high",   read: false, hex: "#f87171" },
  { from: "Stripe",     ini: "ST", subject: "Your payout of $3,240 is on its way",      time: "1h ago",    priority: "medium", read: false, hex: "#34d399" },
  { from: "Linear",     ini: "LN", subject: "6 issues assigned to you this week",       time: "3h ago",    priority: "low",    read: true,  hex: "#818cf8" },
  { from: "Notion",     ini: "NO", subject: "Weekly digest: 14 pages updated",          time: "5h ago",    priority: "low",    read: true,  hex: "#94a3b8" },
  { from: "David Park", ini: "DP", subject: "Re: Partnership proposal — let's connect", time: "Yesterday", priority: "medium", read: true,  hex: "#fbbf24" },
];

const activity = [
  { action: "Forwarded",      detail: "Board meeting invite",   time: "2m ago",  done: true  },
  { action: "WhatsApp Alert", detail: "Sent priority summary",  time: "18m ago", done: true  },
  { action: "Auto-archived",  detail: "47 newsletter items",    time: "1h ago",  done: false },
  { action: "Rule Trigger",   detail: "Stripe event processed", time: "1h ago",  done: true  },
];

const P = {
  high:   { label: "HIGH", textCls: "text-red-400",   bgCls: "bg-red-500/10",   ringCls: "ring-red-400/30",   dot: "bg-red-400"   },
  medium: { label: "MED",  textCls: "text-amber-400", bgCls: "bg-amber-500/10", ringCls: "ring-amber-400/30", dot: "bg-amber-400" },
  low:    { label: "LOW",  textCls: "text-white/20",  bgCls: "bg-white/[0.03]", ringCls: "ring-white/10",     dot: "bg-white/20"  },
};

/* ── Animations ──────────────────────────────────────────── */
const up      = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const cascade = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ── Card wrapper ────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1c1c1c] bg-[#0a0a0a] ${className}`}>
      {children}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────── */
export default function DashboardPage() {
  const [tab, setTab] = useState<"all" | "high" | "unread">("all");
  const [focused, setFocused] = useState(false);

  const visible = emails.filter(e =>
    tab === "high" ? e.priority === "high" :
    tab === "unread" ? !e.read : true
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-7 flex flex-col gap-7">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all ${focused ? "border-[#2a2a2a] bg-[#0f0f0f] w-64" : "border-[#1a1a1a] bg-[#0a0a0a] w-48"}`}>
            <Search size={13} className="text-white/20 shrink-0" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent outline-none text-[12px] placeholder:text-white/15 text-white/60 w-full"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <span className="text-[10px] text-white/10 font-medium shrink-0">⌘K</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-[11px] text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse" />
              Active · 4 nodes
            </div>
            <button className="relative p-2 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] hover:bg-[#111] transition-colors">
              <Bell size={14} className="text-white/35" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white/50 ring-[1.5px] ring-[#050505]" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-[#0f0f0f] border border-[#1c1c1c] flex items-center justify-center text-[11px] font-semibold text-white/30">U</div>
          </div>
        </div>

        {/* ── Greeting ─────────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={cascade}>
          <motion.div variants={up} className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/15 border border-[#1c1c1c] px-2.5 py-1 rounded-md">Agent v4.0.2</span>
            <span className="text-white/10 text-sm">·</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/10">Intelligence Suite</span>
          </motion.div>
          <motion.h1
            variants={up}
            className="text-[52px] font-normal leading-tight mb-2"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}
          >
            Good morning.
          </motion.h1>
          <motion.p variants={up} className="text-[14px] text-white/25 leading-relaxed max-w-md">
            Your agent has prioritized{" "}
            <span className="text-white/55 font-medium">47 messages</span>{" "}
            requiring immediate attention. Syncing with 4 external nodes.
          </motion.p>
        </motion.div>

        {/* ── Stats grid ───────────────────────────────── */}
        <motion.div
          initial="hidden" animate="show" variants={cascade}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map(s => (
            <motion.div key={s.label} variants={up}>
              <Card className="p-5 hover:border-[#252525] transition-colors">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#1c1c1c] flex items-center justify-center">
                    <s.icon size={14} className="text-white/30" strokeWidth={1.8} />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.trend ? "text-emerald-400 bg-emerald-500/10" : "text-white/20 bg-white/[0.04]"}`}>
                    {s.change}
                  </span>
                </div>
                <p className="text-[28px] font-bold tracking-tight text-white leading-none mb-1.5">{s.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/20">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main content ─────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

          {/* Email feed */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#141414]">
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-white/20" strokeWidth={2} />
                  <span className="text-[12.5px] font-semibold text-white/50">Intelligence Stream</span>
                  <span className="w-5 h-5 rounded-full bg-[#111] border border-[#1c1c1c] flex items-center justify-center text-[9px] font-bold text-white/20 ml-0.5">
                    {visible.length}
                  </span>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-0.5 bg-[#0f0f0f] border border-[#1c1c1c] rounded-lg p-0.5">
                  {(["all", "high", "unread"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        tab === t ? "bg-white text-black" : "text-white/25 hover:text-white/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div>
                <AnimatePresence mode="popLayout">
                  {visible.map((e, i) => {
                    const p = P[e.priority as keyof typeof P];
                    return (
                      <motion.div
                        key={e.from + i}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: e.read ? 0.35 : 1 }}
                        exit={{ opacity: 0 }}
                        className="group flex items-center gap-4 px-5 py-4 border-b border-[#0f0f0f] last:border-0 hover:bg-[#0d0d0d] transition-colors cursor-pointer"
                      >
                        {/* dot */}
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />

                        {/* avatar */}
                        <div
                          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold border"
                          style={{ backgroundColor: e.hex + "20", borderColor: e.hex + "35", color: e.hex }}
                        >
                          {e.ini}
                        </div>

                        {/* content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[13px] font-semibold text-white/75 truncate">{e.from}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded ring-1 shrink-0 ${p.textCls} ${p.bgCls} ${p.ringCls}`}>
                              {p.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/22 truncate group-hover:text-white/40 transition-colors">{e.subject}</p>
                        </div>

                        {/* time + action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-white/18">{e.time}</span>
                          <button className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white hover:text-black">
                            <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="px-5 py-3.5 border-t border-[#0f0f0f] text-center">
                <button className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/15 hover:text-white/35 transition-colors">
                  Load older communications
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="flex flex-col gap-4"
          >

            {/* Neural Activity */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/25 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">Neural Activity</span>
                </div>
                <button className="p-1 rounded-md hover:bg-white/5 transition-colors">
                  <MoreHorizontal size={13} className="text-white/15" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {activity.map((a, i) => (
                  <div key={i} className="flex gap-3 group">
                    {/* timeline */}
                    <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                      <div className={`w-1.5 h-1.5 rounded-full ${a.done ? "bg-white/30" : "bg-[#222]"}`} />
                      {i < activity.length - 1 && <div className="w-px flex-1 bg-[#161616] min-h-[16px]" />}
                    </div>
                    {/* text */}
                    <div className="flex-1 pb-0.5">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/18">{a.action}</span>
                        <span className="text-[10px] text-white/12">{a.time}</span>
                      </div>
                      <p className="text-[12.5px] text-white/35 group-hover:text-white/55 transition-colors leading-snug">{a.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-white/20" strokeWidth={2} />
                  <span className="text-[12px] font-semibold text-white/45">System Health</span>
                </div>
                <span className="text-[12px] font-semibold text-white/40">94%</span>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Core Load",    pct: 94,  bar: "bg-white/60",        glow: true  },
                  { label: "Queue",        pct: 68,  bar: "bg-white/25",        glow: false },
                  { label: "Rules Engine", pct: 100, bar: "bg-emerald-500/55",  glow: false },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[9.5px] font-medium uppercase tracking-[0.12em] text-white/18">{b.label}</span>
                      <span className="text-[9.5px] text-white/20">{b.pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#111] rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${b.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${b.pct}%` }}
                        transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 }}
                        style={b.glow ? { boxShadow: "0 0 8px rgba(255,255,255,0.25)" } : {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* This Week */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={13} className="text-white/20" strokeWidth={2} />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/25">This Week</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: "312",  l: "Emails sorted" },
                  { v: "8",    l: "Rules fired"   },
                  { v: "94%",  l: "Accuracy"      },
                  { v: "2.1s", l: "Avg response"  },
                ].map(s => (
                  <div key={s.l} className="bg-[#0f0f0f] border border-[#161616] rounded-lg px-3 py-2.5">
                    <p className="text-[18px] font-bold tracking-tight text-white/55 leading-none mb-1">{s.v}</p>
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