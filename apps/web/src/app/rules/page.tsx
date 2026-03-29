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

  return (
    <div className="p-8 md:p-12 xl:p-16 w-full ml-auto mr-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">Filter Rules</h1>
          <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-lg">
            Configure how your emails are filtered, prioritized, and forwarded.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-5 py-2.5 rounded-md font-bold text-[13px] tracking-tight transition-all active:scale-95 ${
            showForm
              ? "bg-white/5 text-slate-400 border border-white/10"
              : "bg-white text-black hover:bg-slate-200"
          }`}
        >
          {showForm ? "Cancel" : "+ New Rule"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-8 mb-10 animate-fade-in">
          <h3 className="text-[17px] font-bold mb-8">Create New Rule</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-widest mb-3">
                  Rule Type
                </label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-4 py-2.5 text-[14px] text-slate-200 focus:outline-none focus:border-white/20 transition-all font-medium appearance-none"
                >
                  <option value="sender">Sender Email</option>
                  <option value="keyword">Subject Keyword</option>
                  <option value="priority_min">Min Priority Score</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-widest mb-3">
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
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-4 py-2.5 text-[14px] text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-all font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !newRule.value.trim()}
              className="w-full bg-white text-black py-3 rounded-md font-bold text-[14px] hover:bg-slate-200 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Apply Rule"}
            </button>
          </form>
        </div>
      )}

      {/* Rules Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-[13px] font-medium">Loading rules...</p>
        </div>
      ) : filters.length === 0 ? (
        <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-2">No rules configured</h3>
          <p className="text-slate-500 text-[14px] font-medium max-w-sm mx-auto">
            Create your first processing rule to control how emails are filtered and which ones trigger WhatsApp notifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filters.map((filter) => {
            return (
              <div
                key={filter.id}
                className="bg-[#0f0f0f] border border-white/5 rounded-lg p-6 group hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={getRuleIcon(filter.ruleType)} />
                    </svg>
                  </div>
                  <button
                    onClick={() => handleDelete(filter.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-white/5 text-slate-600 hover:text-white transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {filter.ruleType === "priority_min" ? "Min Priority" : filter.ruleType}
                </span>
                <p className="text-[17px] font-bold text-white mt-1 break-all">{filter.value}</p>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5">
                  <span className="text-[10px] text-slate-700 font-bold uppercase tracking-tight">
                    {new Date(filter.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
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
