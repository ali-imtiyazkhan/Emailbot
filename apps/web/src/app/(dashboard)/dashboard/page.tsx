"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { animate } from "framer-motion";
import {
  fetchStats,
  fetchFilters,
  fetchEmails,
  fetchAccounts,
  Stats,
  ProcessedEmail,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Mail, SlidersHorizontal, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPage, AppMetrics, AppSection, AppEmpty } from "@/components/app/AppPage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef} />;
}

function priorityClass(score: number | null) {
  if (!score) return "";
  if (score >= 8) return "app-priority--high";
  if (score >= 5) return "app-priority--mid";
  return "";
}

export default function DashboardPage() {
  const [hasToken] = useState(!!getToken());
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Awaited<ReturnType<typeof fetchFilters>>>([]);
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof fetchAccounts>>>([]);
  const [health, setHealth] = useState<{
    status: string;
    services: { database: string; redis: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken) return;
    loadData();
    const healthInterval = setInterval(pollHealth, 15000);
    return () => clearInterval(healthInterval);
  }, [hasToken]);

  const pollHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      setHealth(await res.json());
    } catch {
      setHealth(null);
    }
  };

  const loadData = async () => {
    try {
      const [s, f, e, acc] = await Promise.all([
        fetchStats(),
        fetchFilters(),
        fetchEmails(),
        fetchAccounts(),
      ]);
      setStats(s);
      setFilters(f);
      setEmails(e);
      setAccounts(acc);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }

    await pollHealth();
    setLoading(false);
  };

  const recentEmails = emails.slice(0, 6);
  const priorityEmails = emails.filter((e) => (e.priorityScore ?? 0) >= 8).length;
  const alertsSent = emails.filter((e) => e.notified).length;

  const metricValue = (n: number) =>
    loading ? <span className="app-skeleton" style={{ display: "inline-block", width: 48, height: 32 }} /> : <AnimatedCounter value={n} />;

  if (!hasToken) {
    return (
      <AppPage>
        <div className="connect-prompt">
          <div className="connect-prompt-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-3)", marginBottom: 16 }}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--text-1)" }}>Connect your email to get started</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>
              EmailBot monitors your inbox, scores messages by importance, and sends WhatsApp alerts for critical emails.
            </p>
            <Link href="/settings" className="btn btn-primary btn-lg">
              Connect email
            </Link>
          </div>
        </div>
        <style>{`
          .connect-prompt { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
          .connect-prompt-card { text-align: center; padding: 48px; }
        `}</style>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <PageHeader
        title="Dashboard"
        description={`Monitoring ${accounts.length} connected inbox${accounts.length !== 1 ? "es" : ""}. Summaries and alerts flow to WhatsApp.`}
        actions={
          <span className="app-status">
            <span className="app-status-dot" />
            Operational
          </span>
        }
      />

      <AppMetrics
        items={[
          { label: "Processed", value: metricValue(stats?.totalProcessed ?? 0) },
          { label: "Active rules", value: metricValue(filters.length) },
          { label: "Alerts sent", value: metricValue(alertsSent), hint: "WhatsApp" },
          { label: "Critical", value: metricValue(priorityEmails), hint: priorityEmails > 0 ? "Score 8+" : undefined },
        ]}
      />

      <div className="app-two-col">
        <AppSection
          label="Feed"
          title="Recent emails"
          description="Latest messages scored and summarized by your agent."
          action={
            <Link href="/emails" className="app-link">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="app-list">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="app-row" style={{ pointerEvents: "none" }}>
                  <div className="app-skeleton" style={{ width: 24, height: 14 }} />
                  <div style={{ flex: 1 }}>
                    <div className="app-skeleton" style={{ width: "40%", marginBottom: 10 }} />
                    <div className="app-skeleton" style={{ width: "25%", height: 10 }} />
                  </div>
                </div>
              ))}

            {!loading && recentEmails.length === 0 && (
              <AppEmpty
                icon={Mail}
                title="No emails yet"
                description="Connect Gmail or Outlook in Settings to start processing."
                action={
                  <Link href="/settings" className="btn btn-primary btn-lg">
                    Open settings
                  </Link>
                }
              />
            )}

            {!loading &&
              recentEmails.map((email) => (
                <Link key={email.id} href="/emails" className="app-row">
                  <span className={`app-priority ${priorityClass(email.priorityScore)}`}>
                    {email.priorityScore ?? "—"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }} className="truncate">
                      {email.subject || "No subject"}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-2)" }} className="truncate">
                      {email.sender || "Unknown"} · <span className="app-tag">{email.emailAccount.provider}</span>
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                    {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
          </div>
        </AppSection>

        <aside className="app-aside">
          <AppSection label="Shortcuts" title="Go to" description="">
            <div className="app-list">
              {[
                { href: "/rules", label: "Filter rules", desc: `${filters.length} active`, icon: SlidersHorizontal },
                { href: "/settings", label: "Settings", desc: "Accounts & digest", icon: CheckCircle2 },
                { href: "/analytics", label: "Analytics", desc: "30-day insights", icon: Zap },
              ].map(({ href, label, desc, icon: Icon }) => (
                <Link key={href} href={href} className="app-row">
                  <Icon size={16} strokeWidth={1.6} style={{ color: "var(--silver)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)" }}>{label}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{loading ? "…" : desc}</p>
                  </div>
                  <ArrowRight size={14} style={{ color: "var(--text-3)" }} />
                </Link>
              ))}
            </div>
          </AppSection>

          <AppSection label="Health" title="Services" description="">
            <div className="app-list">
              {[
                { name: "API", ok: !!health },
                { name: "Database", ok: health?.services?.database === "connected" },
                { name: "Redis", ok: health?.services?.redis === "connected" },
              ].map((svc) => (
                <div key={svc.name} className="app-row" style={{ cursor: "default" }}>
                  <span
                    className={`app-status-dot ${loading ? "app-status-dot--idle" : svc.ok ? "" : "app-status-dot--warn"}`}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: "var(--text-1)" }}>{svc.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                      {loading ? "Checking…" : svc.ok ? "Online" : "Unavailable"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AppSection>
        </aside>
      </div>
    </AppPage>
  );
}
