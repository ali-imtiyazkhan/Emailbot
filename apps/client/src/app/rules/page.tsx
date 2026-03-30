"use client";

import { useState } from "react";

const rules = [
  { id: 1, name: "Board Email Alerts", description: "Emails from board members → instant WhatsApp notification", trigger: "From: board@company.com", action: "WhatsApp alert", active: true, triggered: 24 },
  { id: 2, name: "Finance Digest", description: "Payment and invoice emails → forward to finance team", trigger: "Subject contains: invoice, payment, receipt", action: "Forward to finance@company.com", active: true, triggered: 87 },
  { id: 3, name: "GitHub Security", description: "Security alerts from GitHub → high priority + WhatsApp", trigger: "From: github.com, Subject: security", action: "High priority + WhatsApp alert", active: true, triggered: 12 },
  { id: 4, name: "Newsletter Archive", description: "Auto-archive newsletters and digests", trigger: "List-Unsubscribe header present", action: "Archive + label: newsletter", active: true, triggered: 341 },
  { id: 5, name: "Client Escalation", description: "Emails with urgent keywords from clients", trigger: "Subject contains: urgent, ASAP, critical", action: "WhatsApp alert + forward to manager", active: false, triggered: 8 },
];

export default function RulesPage() {
  const [ruleList, setRuleList] = useState(rules);
  const [showNew, setShowNew] = useState(false);

  const toggleRule = (id: number) => {
    setRuleList((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="p-8 md:p-12 xl:p-16 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-14">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3 text-white leading-[1.05]">Rules</h1>
          <p className="text-slate-500 text-[16px] font-medium leading-relaxed">Automation rules that run silently in the background.</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="bg-white text-black px-5 py-2.5 rounded-lg font-bold text-[13px] hover:bg-slate-200 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Rule
        </button>
      </div>

      {/* New Rule Form */}
      {showNew && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-[14px] font-bold text-white mb-5">Create New Rule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Rule Name</label>
              <input type="text" placeholder="e.g. VIP Client Alerts" className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-all font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Action</label>
              <select className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5 text-[13px] text-slate-200 focus:outline-none focus:border-white/20 transition-all font-medium appearance-none">
                <option>WhatsApp Alert</option>
                <option>Forward Email</option>
                <option>Archive</option>
                <option>High Priority</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[10px] font-black uppercase text-slate-600 tracking-widest mb-2">Trigger Condition</label>
            <input type="text" placeholder="e.g. From: client@company.com, Subject contains: urgent" className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2.5 text-[13px] text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-all font-medium" />
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-[13px] hover:bg-slate-200 transition-all">Create Rule</button>
            <button onClick={() => setShowNew(false)} className="text-slate-500 hover:text-white px-4 py-2 rounded-lg font-bold text-[13px] border border-white/5 hover:border-white/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {ruleList.map((rule) => (
          <div key={rule.id} className={`bg-white/[0.02] border rounded-xl p-5 transition-all hover:border-white/10 ${rule.active ? "border-white/5" : "border-white/[0.02] opacity-60"}`}>
            <div className="flex items-start gap-4">
              {/* Toggle */}
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${rule.active ? "bg-white" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${rule.active ? "translate-x-5 bg-black" : "translate-x-0 bg-slate-500"}`} />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[14px] font-bold text-white">{rule.name}</span>
                  {rule.active && <span className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-white/[0.04] px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-[12px] text-slate-500 mb-3 font-medium">{rule.description}</p>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Trigger</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{rule.trigger}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Action</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{rule.action}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <div className="text-[22px] font-bold text-white tracking-tight">{rule.triggered}</div>
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">triggered</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
