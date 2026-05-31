"use client";

import React, { useState, useEffect } from "react";
import { fetchAnalytics, AnalyticsData } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Tag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPage, AppMetrics } from "@/components/app/AppPage";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const SILVER = "#9a9a9a";
const MUTED = "#484848";
const CHART_STROKE = "#c8c8c8";
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border-light)", padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "var(--text-3)", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "var(--text-1)", fontWeight: 500 }}>
          {p.name}: {p.value}
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
      <div className="app-page" style={{ justifyContent: "center", minHeight: "60vh" }}>
        <div className="app-status">
          <span className="app-status-dot app-status-dot--idle" />
          Loading analytics…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <AppPage>
        <p style={{ color: "var(--text-2)", fontSize: 15 }}>Failed to load analytics.</p>
      </AppPage>
    );
  }

  const recentWeek = data.emailsPerDay.slice(-7);
  const previousWeek = data.emailsPerDay.slice(-14, -7);
  const recentTotal = recentWeek.reduce((s, d) => s + d.count, 0);
  const prevTotal = previousWeek.reduce((s, d) => s + d.count, 0);
  const trendPct = prevTotal > 0 ? Math.round(((recentTotal - prevTotal) / prevTotal) * 100) : 0;
  const trendUp = trendPct >= 0;
  const notificationRate =
    data.totalEmails > 0 ? Math.round((data.totalNotified / data.totalEmails) * 100) : 0;

  const pieColors = ["#e8e8e8", "#9a9a9a", "#666", "#484848", "#333", "#2a2a2a"];

  return (
    <AppPage>
      <PageHeader
        badge="Insights"
        title="Analytics"
        description="Processing volume and priority patterns over the last 30 days."
      />

      <AppMetrics
        items={[
          { label: "Processed", value: data.totalEmails, hint: `${recentTotal} this week` },
          { label: "Alerts sent", value: data.totalNotified, hint: `${notificationRate}% of mail` },
          {
            label: "7-day trend",
            value: (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {trendUp ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {trendUp ? "+" : ""}
                {trendPct}%
              </span>
            ),
            hint: trendUp ? "vs. prior week" : "vs. prior week",
          },
          {
            label: "Senders",
            value: data.topSenders.length,
            hint: data.topSenders[0] ? `Top: ${data.topSenders[0].sender.split(" ")[0]}` : undefined,
          },
        ]}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div className="app-chart-block">
          <div className="app-chart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BarChart3 size={15} style={{ color: "var(--silver)" }} />
              <h3 className="app-chart-title">Email volume</h3>
            </div>
            <span className="app-chart-sub">Last 30 days</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.emailsPerDay}>
                <defs>
                  <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fff" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: MUTED }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Emails" stroke={CHART_STROKE} strokeWidth={1.5} fill="url(#volFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-chart-block">
          <div className="app-chart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={15} style={{ color: "var(--silver)" }} />
              <h3 className="app-chart-title">Priority distribution</h3>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priorityDistribution}>
                <XAxis dataKey="score" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Emails" radius={[2, 2, 0, 0]}>
                  {data.priorityDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.score >= 8 ? "#e8e8e8" : entry.score >= 5 ? SILVER : "#555"
                      }
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="app-chart-block">
          <div className="app-chart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={15} style={{ color: "var(--silver)" }} />
              <h3 className="app-chart-title">Top senders</h3>
            </div>
          </div>
          {data.topSenders.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-3)", padding: "24px 0" }}>No sender data yet.</p>
          ) : (
            <div>
              {data.topSenders.slice(0, 8).map((s, i) => {
                const maxCount = data.topSenders[0]?.count || 1;
                const pct = (s.count / maxCount) * 100;
                return (
                  <div key={i} className="app-sender-row">
                    <span className="app-sender-rank">{i + 1}</span>
                    <div className="app-sender-bar">
                      <div className="app-sender-bar-top">
                        <span className="app-sender-name">{s.sender}</span>
                        <span className="app-sender-count">{s.count}</span>
                      </div>
                      <div className="app-sender-track">
                        <div className="app-sender-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="app-chart-block">
          <div className="app-chart-head">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Tag size={15} style={{ color: "var(--silver)" }} />
              <h3 className="app-chart-title">Categories</h3>
            </div>
          </div>
          {data.categoryBreakdown.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-3)", padding: "24px 0" }}>
              Categories appear as new mail is processed.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center", padding: "16px 0" }}>
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {data.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} fillOpacity={0.95} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {data.categoryBreakdown.map((cat, i) => (
                  <div
                    key={cat.category}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: i < data.categoryBreakdown.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: pieColors[i % pieColors.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 14, color: "var(--text-2)" }}>{cat.category}</span>
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.averagePriorityByDay.length > 1 && (
          <div className="app-chart-block">
            <div className="app-chart-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <TrendingUp size={15} style={{ color: "var(--silver)" }} />
                <h3 className="app-chart-title">Priority trend</h3>
              </div>
              <span className="app-chart-sub">Daily average score</span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.averagePriorityByDay}>
                  <defs>
                    <linearGradient id="priFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fff" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: MUTED }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="avgPriority"
                    name="Avg priority"
                    stroke={SILVER}
                    strokeWidth={1.5}
                    fill="url(#priFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </motion.div>
    </AppPage>
  );
}
