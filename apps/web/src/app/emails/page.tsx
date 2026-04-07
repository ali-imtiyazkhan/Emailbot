"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchEmails, ProcessedEmail } from "@/lib/api";
import { Search, Mail, Filter, ChevronDown, Bell, Zap, FileText, ArrowUpDown, Inbox, Sparkles, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

// Animations
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

type SortMode = "newest" | "oldest" | "priority";

export default function EmailsPage() {
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");

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

  const filtered = useMemo(() => {
    let result = emails.filter((email) => {
      const matchesSearch =
        !search ||
        email.subject?.toLowerCase().includes(search.toLowerCase()) ||
        email.sender?.toLowerCase().includes(search.toLowerCase()) ||
        email.summary?.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        filterPriority === "all" ||
        (filterPriority === "high" && (email.priorityScore ?? 0) >= 8) ||
        (filterPriority === "medium" && (email.priorityScore ?? 0) >= 5 && (email.priorityScore ?? 0) < 8) ||
        (filterPriority === "low" && (email.priorityScore ?? 0) < 5);

      return matchesSearch && matchesPriority;
    });

    // Sort
    result.sort((a, b) => {
      if (sortMode === "priority") return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      if (sortMode === "oldest") return new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
      return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime();
    });

    return result;
  }, [emails, search, filterPriority, sortMode]);

  const getPriorityBadge = (score: number | null) => {
    if (!score) return <Badge variant="default">N/A</Badge>;
    if (score >= 8) return <Badge variant="danger" dot>{score}</Badge>;
    if (score >= 5) return <Badge variant="warning" dot>{score}</Badge>;
    return <Badge variant="default">{score}</Badge>;
  };

  const getPriorityColor = (score: number | null) => {
    if (!score) return "bg-white/5 border-white/5";
    if (score >= 8) return "bg-red-500/5 border-red-500/10";
    if (score >= 5) return "bg-amber-500/5 border-amber-500/10";
    return "bg-white/[0.02] border-white/5";
  };

  const highCount = emails.filter(e => (e.priorityScore ?? 0) >= 8).length;
  const notifiedCount = emails.filter(e => e.notified).length;
  const summarizedCount = emails.filter(e => e.summary).length;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 md:py-16 flex flex-col gap-10 md:gap-14">
        
        <PageHeader 
          badge="Intelligence"
          title="Processed Emails"
          description="Every email analyzed by your AI agent — summarized, scored, and ready at a glance."
        />

        {/* ── Stats Grid ───────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: emails.length, icon: Mail, color: "text-white/40" },
            { label: "High Priority", value: highCount, icon: Zap, color: "text-red-400/60" },
            { label: "Alerted", value: notifiedCount, icon: Bell, color: "text-emerald-400/60" },
            { label: "Summarized", value: summarizedCount, icon: Sparkles, color: "text-blue-400/60" },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="p-5 md:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <s.icon size={14} className={s.color} strokeWidth={1.8} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-normal italic tracking-tight text-white/60 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {loading ? <span className="inline-block w-10 h-7 bg-white/5 rounded-lg animate-pulse" /> : s.value}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/15">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Search & Filter Bar ──────────────────────── */}
        <Card className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
              <input
                type="text"
                placeholder="Search subject, sender, or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-[14px] text-white/80 placeholder:text-white/10 focus:outline-none focus:border-white/12 transition-all font-medium"
              />
            </div>
            
            {/* Priority Filter */}
            <div className="flex p-1 bg-white/[0.02] rounded-xl border border-white/5 gap-1">
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${filterPriority === p
                      ? "bg-white text-black shadow-lg"
                      : "text-white/20 hover:text-white/40"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortMode(prev => prev === "newest" ? "oldest" : prev === "oldest" ? "priority" : "newest")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-white/40 transition-all shrink-0"
            >
              <ArrowUpDown size={12} />
              {sortMode}
            </button>
          </div>
        </Card>

        {/* ── Results Count ────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold text-white/15 uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? "Email" : "Emails"} 
              {search || filterPriority !== "all" ? " matched" : ""}
            </p>
            {search && (
              <button 
                onClick={() => { setSearch(""); setFilterPriority("all"); }}
                className="text-[10px] font-bold text-white/20 hover:text-white/50 uppercase tracking-widest transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Email List ───────────────────────────────── */}
        <Card className="min-h-[400px]">
          {loading ? (
            <div className="divide-y divide-white/[0.03]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-6 md:gap-10 p-6 md:p-8 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 bg-white/5 rounded-full w-3/4" />
                    <div className="h-2.5 bg-white/5 rounded-full w-1/2 opacity-50" />
                  </div>
                  <div className="hidden md:block w-16 h-3 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 md:p-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
                <Inbox className="w-8 h-8 text-white/10" strokeWidth={1.2} />
              </div>
              <p className="text-white/40 text-[16px] font-medium tracking-tight mb-2">
                {search ? "No emails match your query" : "No processed emails yet"}
              </p>
              <p className="text-white/15 text-[13px] max-w-[280px] leading-relaxed">
                {search 
                  ? "Try different keywords or adjust your priority filter." 
                  : "Connect a Gmail or Outlook account to begin monitoring."}
              </p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="show" variants={stagger} className="divide-y divide-white/[0.03]">
              {filtered.map((email) => {
                const isExpanded = expandedId === email.id;
                return (
                  <motion.div key={email.id} variants={fadeUp} className="group">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className={`w-full flex items-center gap-5 md:gap-8 p-5 md:p-8 hover:bg-white/[0.015] transition-all text-left ${isExpanded ? "bg-white/[0.02]" : ""}`}
                    >
                      {/* Priority Square */}
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[13px] font-bold shrink-0 transition-all ${
                        (email.priorityScore ?? 0) >= 8 
                          ? "text-red-400 bg-red-400/5 border-red-400/10 shadow-[0_0_20px_-8px] shadow-red-500/20" 
                          : (email.priorityScore ?? 0) >= 5 
                            ? "text-amber-400 bg-amber-400/5 border-amber-400/10" 
                            : "text-white/20 bg-white/[0.02] border-white/5"
                      }`}>
                        {email.priorityScore ?? "—"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] md:text-[14px] font-bold text-white/70 truncate group-hover:text-white transition-colors mb-1.5">
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-white/25 truncate font-medium max-w-[200px]">{email.sender || "Unknown"}</span>
                          <span className="text-white/10 text-[8px]">·</span>
                          <Badge variant="default" className="bg-white/[0.02] py-0 px-1.5 border-white/[0.05] text-[8px]">
                            {email.emailAccount.provider}
                          </Badge>
                          {email.notified && (
                            <>
                              <span className="text-white/10 text-[8px]">·</span>
                              <span className="text-emerald-500/40 text-[10px] flex items-center gap-1">
                                <Bell size={9} /> Sent
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Time + Expand */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-white/15 font-mono">
                          {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-white/10 transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180 text-white/40" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-8 pb-8 md:pb-10 md:ml-[72px]">
                            <div className="p-6 md:p-8 rounded-2xl bg-[#080808] border border-white/5 relative overflow-hidden">
                              {/* Gradient accent line */}
                              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                              
                              <div className="flex items-center gap-3 mb-5">
                                <Sparkles size={13} className="text-white/15" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                  AI Summary
                                </h4>
                              </div>
                              <p className="text-[14px] md:text-[15px] text-white/50 leading-relaxed font-medium">
                                {email.summary || "No automated summary available for this communication."}
                              </p>
                              
                              <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6 md:gap-10">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-1.5">Priority</p>
                                  <div className="flex items-center gap-2">
                                    {getPriorityBadge(email.priorityScore)}
                                    <span className="text-[11px] text-white/20">/10</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-1.5">Status</p>
                                  <p className="text-[12px] font-bold text-white/30 flex items-center gap-1.5">
                                    {email.notified ? <><Bell size={10} className="text-emerald-500/50" /> Notified</> : "Filtered"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-1.5">Processed</p>
                                  <p className="text-[12px] font-bold text-white/30 flex items-center gap-1.5">
                                    <Clock size={10} />
                                    {new Date(email.processedAt).toLocaleString("en-US", { 
                                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
