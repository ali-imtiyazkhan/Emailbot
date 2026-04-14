"use client";

import React, { useState, useEffect } from "react";
import { fetchAnalytics, AnalyticsData } from "@/lib/api";
import { 
  BarChart3, TrendingUp, Users, Tag, 
  Mail, Bell, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#7c3aed", "#4f46e5", "#4338ca"];
const CATEGORY_COLORS: Record<string, string> = {
  Work: "#6366f1",
  Personal: "#8b5cf6",
  Newsletter: "#a78bfa",
  Security: "#f59e0b",
  Finance: "#10b981",
  Social: "#ec4899",
  Promotions: "#f97316",
  unknown: "#525252",
  unanalyzed: "#404040",
  error: "#ef4444",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-[11px]">
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-white/70 font-semibold">
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
          <p className="text-white/20 text-[13px] font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-white/30 text-[14px]">Failed to load analytics data.</p>
      </div>
    );
  }

  // Calculate trends
  const days = data.emailsPerDay;
  const recentWeek = days.slice(-7);
  const previousWeek = days.slice(-14, -7);
  const recentTotal = recentWeek.reduce((s, d) => s + d.count, 0);
  const prevTotal = previousWeek.reduce((s, d) => s + d.count, 0);
  const trendPct = prevTotal > 0 ? Math.round(((recentTotal - prevTotal) / prevTotal) * 100) : 0;
  const trendUp = trendPct >= 0;

  const notificationRate = data.totalEmails > 0 
    ? Math.round((data.totalNotified / data.totalEmails) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1400px] mx-auto px-8 py-10 flex flex-col gap-8">
        
        <PageHeader 
          title="Analytics"
          description="Email processing insights over the last 30 days."
        />

        <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col gap-6">

          {/* ── Summary Cards ─────────────────────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: Mail, label: "Emails Processed", 
                value: data.totalEmails, 
                sub: `${recentWeek.reduce((s, d) => s + d.count, 0)} this week` 
              },
              { 
                icon: Bell, label: "Alerts Sent", 
                value: data.totalNotified, 
                sub: `${notificationRate}% notification rate` 
              },
              { 
                icon: TrendingUp, label: "7-Day Trend", 
                value: `${trendUp ? "+" : ""}${trendPct}%`, 
                sub: trendUp ? "More emails than last week" : "Fewer emails than last week",
                trend: trendUp 
              },
              { 
                icon: Users, label: "Unique Senders", 
                value: data.topSenders.length, 
                sub: data.topSenders[0] ? `Top: ${data.topSenders[0].sender.split(" ")[0]}` : "No data" 
              },
            ].map((s, i) => (
              <Card key={i} hoverable className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <s.icon size={15} className="text-white/30" strokeWidth={1.8} />
                  </div>
                  {s.trend !== undefined && (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.trend ? "text-emerald-400/60" : "text-red-400/60"}`}>
                      {s.trend ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {s.value}
                    </span>
                  )}
                </div>
                {s.trend === undefined && (
                  <p className="text-2xl font-semibold tracking-tight text-white mb-1">{s.value}</p>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/15">{s.label}</p>
                <p className="text-[10px] text-white/20 mt-1">{s.sub}</p>
              </Card>
            ))}
          </motion.div>

          {/* ── Charts Row 1: Volume + Priority ────────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Emails Per Day */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={14} className="text-white/25" />
                <h3 className="text-[13px] font-semibold text-white/50">Email Volume</h3>
                <span className="text-[10px] text-white/20 ml-auto">Last 30 days</span>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.emailsPerDay}>
                    <defs>
                      <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} 
                      axisLine={false} tickLine={false} width={25}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" dataKey="count" name="Emails"
                      stroke="#6366f1" strokeWidth={2} 
                      fill="url(#colorEmails)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Priority Distribution */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={14} className="text-white/25" />
                <h3 className="text-[13px] font-semibold text-white/50">Priority Distribution</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priorityDistribution}>
                    <XAxis 
                      dataKey="score" 
                      tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} 
                      axisLine={false} tickLine={false} width={25}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Emails" radius={[4, 4, 0, 0]}>
                      {data.priorityDistribution.map((entry, i) => (
                        <Cell 
                          key={i} 
                          fill={entry.score >= 8 ? "#ef4444" : entry.score >= 5 ? "#f59e0b" : "#6366f1"} 
                          fillOpacity={0.7}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* ── Charts Row 2: Senders + Categories ─────── */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Senders */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Users size={14} className="text-white/25" />
                <h3 className="text-[13px] font-semibold text-white/50">Top Senders</h3>
              </div>
              {data.topSenders.length === 0 ? (
                <p className="text-[12px] text-white/20 py-8 text-center">No sender data available.</p>
              ) : (
                <div className="space-y-3">
                  {data.topSenders.slice(0, 7).map((s, i) => {
                    const maxCount = data.topSenders[0]?.count || 1;
                    const pct = (s.count / maxCount) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] text-white/20 w-4 text-right font-mono">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-white/50 font-medium truncate max-w-[200px]">
                              {s.sender}
                            </span>
                            <span className="text-[10px] text-white/25 font-mono shrink-0">{s.count}</span>
                          </div>
                          <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-indigo-500/40 transition-all"
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Category Breakdown */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-5">
                <Tag size={14} className="text-white/25" />
                <h3 className="text-[13px] font-semibold text-white/50">Categories</h3>
              </div>
              {data.categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[12px] text-white/20">No category data yet.</p>
                  <p className="text-[10px] text-white/12 mt-1">Categories will appear as new emails are processed.</p>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="w-[140px] h-[140px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          dataKey="count"
                          nameKey="category"
                          cx="50%" cy="50%"
                          innerRadius={40} outerRadius={65}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {data.categoryBreakdown.map((entry, i) => (
                            <Cell 
                              key={i} 
                              fill={CATEGORY_COLORS[entry.category] || COLORS[i % COLORS.length]} 
                              fillOpacity={0.8}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {data.categoryBreakdown.map((cat, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category] || COLORS[i % COLORS.length] }} 
                        />
                        <span className="text-[11px] text-white/40 flex-1">{cat.category}</span>
                        <span className="text-[11px] text-white/25 font-mono">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Average Priority Trend ─────────────────── */}
          {data.averagePriorityByDay.length > 1 && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={14} className="text-white/25" />
                  <h3 className="text-[13px] font-semibold text-white/50">Priority Trend</h3>
                  <span className="text-[10px] text-white/20 ml-auto">Daily average priority score</span>
                </div>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.averagePriorityByDay}>
                      <defs>
                        <linearGradient id="colorPriority" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }}
                        tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        axisLine={false} tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[0, 10]}
                        tick={{ fontSize: 9, fill: "rgba(255,255,255,0.15)" }} 
                        axisLine={false} tickLine={false} width={25}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" dataKey="avgPriority" name="Avg Priority"
                        stroke="#f59e0b" strokeWidth={2} 
                        fill="url(#colorPriority)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
