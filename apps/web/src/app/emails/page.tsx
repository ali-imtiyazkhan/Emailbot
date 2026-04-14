"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchEmails, replyToEmail, ProcessedEmail } from "@/lib/api";
import { Search, Mail, Filter, ChevronDown, Bell, Zap, FileText, ArrowUpDown, Inbox, Sparkles, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<{ emailId: number; message: string; aiText?: string } | null>(null);

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
    <div className="min-h-screen text-white relative z-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8 md:py-10 flex flex-col gap-8 md:gap-10">
        
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
              <Card className="p-5 md:p-7 h-full flex flex-col relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <s.icon size={14} className={s.color} strokeWidth={1.8} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white/90 mb-1 relative z-10">
                  {loading ? <span className="inline-block w-10 h-7 bg-white/5 rounded-lg animate-pulse" /> : s.value}
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 relative z-10">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Search & Filter Bar ──────────────────────── */}
        <Card className="p-4 md:p-5 relative z-20 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search subject, sender, or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-11 pr-4 py-3 text-[14px] text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#555] focus:bg-[#1a1a1a] transition-all font-medium shadow-inner"
              />
            </div>
            
            {/* Priority Filter */}
            <div className="flex p-1 bg-[#111] rounded-xl border border-[#2a2a2a] gap-1 shadow-inner">
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${filterPriority === p
                      ? "bg-white text-black shadow-md"
                      : "text-[#888] hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortMode(prev => prev === "newest" ? "oldest" : prev === "oldest" ? "priority" : "newest")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111] border border-[#2a2a2a] text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all shrink-0 shadow-inner"
            >
              <ArrowUpDown size={12} />
              {sortMode}
            </button>
          </div>
        </Card>

        {/* ── Results Count ────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
              {filtered.length} {filtered.length === 1 ? "Email" : "Emails"} 
              {search || filterPriority !== "all" ? " matched" : ""}
            </p>
            {search && (
              <button 
                onClick={() => { setSearch(""); setFilterPriority("all"); }}
                className="text-[10px] font-bold text-[#888] hover:text-white uppercase tracking-widest transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Email List ───────────────────────────────── */}
        <Card className="min-h-[400px]">
          {loading ? (
            <div className="divide-y divide-[#1c1c1c]">
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
              <div className="w-20 h-20 rounded-2xl bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center mb-8 shadow-inner">
                <Inbox className="w-8 h-8 text-[#888]" strokeWidth={1.2} />
              </div>
              <p className="text-white/80 text-[16px] font-semibold tracking-tight mb-2">
                {search ? "No emails match your query" : "No processed emails yet"}
              </p>
              <p className="text-[#888] text-[13px] max-w-[280px] leading-relaxed">
                {search 
                  ? "Try different keywords or adjust your priority filter." 
                  : "Connect a Gmail or Outlook account to begin monitoring."}
              </p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="show" variants={stagger} className="divide-y divide-[#1c1c1c]">
              {filtered.map((email) => {
                const isExpanded = expandedId === email.id;
                return (
                  <motion.div key={email.id} variants={fadeUp} className="group relative">
                    {/* Active highlight glow behind Row */}
                    {isExpanded && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent pointer-events-none" />}
                    
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className={`relative z-10 w-full flex items-center gap-5 md:gap-8 p-5 md:p-8 hover:bg-white/[0.03] transition-all text-left ${isExpanded ? "bg-[#141414] shadow-inner" : ""}`}
                    >
                      {/* Priority Square */}
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[13px] font-bold shrink-0 transition-all ${
                        (email.priorityScore ?? 0) >= 8 
                          ? "text-red-400 bg-red-400/5 border-red-400/10 shadow-[0_0_20px_-5px] shadow-red-500/30" 
                          : (email.priorityScore ?? 0) >= 5 
                            ? "text-amber-400 bg-amber-400/5 border-amber-400/10 shadow-[0_0_15px_-5px] shadow-amber-500/20" 
                            : "text-[#888] bg-white/[0.02] border-[#2a2a2a]"
                      }`}>
                        {email.priorityScore ?? "—"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] md:text-[14.5px] font-bold truncate transition-colors mb-1.5 ${isExpanded ? "text-white" : "text-[#e8e8e8] group-hover:text-white"}`}>
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-[#888] truncate font-medium max-w-[200px]">{email.sender || "Unknown"}</span>
                          <span className="text-[#444] text-[8px]">·</span>
                          <Badge variant="default" className="bg-[#111] py-0 px-1.5 border-[#2a2a2a] text-[8px] font-medium tracking-wide text-[#999]">
                            {email.emailAccount.provider}
                          </Badge>
                          {email.notified && (
                            <>
                              <span className="text-[#444] text-[8px]">·</span>
                              <span className="text-emerald-500/70 text-[10px] font-bold tracking-wide flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                                <Bell size={9} /> Sent
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Time + Expand */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <span className="text-[10.5px] text-[#888] font-mono font-medium">
                          {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-[#888] transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180 text-white" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden relative z-10 bg-[#141414]"
                        >
                          <div className="px-5 md:px-8 pb-8 md:pb-10 md:ml-[72px]">
                            {/* Premium Mockup Panel for Summary */}
                            <div className="p-6 md:p-8 rounded-2xl bg-[#0a0a0a] border border-[#2a2a2a] relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.02)_inset]">
                              {/* Chrome Top Edge */}
                              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                              
                              <div className="flex items-center gap-3 mb-5">
                                <Sparkles size={14} className="text-[#888]" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8e8e8]">
                                  AI Summary
                                </h4>
                              </div>
                              <p className="text-[14px] md:text-[15px] text-[#d4d4d4] leading-relaxed font-medium">
                                {email.summary || "No automated summary available for this communication."}
                              </p>
                              
                              <div className="mt-6 pt-5 border-t border-[#1c1c1c] flex flex-wrap gap-6 md:gap-10">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#666] mb-1.5">Priority</p>
                                  <div className="flex items-center gap-2">
                                    {getPriorityBadge(email.priorityScore)}
                                    <span className="text-[11px] text-[#888] font-medium">/10</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#666] mb-1.5">Status</p>
                                  <p className="text-[12.5px] font-bold text-[#e8e8e8] flex items-center gap-1.5">
                                    {email.notified ? <><Bell size={11} className="text-emerald-500/70" /> Notified</> : "Filtered"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#666] mb-1.5">Processed</p>
                                  <p className="text-[12.5px] font-bold text-[#e8e8e8] flex items-center gap-1.5">
                                    <Clock size={11} className="text-[#888]" />
                                    {new Date(email.processedAt).toLocaleString("en-US", { 
                                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* ── Reply Section ───── */}
                              <div className="mt-5 pt-5 border-t border-[#1c1c1c]">
                                {replyResult?.emailId === email.id ? (
                                  <div className="flex items-start gap-4 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-[13px] text-emerald-400 font-bold mb-1.5">{replyResult.message}</p>
                                      {replyResult.aiText && (
                                        <p className="text-[12px] text-emerald-400/70 leading-relaxed font-medium italic">
                                          "{replyResult.aiText.substring(0, 150)}{replyResult.aiText.length > 150 ? '...' : ''}"
                                        </p>
                                      )}
                                      <button 
                                        onClick={() => setReplyResult(null)}
                                        className="text-[11px] font-bold uppercase tracking-wider text-emerald-400/50 hover:text-emerald-400 mt-3 transition-colors"
                                      >
                                        Dismiss
                                      </button>
                                    </div>
                                  </div>
                                ) : replyingTo === email.id ? (
                                  <div className="space-y-3">
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      placeholder="Type your quick reply — AI will polish it into a professional email..."
                                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-[13.5px] text-[#e8e8e8] placeholder:text-[#666] focus:outline-none focus:border-[#444] focus:bg-[#151515] transition-all resize-none min-h-[90px] shadow-inner"
                                      autoFocus
                                    />
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={async () => {
                                          if (!replyText.trim()) return;
                                          setReplySending(true);
                                          try {
                                            const result = await replyToEmail(email.id, replyText);
                                            setReplyResult({ emailId: email.id, message: result.message, aiText: result.aiImproved ? result.finalText : undefined });
                                            setReplyText("");
                                            setReplyingTo(null);
                                          } catch (err: any) {
                                            alert(err.message || "Failed to send reply");
                                          } finally {
                                            setReplySending(false);
                                          }
                                        }}
                                        disabled={replySending || !replyText.trim()}
                                        className="btn btn-primary px-5 py-2.5 rounded-lg disabled:opacity-20 flex items-center gap-2"
                                      >
                                        {replySending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                        {replySending ? "Sending..." : "Send Reply"}
                                      </button>
                                      <button
                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                        className="btn btn-ghost px-4 py-2"
                                      >
                                        Cancel
                                      </button>
                                      <span className="text-[10px] font-medium text-[#666] ml-auto hidden md:block">
                                        AI will polish your message automatically
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingTo(email.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/[0.03] border border-[#2a2a2a] hover:border-[#444] hover:bg-white/[0.05] text-[11.5px] font-bold text-[#d4d4d4] hover:text-white transition-all shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                  >
                                    <Send size={13} />
                                    Reply to this email
                                  </button>
                                )}
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
