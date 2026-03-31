"use client";

import React, { useState, useEffect } from "react";
import { fetchFilters, createFilter, deleteFilter, FilterRule } from "@/lib/api";
import { Plus, Trash2, User, Hash, Zap, Settings2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

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
      case "sender": return <User size={14} />;
      case "keyword": return <Hash size={14} />;
      case "priority_min": return <Zap size={14} />;
      default: return <Settings2 size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col gap-10">
        
        <PageHeader 
          badge="Automation"
          title="Filter Rules"
          description="Configure how your emails are filtered, prioritized, and forwarded. Rules determine which communications require immediate attention."
          actions={
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] tracking-tight transition-all active:scale-95 ${
                showForm
                  ? "bg-white/5 text-white/40 border border-white/10"
                  : "bg-white text-black hover:bg-white/90"
              }`}
            >
              {showForm ? "Cancel" : <><Plus size={16} /> New Rule</>}
            </button>
          }
        />

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 border-white/10 bg-white/[0.02]">
                <h3 className="text-[15px] font-bold mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  Create Intelligence Rule
                </h3>
                <form onSubmit={handleCreate}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/20 tracking-widest mb-3">
                        Rule Type
                      </label>
                      <select
                        value={newRule.type}
                        onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/20 transition-all font-medium appearance-none"
                      >
                        <option value="sender">Sender Email</option>
                        <option value="keyword">Subject Keyword</option>
                        <option value="priority_min">Min Priority Score</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-white/20 tracking-widest mb-3">
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
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !newRule.value.trim()}
                    className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-[14px] hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing..." : "Deploy Rule"}
                  </button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules Grid */}
        <div>
          {loading ? (
            <div className="text-center py-32">
              <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/20 text-[13px] font-medium tracking-tight">Loading processing engine...</p>
            </div>
          ) : filters.length === 0 ? (
            <Card className="p-20 text-center bg-white/[0.01]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/5">
                <Settings2 className="w-6 h-6 text-white/10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-bold text-white/60 mb-2">Passive Mode Active</h3>
              <p className="text-white/20 text-[14px] font-medium max-w-sm mx-auto leading-relaxed">
                No custom filtering rules detected. Your agent will use default heuristics for all communications.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filters.map((filter) => (
                <Card key={filter.id} hoverable className="p-6 relative group">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                      {getRuleIcon(filter.ruleType)}
                    </div>
                    <button
                      onClick={() => handleDelete(filter.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/15">
                      {filter.ruleType === "priority_min" ? "Min Priority" : filter.ruleType}
                    </p>
                    <p className="text-[18px] font-bold text-white/80 break-all leading-tight">
                      {filter.value}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-white/[0.03]">
                    <span className="text-[10px] text-white/10 font-bold uppercase tracking-tight">
                      {new Date(filter.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="success" dot className="bg-emerald-500/5 border-emerald-500/5 text-emerald-500/40">
                      Active
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
