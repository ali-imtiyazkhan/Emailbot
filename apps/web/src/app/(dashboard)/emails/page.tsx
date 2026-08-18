"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchEmails, replyToEmail, ProcessedEmail, AuthError } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  Search,
  Mail,
  ChevronDown,
  Bell,
  Inbox,
  Sparkles,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPage, AppMetrics, AppEmpty } from "@/components/app/AppPage";
import { motion, AnimatePresence } from "framer-motion";

type SortMode = "newest" | "oldest" | "priority";

function priorityClass(score: number | null) {
  if (!score) return "";
  if (score >= 8) return "app-priority--high";
  if (score >= 5) return "app-priority--mid";
  return "";
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replySending, setReplySending] = useState(false);
  const [replyResult, setReplyResult] = useState<{
    emailId: number;
    message: string;
    aiText?: string;
  } | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    fetchEmails({ category: filterCategory, priority: filterPriority, limit: 100 })
      .then(setEmails)
      .catch((err) => {
        console.error("Failed to load emails:", err);
        if (err instanceof AuthError) {
          setAuthError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [filterCategory, filterPriority]);

  const categories = useMemo(() => {
    const cats = emails
      .map((e) => e.category)
      .filter((c): c is string => !!c && c !== 'unanalyzed' && c !== 'error' && c !== 'unknown');
    return [...new Set(cats)].sort();
  }, [emails]);

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
        (filterPriority === "medium" &&
          (email.priorityScore ?? 0) >= 5 &&
          (email.priorityScore ?? 0) < 8) ||
        (filterPriority === "low" && (email.priorityScore ?? 0) < 5);

      const matchesCategory =
        filterCategory === "all" || email.category === filterCategory;

      return matchesSearch && matchesPriority && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortMode === "priority") return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      if (sortMode === "oldest")
        return new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
      return new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime();
    });

    return result;
  }, [emails, search, filterPriority, filterCategory, sortMode]);

  const highCount = emails.filter((e) => (e.priorityScore ?? 0) >= 8).length;
  const notifiedCount = emails.filter((e) => e.notified).length;
  const summarizedCount = emails.filter((e) => e.summary).length;

  const cycleSort = () =>
    setSortMode((prev) => (prev === "newest" ? "oldest" : prev === "oldest" ? "priority" : "newest"));

  if (authError) {
    return (
      <AppPage>
        <div className="connect-prompt">
          <div className="connect-prompt-card">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-3)", marginBottom: 16 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: "var(--text-1)" }}>Session expired</h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 400, margin: "0 auto 24px", lineHeight: 1.6 }}>
              Your authentication token has expired. Please reconnect your email account to continue.
            </p>
            <Link href="/settings" className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
              Reconnect
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
        badge="Inbox"
        title="Processed emails"
        description="Every message analyzed, scored, and summarized. Expand a row to read the summary or reply."
      />

      <AppMetrics
        items={[
          { label: "Total", value: loading ? "—" : emails.length },
          { label: "High priority", value: loading ? "—" : highCount },
          { label: "Notified", value: loading ? "—" : notifiedCount },
          { label: "Summarized", value: loading ? "—" : summarizedCount },
        ]}
      />

      <div className="app-toolbar">
        <div className="app-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search subject, sender, summary…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="app-input"
          />
        </div>
        <div className="app-pills">
          {["all", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPriority(p)}
              className={`app-pill ${filterPriority === p ? "app-pill--active" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <div className="app-pills">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="app-select"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
        <button type="button" onClick={cycleSort} className="app-link" style={{ border: "none", background: "none", cursor: "pointer" }}>
          <ArrowUpDown size={12} /> {sortMode}
        </button>
      </div>

      {!loading && (
        <p className="app-tag" style={{ marginBottom: 8 }}>
          {filtered.length} {filtered.length === 1 ? "email" : "emails"}
          {(search || filterPriority !== "all") && (
            <>
              {" · "}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterPriority("all");
                }}
                className="app-link"
                style={{ border: "none", background: "none", cursor: "pointer", padding: 0, textTransform: "none", letterSpacing: 0 }}
              >
                Clear filters
              </button>
            </>
          )}
        </p>
      )}

      <div className="app-list">
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="app-row" style={{ pointerEvents: "none" }}>
              <div className="app-skeleton" style={{ width: 24 }} />
              <div style={{ flex: 1 }}>
                <div className="app-skeleton" style={{ width: "50%", marginBottom: 10 }} />
                <div className="app-skeleton" style={{ width: "30%", height: 10 }} />
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <AppEmpty
            icon={Inbox}
            title={search ? "No matches" : "No emails yet"}
            description={
              search
                ? "Try different keywords or change the priority filter."
                : "Connect an account in Settings to start processing mail."
            }
          />
        )}

        {!loading &&
          filtered.map((email) => {
            const isExpanded = expandedId === email.id;
            return (
              <div key={email.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : email.id)}
                  className="app-row"
                >
                  <span className={`app-priority ${priorityClass(email.priorityScore)}`}>
                    {email.priorityScore ?? "—"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }} className="truncate">
                      {email.subject || "No subject"}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-2)" }} className="truncate">
                      {email.sender || "Unknown"}
                      <span className="app-tag"> · {email.emailAccount.provider}</span>
                      {email.category && (
                        <>
                          <span className="app-tag"> · </span>
                          <Tag size={10} style={{ display: "inline", verticalAlign: -1, marginRight: 4 }} />
                          <span className="app-tag">{email.category}</span>
                        </>
                      )}
                      {email.notified && (
                        <span className="app-tag app-tag--live"> · notified</span>
                      )}
                    </p>
                  </div>
                  <span className="app-row-date">
                    {new Date(email.processedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: "var(--text-3)",
                      transform: isExpanded ? "rotate(180deg)" : "none",
                      transition: "transform 0.25s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="app-detail"
                      style={{ overflow: "hidden" }}
                    >
                      <div className="app-detail-inner">
                        <p className="app-detail-label">
                          <Sparkles size={12} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                          Summary
                        </p>
                        <p className="app-detail-text">
                          {email.summary || "No summary available for this message."}
                        </p>

                        <dl className="app-detail-meta">
                          <div>
                            <dt>Priority</dt>
                            <dd>{email.priorityScore ?? "—"} / 10</dd>
                          </div>
                          <div>
                            <dt>Status</dt>
                            <dd>{email.notified ? "Sent to WhatsApp" : "Filtered only"}</dd>
                          </div>
                          <div>
                            <dt>Processed</dt>
                            <dd>
                              <Clock size={12} style={{ display: "inline", marginRight: 4, verticalAlign: -1, opacity: 0.5 }} />
                              {new Date(email.processedAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </dd>
                          </div>
                        </dl>

                        <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
                          {replyResult?.emailId === email.id ? (
                            <div>
                              <p style={{ fontSize: 14, color: "var(--success)", fontWeight: 500, marginBottom: 8 }}>
                                <CheckCircle2 size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                                {replyResult.message}
                              </p>
                              {replyResult.aiText && (
                                <p style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.6 }}>
                                  {replyResult.aiText.substring(0, 180)}
                                  {replyResult.aiText.length > 180 ? "…" : ""}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setReplyResult(null)}
                                className="app-link"
                                style={{ marginTop: 16, border: "none", background: "none", cursor: "pointer", padding: 0 }}
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : replyingTo === email.id ? (
                            <div>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Quick reply — AI will polish before sending…"
                                className="app-input app-input--plain"
                                style={{
                                  minHeight: 100,
                                  resize: "vertical",
                                  borderBottom: "1px solid var(--border-light)",
                                  marginBottom: 20,
                                }}
                                autoFocus
                              />
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                                <button
                                  type="button"
                                  disabled={replySending || !replyText.trim()}
                                  className="btn btn-primary"
                                  onClick={async () => {
                                    if (!replyText.trim()) return;
                                    setReplySending(true);
                                    try {
                                      const result = await replyToEmail(email.id, replyText);
                                      setReplyResult({
                                        emailId: email.id,
                                        message: result.message,
                                        aiText: result.aiImproved ? result.finalText : undefined,
                                      });
                                      setReplyText("");
                                      setReplyingTo(null);
                                    } catch (err: unknown) {
                                      alert(err instanceof Error ? err.message : "Failed to send reply");
                                    } finally {
                                      setReplySending(false);
                                    }
                                  }}
                                >
                                  {replySending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Send size={14} />
                                  )}
                                  {replySending ? "Sending…" : "Send reply"}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText("");
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setReplyingTo(email.id)}
                            >
                              <Send size={14} />
                              Reply to this email
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </div>
    </AppPage>
  );
}
