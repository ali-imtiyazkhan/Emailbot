"use client";

import React, { useState, useEffect } from "react";
import { fetchFilters, createFilter, deleteFilter, FilterRule } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Plus, Trash2, User, Hash, Zap, Settings2, X, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPage, AppSection, AppEmpty } from "@/components/app/AppPage";
import { motion, AnimatePresence } from "framer-motion";

const RULE_META: Record<
  string,
  { icon: typeof User; label: string; description: string; hint: string }
> = {
  sender: {
    icon: User,
    label: "Sender",
    description: "Match emails from a specific address.",
    hint: "boss@company.com",
  },
  keyword: {
    icon: Hash,
    label: "Keyword",
    description: "Match when subject or body contains a phrase.",
    hint: "urgent, invoice",
  },
  priority_min: {
    icon: Zap,
    label: "Min. priority",
    description: "Only notify when AI score is at or above this value (1–10).",
    hint: "8",
  },
  category: {
    icon: Tag,
    label: "Category",
    description: "Match emails with a specific AI-detected category.",
    hint: "Work, Personal, Security",
  },
};

export default function RulesPage() {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ type: "sender", value: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/dashboard";
      return;
    }
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setFilters(await fetchFilters());
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.value.trim()) return;
    setSubmitting(true);
    try {
      await createFilter(newRule.type, newRule.value.trim());
      setNewRule({ type: "sender", value: "" });
      setShowForm(false);
      await loadRules();
    } catch {
      alert("Failed to create rule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFilter(id);
      setDeleteConfirm(null);
      await loadRules();
    } catch {
      alert("Failed to delete rule");
    }
  };

  const selectedMeta = RULE_META[newRule.type] || RULE_META.sender;

  return (
    <AppPage>
      <PageHeader
        badge="Automation"
        title="Filter rules"
        description="Guide what reaches WhatsApp — by sender, keyword, or minimum priority score."
        actions={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          >
            {showForm ? (
              <>
                <X size={14} /> Close
              </>
            ) : (
              <>
                <Plus size={14} /> Add rule
              </>
            )}
          </button>
        }
      />

      {!showForm && !loading && (
        <div className="app-rule-types">
          {Object.entries(RULE_META).map(([type, meta]) => {
            const count = filters.filter((f) => f.ruleType === type).length;
            return (
              <div key={type} className="app-rule-type">
                <meta.icon size={16} strokeWidth={1.6} style={{ color: "var(--silver)", marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>{meta.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{meta.description}</p>
                {count > 0 && (
                  <p className="app-tag" style={{ marginTop: 12 }}>
                    {count} active
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="app-form-panel"
          >
            <p className="label" style={{ marginBottom: 24 }}>
              New rule
            </p>
            <form onSubmit={handleCreate}>
              <div className="app-form-grid">
                <div>
                  <p className="app-detail-label" style={{ marginBottom: 16 }}>
                    Type
                  </p>
                  <div className="app-list" style={{ borderTop: "1px solid var(--border)" }}>
                    {Object.entries(RULE_META).map(([type, meta]) => {
                      const Icon = meta.icon;
                      const selected = newRule.type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewRule({ ...newRule, type })}
                          className="app-row"
                          style={{ color: selected ? "var(--text-1)" : "var(--text-2)" }}
                        >
                          <Icon size={16} strokeWidth={1.6} style={{ color: "var(--silver)" }} />
                          <span style={{ fontSize: 14 }}>{meta.label}</span>
                          {selected && <span className="app-tag app-tag--live">Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="app-detail-label" htmlFor="rule-value">
                    Value
                  </label>
                  <input
                    id="rule-value"
                    type="text"
                    placeholder={selectedMeta.hint}
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    className="app-input app-input--plain"
                    autoFocus
                  />
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 16, lineHeight: 1.65 }}>
                    {selectedMeta.description}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting || !newRule.value.trim()}
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 32 }}
                  >
                    {submitting ? "Saving…" : "Save rule"}
                  </button>
                </div>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <AppSection
        label="Active"
        title={`${filters.length} rule${filters.length !== 1 ? "s" : ""}`}
        description={filters.length === 0 ? "Without rules, only AI priority scores decide alerts." : undefined}
      >
        {loading ? (
          <div className="app-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="app-row">
                <div className="app-skeleton" style={{ width: "30%" }} />
              </div>
            ))}
          </div>
        ) : filters.length === 0 ? (
          <AppEmpty
            icon={Settings2}
            title="No rules yet"
            description="Add a sender, keyword, or priority threshold to customize routing."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={14} /> Add rule
              </button>
            }
          />
        ) : (
          <div className="app-list">
            {filters.map((filter) => {
              const meta = RULE_META[filter.ruleType] || RULE_META.sender;
              const Icon = meta.icon;
              const confirming = deleteConfirm === filter.id;

              return (
                <div key={filter.id} className="app-row" style={{ cursor: "default", position: "relative" }}>
                  <Icon size={16} strokeWidth={1.6} style={{ color: "var(--silver)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="app-tag" style={{ marginBottom: 8 }}>
                      {meta.label}
                    </p>
                    <p style={{ fontSize: 16, fontWeight: 500, color: "var(--text-1)", wordBreak: "break-all" }}>
                      {filter.value}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>
                      Added{" "}
                      {new Date(filter.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {confirming ? (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: "#f87171" }}
                        onClick={() => handleDelete(filter.id)}
                      >
                        Remove
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setDeleteConfirm(filter.id)}
                      aria-label="Delete rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AppSection>
    </AppPage>
  );
}
