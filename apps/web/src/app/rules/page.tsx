"use client";

import React, { useState, useEffect } from "react";
import { fetchFilters, createFilter, deleteFilter, FilterRule } from "@/lib/api";
import { Plus, Trash2, User, Hash, Zap, Settings2, Shield, AlertTriangle, Sparkles, ArrowRight, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
} as const;

const RULE_META: Record<string, { icon: any; label: string; description: string; color: string; hint: string }> = {
  sender: {
    icon: User,
    label: "Sender Filter",
    description: "Intercept communications from specific addresses",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    hint: "e.g. executive@company.com",
  },
  keyword: {
    icon: Hash,
    label: "Keyword Match",
    description: "Scan title payloads for high-priority markers",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    hint: "e.g. INCIDENT-CRITICAL",
  },
  priority_min: {
    icon: Zap,
    label: "Priority Threshold",
    description: "Isolate notifications below an AI scoring index (1-10)",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    hint: "e.g. 8",
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-white/20 selection:text-white">
      {/* Dynamic Background Atmosphere Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1340px] mx-auto px-6 lg:px-8 py-12 flex flex-col gap-8 relative z-10">
        
        {/* Header Block */}
        <PageHeader 
          badge="Automation Matrix"
          title="Filter Rules"
          description="Configure programmatic triggers to train and guide your active AI routing protocols."
          actions={
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] tracking-tight transition-all duration-200 active:scale-98 shadow-sm ${
                showForm
                  ? "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  : "bg-neutral-50 text-neutral-950 hover:bg-neutral-200 shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
              }`}
            >
              {showForm ? <><X size={14} /> Close Interface</> : <><Plus size={15} /> Add Rule</>}
            </button>
          }
        />

        {/* Rule Type Explainer Cards */}
        {!showForm && !loading && (
          <motion.div initial="hidden" animate="show" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Object.entries(RULE_META).map(([type, meta]) => {
              const Icon = meta.icon;
              const count = filters.filter(f => f.ruleType === type).length;
              return (
                <motion.div key={type} variants={itemVariants}>
                  <Card className="p-6 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md transition-all duration-300 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.color}`}>
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-900/60 px-2.5 py-1 rounded-md border border-neutral-800/80 shadow-inner">
                          {count} Deployed
                        </span>
                      )}
                    </div>
                    <h3 className="text-[14px] font-semibold text-neutral-200 mb-1">{meta.label}</h3>
                    <p className="text-[12px] text-neutral-500 leading-relaxed font-normal">{meta.description}</p>
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
              initial={{ opacity: 0, y: -16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <Card className="p-6 md:p-8 bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl relative overflow-hidden rounded-2xl shadow-xl">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-700/40 to-transparent" />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="w-8 h-8 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-inner">
                    <Sparkles size={14} className="text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-neutral-200">Rule Constructor</h3>
                    <p className="text-[12px] text-neutral-500 font-normal">Define and build custom automation criteria blocks</p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Rule Type Selector */}
                    <div className="flex flex-col gap-3">
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                        Select Paradigm
                      </label>
                      <div className="flex flex-col gap-1.5">
                        {Object.entries(RULE_META).map(([type, meta]) => {
                          const Icon = meta.icon;
                          const isSelected = newRule.type === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setNewRule({ ...newRule, type })}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                                isSelected 
                                  ? "bg-neutral-900 border-neutral-700 text-white shadow-sm" 
                                  : "bg-transparent border-transparent text-neutral-500 hover:bg-neutral-900/30 hover:text-neutral-300"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-[11px] transition-all duration-200 ${
                                isSelected ? meta.color : "border-neutral-800 text-neutral-500 bg-neutral-950"
                              }`}>
                                <Icon size={14} strokeWidth={2} />
                              </div>
                              <span className="text-[12.5px] font-medium">{meta.label}</span>
                              {isSelected && <ArrowRight size={13} className="ml-auto text-neutral-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Value Input */}
                    <div className="md:col-span-2 flex flex-col justify-between">
                      <div className="flex flex-col gap-3">
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 tracking-wider">
                          Value String / Limit
                        </label>
                        <input
                          type="text"
                          placeholder={selectedRuleMeta.hint}
                          value={newRule.value}
                          onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3.5 text-[14px] text-neutral-100 placeholder:text-neutral-700 focus:outline-none transition-all font-medium shadow-inner"
                          autoFocus
                        />
                        <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed font-normal">
                          {selectedRuleMeta.description}. Verified statements are propagated across ingestion processes immediately.
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={submitting || !newRule.value.trim()}
                        className="mt-6 w-full py-3.5 rounded-xl bg-neutral-50 hover:bg-neutral-200 text-neutral-950 font-semibold text-[13px] disabled:opacity-10 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all duration-200"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-neutral-950/20 border-t-neutral-950 rounded-full animate-spin" />
                        ) : (
                          <>
                            <Shield size={14} />
                            Deploy Rule Pattern
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

        {/* Rules List Grid Framework */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-6 rounded-2xl bg-neutral-900/20 border border-neutral-800/40 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 mb-6" />
                  <div className="h-3 bg-neutral-800 rounded-md w-1/3 mb-3" />
                  <div className="h-5 bg-neutral-800 rounded-md w-2/3" />
                </Card>
              ))}
            </div>
          ) : filters.length === 0 ? (
            <Card className="p-16 md:p-24 text-center bg-transparent border-dashed border-neutral-800 rounded-2xl">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-center shadow-inner">
                <Settings2 className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-semibold text-neutral-300 mb-2">No Rules Active</h3>
              <p className="text-neutral-500 text-[13.5px] max-w-sm mx-auto leading-relaxed mb-6">
                Your engine is relying exclusively on foundational priority scores. Inject conditions to configure standard operating guidelines.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors text-[13px] font-semibold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> Instantiate Rule Set
              </button>
            </Card>
          ) : (
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filters.map((filter) => {
                const meta = RULE_META[filter.ruleType] || RULE_META.sender;
                const Icon = meta.icon;
                const isDeleting = deleteConfirm === filter.id;
                
                return (
                  <motion.div key={filter.id} variants={itemVariants}>
                    <Card className="p-6 rounded-2xl bg-neutral-900/20 border border-neutral-800/50 backdrop-blur-sm relative group overflow-hidden hover:border-neutral-700/60 hover:bg-neutral-900/30 transition-all duration-300 shadow-sm">
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-white/[0.01] to-transparent rounded-full blur-xl pointer-events-none" />
                      
                      {/* Intermediary Delete Trigger Shield Confirmation */}
                      <AnimatePresence>
                        {isDeleting && (
                          <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 z-20 bg-neutral-950/95 flex flex-col items-center justify-center gap-3.5 p-6 border border-rose-500/10 rounded-2xl"
                          >
                            <AlertTriangle size={18} className="text-rose-400" />
                            <p className="text-[13px] text-neutral-300 font-medium text-center">Decommission this filtering sequence?</p>
                            <div className="flex gap-2 w-full max-w-[200px]">
                              <button
                                onClick={() => handleDelete(filter.id)}
                                className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-[12px] font-semibold hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2 rounded-lg bg-neutral-900 text-neutral-400 text-[12px] font-semibold hover:bg-neutral-800 border border-neutral-800 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.color}`}>
                          <Icon size={15} strokeWidth={2} />
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(filter.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 text-neutral-500 hover:text-rose-400 hover:border-rose-500/20 transition-all duration-200"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="space-y-1 mb-5 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                          {meta.label}
                        </p>
                        <p className="text-[16px] font-medium text-neutral-200 break-all leading-tight tracking-tight">
                          {filter.value}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-900 relative z-10">
                        <span className="text-[11px] text-neutral-500 font-normal">
                          Added {new Date(filter.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <Badge variant="default" className="bg-neutral-950 border border-neutral-800 text-neutral-400 text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0">
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