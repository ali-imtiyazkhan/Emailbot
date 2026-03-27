"use client";

import React, { useState, useEffect } from "react";
import { fetchFilters, createFilter, deleteFilter, FilterRule } from "@/lib/api";

export default function RulesPage() {
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ type: "sender", value: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const data = await fetchFilters();
      setFilters(data);
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
    if (!confirm("Remove this rule?")) return;
    try {
      await deleteFilter(id);
      await loadRules();
    } catch {
      alert("Failed to delete rule");
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case "sender":
        return "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";
      case "keyword":
        return "M7 20l4-16m2 16l4-16M6 9h14M4 15h14";
      case "priority_min":
        return "M13 10V3L4 14h7v7l9-11h-7z";
      default:
        return "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4";
    }
  };

  const getRuleColor = (type: string) => {
    switch (type) {
      case "sender": return { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" };
      case "keyword": return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case "priority_min": return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
      default: return { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black mb-1">Filter Rules</h1>
          <p className="text-slate-500 text-sm font-medium">
            Configure how your emails are filtered, prioritized, and forwarded.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
            showForm
              ? "bg-white/5 text-slate-400 border border-white/10"
              : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl shadow-indigo-500/20"
          }`}
        >
          {showForm ? "Cancel" : "+ New Rule"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass rounded-2xl p-8 mb-8 gradient-border animate-slide-up">
          <h3 className="text-lg font-black mb-6">Create New Rule</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Rule Type
                </label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
                >
                  <option value="sender">Sender Email</option>
                  <option value="keyword">Subject Keyword</option>
                  <option value="priority_min">Min Priority Score</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Value
                </label>
                <input
                  type="text"
                  placeholder={
                    newRule.type === "sender"
                      ? "e.g. ceo@company.com"
                      : newRule.type === "keyword"
                      ? "e.g. URGENT"
                      : "e.g. 7"
                  }
                  value={newRule.value}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !newRule.value.trim()}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold text-sm hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Apply Rule"}
            </button>
          </form>
        </div>
      )}

      {/* Rules Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading rules...</p>
        </div>
      ) : filters.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center gradient-border">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-slate-300 mb-2">No rules configured</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Create your first processing rule to control how emails are filtered and which ones trigger WhatsApp notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filters.map((filter, i) => {
            const colors = getRuleColor(filter.ruleType);
            return (
              <div
                key={filter.id}
                className="glass rounded-2xl p-6 gradient-border group hover:bg-white/[0.02] transition-all"
                style={{ animation: `fade-in 0.4s ease-out ${i * 80}ms both` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={getRuleIcon(filter.ruleType)} />
                    </svg>
                  </div>
                  <button
                    onClick={() => handleDelete(filter.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>
                  {filter.ruleType === "priority_min" ? "Min Priority" : filter.ruleType}
                </span>
                <p className="text-lg font-black text-slate-200 mt-1 break-all">{filter.value}</p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-600 font-medium">
                    Created {new Date(filter.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
