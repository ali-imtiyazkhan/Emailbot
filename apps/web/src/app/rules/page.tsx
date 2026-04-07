"use client";

import React, { useState, useEffect } from "react";
import { fetchFilters, createFilter, deleteFilter, FilterRule } from "@/lib/api";
import { Plus, Trash2, User, Hash, Zap, Settings2, Shield, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const RULE_META: Record<string, { icon: any; label: string; description: string; color: string; hint: string }> = {
  sender: {
    icon: User,
    label: "Sender Filter",
    description: "Match emails from a specific address",
    color: "text-blue-400/60 bg-blue-400/5 border-blue-400/10",
    hint: "e.g. ceo@company.com",
  },
  keyword: {
    icon: Hash,
    label: "Keyword Match",
    description: "Flag emails containing specific words in subject",
    color: "text-amber-400/60 bg-amber-400/5 border-amber-400/10",
    hint: "e.g. URGENT",
  },
  priority_min: {
    icon: Zap,
    label: "Priority Threshold",
    description: "Only notify above this AI-scored priority level (1-10)",
    color: "text-red-400/60 bg-red-400/5 border-red-400/10",
    hint: "e.g. 7",
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
    try {
      await deleteFilter(id);
      setDeleteConfirm(null);
      await loadRules();
    } catch {
      alert("Failed to delete rule");
    }
  };

  const selectedRuleMeta = RULE_META[newRule.type] || RULE_META.sender;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 md:py-16 flex flex-col gap-10 md:gap-12">
        
        <PageHeader 
          badge="Automation"
          title="Filter Rules"
          description="Define how your AI agent filters, prioritizes, and escalates emails. Rules shape your notification intelligence."
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

        {/* Rule Type Explainer*/}
        {!showForm && !loading && (
          <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(RULE_META).map(([type, meta]) => {
              const Icon = meta.icon;
              const count = filters.filter(f => f.ruleType === type).length;
              return (
                <motion.div key={type} variants={fadeUp}>
                  <Card className="p-5 md:p-6" hoverable>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.color}`}>
                        <Icon size={16} />
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] font-black text-white/15 uppercase tracking-widest">{count} active</span>
                      )}
                    </div>
                    <h3 className="text-[14px] font-bold text-white/60 mb-1">{meta.label}</h3>
                    <p className="text-[12px] text-white/20 leading-relaxed">{meta.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Create Rule Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 md:p-8 border-white/10 bg-white/[0.02] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white/80">Create Rule</h3>
                    <p className="text-[11px] text-white/20 mt-0.5">Define a new automation trigger for your agent</p>
                  </div>
                </div>

                <form onSubmit={handleCreate}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Rule Type Selector */}
                    <div>
                      <label className="block text-[10px] font-black uppercase text-white/20 tracking-widest mb-3">
                        Rule Type
                      </label>
                      <div className="flex flex-col gap-2">
                        {Object.entries(RULE_META).map(([type, meta]) => {
                          const Icon = meta.icon;
                          const isSelected = newRule.type === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewRule({ ...newRule, type })}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                isSelected 
                                  ? "bg-white/[0.05] border-white/15 text-white" 
                                  : "bg-white/[0.01] border-white/5 text-white/30 hover:border-white/10"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[11px] ${
                                isSelected ? meta.color : "border-white/5 text-white/15"
                              }`}>
                                <Icon size={13} />
                              </div>
                              <span className="text-[12px] font-bold">{meta.label}</span>
                              {isSelected && <ArrowRight size={11} className="ml-auto text-white/20" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Value Input */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-white/20 tracking-widest mb-3">
                          Value
                        </label>
                        <input
                          type="text"
                          placeholder={selectedRuleMeta.hint}
                          value={newRule.value}
                          onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                          className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5 text-[14px] text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all font-medium"
                          autoFocus
                        />
                        <p className="text-[11px] text-white/15 mt-3 leading-relaxed">
                          {selectedRuleMeta.description}. Your agent will apply this rule to all incoming emails in real time.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || !newRule.value.trim()}
                        className="mt-6 w-full bg-white text-black py-3.5 rounded-xl font-bold text-[14px] hover:bg-white/90 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            <Shield size={15} />
                            Deploy Rule
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rules List */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-white/5 mb-6" />
                  <div className="h-3 bg-white/5 rounded-full w-1/3 mb-3" />
                  <div className="h-5 bg-white/5 rounded-full w-2/3" />
                </Card>
              ))}
            </div>
          ) : filters.length === 0 ? (
            <Card className="p-14 md:p-20 text-center bg-white/[0.01]">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-white/5">
                <Settings2 className="w-6 h-6 text-white/10" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-bold text-white/60 mb-2">No Custom Rules</h3>
              <p className="text-white/20 text-[14px] font-medium max-w-sm mx-auto leading-relaxed mb-8">
                Your agent uses default priority scoring (threshold: 5). Create rules to customize filtering behavior.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all hover:bg-white/90 inline-flex items-center gap-2"
              >
                <Plus size={15} /> Create First Rule
              </button>
            </Card>
          ) : (
            <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filters.map((filter) => {
                const meta = RULE_META[filter.ruleType] || RULE_META.sender;
                const Icon = meta.icon;
                const isDeleting = deleteConfirm === filter.id;
                
                return (
                  <motion.div key={filter.id} variants={fadeUp}>
                    <Card hoverable className="p-5 md:p-6 relative group">
                      {/* Delete Confirm Overlay */}
                      <AnimatePresence>
                        {isDeleting && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 bg-[#0a0a0a]/95 rounded-xl border border-red-500/10 flex flex-col items-center justify-center gap-4 p-6"
                          >
                            <AlertTriangle size={20} className="text-red-400/60" />
                            <p className="text-[13px] text-white/50 font-medium text-center">Remove this rule?</p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDelete(filter.id)}
                                className="px-5 py-2 rounded-lg bg-red-500/10 text-red-400 text-[12px] font-bold hover:bg-red-500/20 transition-all"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-5 py-2 rounded-lg bg-white/5 text-white/40 text-[12px] font-bold hover:bg-white/10 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${meta.color}`}>
                          <Icon size={16} />
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(filter.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-white/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-1 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/15">
                          {meta.label}
                        </p>
                        <p className="text-[17px] font-bold text-white/80 break-all leading-tight">
                          {filter.value}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                        <span className="text-[10px] text-white/10 font-medium">
                          Created {new Date(filter.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <Badge variant="success" dot className="bg-emerald-500/5 border-emerald-500/5 text-emerald-500/40">
                          Active
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
