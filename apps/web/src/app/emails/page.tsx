"use client";

import React, { useState, useEffect, useMemo } from "react";
import { fetchEmails, replyToEmail, ProcessedEmail } from "@/lib/api";
import { Search, Mail, Filter, ChevronDown, Bell, Zap, FileText, ArrowUpDown, Inbox, Sparkles, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

// Animations
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } } as const;
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } } as const;

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-white/20 selection:text-white relative">
      {/* Dynamic Background Atmosphere Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1340px] mx-auto px-6 lg:px-8 py-12 flex flex-col gap-8 relative z-10">
        
        <PageHeader 
          badge="Intelligence"
          title="Processed Emails"
          description="Every email analyzed by your AI agent — summarized, scored, and ready at a glance."
        />

        {/* ── Stats Grid ───────────────────────────────── */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Emails", value: emails.length, icon: Mail, color: "text-blue-400 bg-blue-500/5 border-blue-500/10" },
            { label: "High Priority", value: highCount, icon: Zap, color: "text-rose-400 bg-rose-500/5 border-rose-500/10" },
            { label: "Alerts Dispatched", value: notifiedCount, icon: Bell, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
            { label: "AI Summarized", value: summarizedCount, icon: Sparkles, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp}>
              <Card className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md hover:border-neutral-700/60 hover:bg-neutral-900/50 transition-all duration-300 shadow-sm flex flex-col relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-white/[0.01] to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.color}`}>
                    <s.icon size={16} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-1.5 relative z-10">
                  {loading ? <span className="inline-block w-12 h-8 bg-neutral-800 rounded-md animate-pulse" /> : s.value}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 relative z-10">{s.label}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Search & Filter Bar ──────────────────────── */}
        <Card className="p-5 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md relative z-20 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="text"
                placeholder="Search subject, sender, or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-[14px] text-neutral-100 placeholder:text-neutral-700 focus:outline-none transition-all font-medium shadow-inner"
              />
            </div>
            
            {/* Priority Filter */}
            <div className="flex p-1 bg-neutral-950 rounded-xl border border-neutral-800 gap-1.5 shadow-inner">
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                    ${filterPriority === p
                      ? "bg-neutral-50 text-neutral-950 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/30"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortMode(prev => prev === "newest" ? "oldest" : prev === "oldest" ? "priority" : "newest")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-neutral-900/30 transition-all shrink-0 shadow-inner"
            >
              <ArrowUpDown size={12} />
              {sortMode}
            </button>
          </div>
        </Card>

        {/* ── Results Count ────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              {filtered.length} {filtered.length === 1 ? "Email" : "Emails"} 
              {search || filterPriority !== "all" ? " matched" : ""}
            </p>
            {search && (
              <button 
                onClick={() => { setSearch(""); setFilterPriority("all"); }}
                className="text-[10px] font-bold text-neutral-500 hover:text-white uppercase tracking-wider transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Email List ───────────────────────────────── */}
        <Card className="rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md overflow-hidden shadow-sm">
          {loading ? (
            <div className="divide-y divide-neutral-900">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 px-6 py-5 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 bg-neutral-800 rounded w-3/4" />
                    <div className="h-2.5 bg-neutral-800 rounded w-1/2 opacity-50" />
                  </div>
                  <div className="hidden md:block w-16 h-3 bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 md:p-32 text-center">
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center mb-6 shadow-inner"
              >
                <Inbox className="w-6 h-6 text-neutral-500" strokeWidth={1.5} />
              </motion.div>
              <p className="text-neutral-200 text-[15px] font-semibold tracking-tight mb-2">
                {search ? "No emails match your query" : "No processed emails yet"}
              </p>
              <p className="text-neutral-500 text-[13px] max-w-[280px] leading-relaxed mx-auto">
                {search 
                  ? "Try different keywords or adjust your priority filter." 
                  : "Connect a Gmail or Outlook account to begin monitoring."}
              </p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="show" variants={stagger} className="divide-y divide-neutral-900">
              {filtered.map((email) => {
                const isExpanded = expandedId === email.id;
                return (
                  <motion.div key={email.id} variants={fadeUp} className="group relative">
                    
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className={`relative z-10 w-full flex items-center gap-5 p-5 md:p-6 hover:bg-neutral-900/40 transition-all text-left ${isExpanded ? "bg-neutral-900/20" : ""}`}
                    >
                      {/* Priority Square */}
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[12.5px] font-bold shrink-0 transition-all ${
                        (email.priorityScore ?? 0) >= 8 
                          ? "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                          : (email.priorityScore ?? 0) >= 5 
                            ? "text-amber-400 bg-amber-500/10 border-amber-500/20" 
                            : "text-neutral-500 bg-neutral-950 border-neutral-800"
                      }`}>
                        {email.priorityScore ?? "—"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13.5px] font-semibold truncate transition-colors mb-1.5 ${isExpanded ? "text-white" : "text-neutral-200 group-hover:text-white"}`}>
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11.5px] text-neutral-500 truncate font-normal max-w-[200px]">{email.sender || "Unknown"}</span>
                          <span className="text-neutral-800 text-[10px]">·</span>
                          <Badge variant="default" className="bg-neutral-950 py-0 px-2 border border-neutral-800 text-[9px] font-bold uppercase tracking-wider rounded text-neutral-400">
                            {email.emailAccount.provider}
                          </Badge>
                          {email.notified && (
                            <>
                              <span className="text-neutral-800 text-[10px]">·</span>
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5 flex items-center gap-1">
                                <Bell size={9} /> Sent
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Time + Expand */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180 text-white" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="overflow-hidden relative z-10 bg-neutral-900/10"
                        >
                          <div className="px-5 md:px-6 pb-6 md:ml-[56px]">
                            {/* Premium Mockup Panel for Summary */}
                            <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-800/80 backdrop-blur-xl relative overflow-hidden shadow-inner">
                              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700/20 to-transparent" />
                              
                              <div className="flex items-center gap-3 mb-4">
                                <Sparkles size={14} className="text-neutral-500" />
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                  AI Summary
                                </h4>
                              </div>
                              <p className="text-[14px] text-neutral-300 leading-relaxed font-medium">
                                {email.summary || "No automated summary available for this communication."}
                              </p>
                              
                              <div className="mt-6 pt-5 border-t border-neutral-900 flex flex-wrap gap-6 md:gap-10">
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Priority</p>
                                  <div className="flex items-center gap-2">
                                    {getPriorityBadge(email.priorityScore)}
                                    <span className="text-[11px] text-neutral-500 font-medium">/10</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Status</p>
                                  <p className="text-[12.5px] font-semibold text-neutral-300 flex items-center gap-1.5">
                                    {email.notified ? <><Bell size={11} className="text-emerald-500/70" /> Notified</> : "Filtered"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Processed</p>
                                  <p className="text-[12.5px] font-semibold text-neutral-300 flex items-center gap-1.5">
                                    <Clock size={11} className="text-neutral-500" />
                                    {new Date(email.processedAt).toLocaleString("en-US", { 
                                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* ── Reply Section ───── */}
                              <div className="mt-5 pt-5 border-t border-neutral-900">
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
                                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-[13.5px] text-neutral-100 placeholder:text-neutral-705 focus:outline-none focus:border-neutral-700 transition-all resize-none min-h-[90px] shadow-inner"
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
                                        className="px-5 py-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-200 text-neutral-950 font-semibold text-[13px] disabled:opacity-20 flex items-center gap-2 transition-all duration-200"
                                      >
                                        {replySending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                        {replySending ? "Sending..." : "Send Reply"}
                                      </button>
                                      <button
                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                        className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                                      >
                                        Cancel
                                      </button>
                                      <span className="text-[10px] font-medium text-neutral-500 ml-auto hidden md:block">
                                        AI will polish your message automatically
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingTo(email.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-850 hover:border-neutral-700 hover:bg-neutral-900/30 text-[11.5px] font-semibold text-neutral-300 hover:text-white transition-all shadow-sm"
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
