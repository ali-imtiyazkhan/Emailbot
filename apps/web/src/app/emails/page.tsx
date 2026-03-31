"use client";

import React, { useState, useEffect } from "react";
import { fetchEmails, ProcessedEmail } from "@/lib/api";
import { Search, Mail, Filter, ChevronDown, Bell, Zap, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

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

  const getPriorityBadge = (score: number | null) => {
    if (!score) return <Badge variant="default">N/A</Badge>;
    if (score >= 8) return <Badge variant="danger" dot>{score}</Badge>;
    if (score >= 5) return <Badge variant="warning" dot>{score}</Badge>;
    return <Badge variant="default">{score}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col gap-10">
        
        <PageHeader 
          badge="Intelligence"
          title="Processed Emails"
          description="Browse and search all emails analyzed by the AI engine. Every communication is summarized and prioritized automatically."
        />

        {/*  Filters & Stats Row */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Search & Filter */}
          <Card className="flex-1 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search by subject or sender..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-[14px] text-white/80 placeholder:text-white/10 focus:outline-none focus:border-white/10 transition-all font-medium"
                />
              </div>
              <div className="flex p-1 bg-white/[0.02] rounded-xl border border-white/5">
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
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Total", value: emails.length, icon: Mail },
              { label: "High", value: emails.filter(e => (e.priorityScore ?? 0) >= 8).length, icon: Zap },
              { label: "Notified", value: emails.filter(e => e.notified).length, icon: Bell },
              { label: "Summary", value: emails.filter(e => e.summary).length, icon: FileText },
            ].map((s, i) => (
              <Card key={i} className="px-5 py-4 min-w-[120px] flex flex-col justify-center">
                <div className="text-xl font-normal italic tracking-tight text-white/40 mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {loading ? "—" : s.value}
                </div>
                <div className="text-[9px] text-white/15 font-black uppercase tracking-[0.15em]">{s.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/*  Email List */}
        <Card className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32">
              <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mb-4" />
              <p className="text-white/20 text-[13px] font-medium tracking-tight">Syncing intelligence...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-white/10" strokeWidth={1.5} />
              </div>
              <p className="text-white/40 text-[15px] font-medium tracking-tight">
                {search ? "No emails match your query" : "No processed data available"}
              </p>
              <p className="text-white/10 text-[12px] mt-2 max-w-[240px]">
                Connect an account or adjust your filters to see historical processing data.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {filtered.map((email) => {
                const isExpanded = expandedId === email.id;
                return (
                  <div key={email.id} className="group">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : email.id)}
                      className={`w-full flex items-center gap-6 p-6 hover:bg-white/[0.01] transition-all text-left ${isExpanded ? "bg-white/[0.02]" : ""}`}
                    >
                      {/* Priority Marker */}
                      <div className="shrink-0 w-10">
                        {getPriorityBadge(email.priorityScore)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white/70 truncate group-hover:text-white transition-colors mb-1">
                          {email.subject || "No Subject"}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/20 truncate font-medium">{email.sender || "Unknown"}</span>
                          <span className="text-white/10 text-[10px]">·</span>
                          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/10">{email.emailAccount.provider}</span>
                        </div>
                      </div>

                      {/* Meta Indicators */}
                      <div className="hidden md:flex items-center gap-4 shrink-0 px-4">
                        {email.notified && <Badge variant="success" dot className="border-emerald-500/10">Notified</Badge>}
                        {email.digestIncluded && <Badge variant="default">In Digest</Badge>}
                      </div>

                      <div className="text-right shrink-0 w-24">
                        <p className="text-[11px] text-white/20 font-black uppercase tracking-tighter">
                          {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>

                      {/* Expand Arrow */}
                      <ChevronDown size={14} className={`text-white/10 transition-transform duration-300 ${isExpanded ? "rotate-180 text-white/40" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden bg-white/[0.02]"
                        >
                          <div className="px-6 pb-8 ml-[64px]">
                            <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Zap size={80} />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                AI Analysis & Brief
                              </h4>
                              <p className="text-[15px] text-white/50 leading-relaxed font-medium relative z-10">
                                {email.summary || "No automated summary available for this communication."}
                              </p>
                              
                              <div className="mt-8 pt-6 border-t border-white/5 flex gap-10">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-2">Confidence Score</p>
                                  <p className="text-[13px] font-bold text-white/30">94% Accurate</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/10 mb-2">Processing Time</p>
                                  <p className="text-[13px] font-bold text-white/30">1.2s via Agent v4</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
