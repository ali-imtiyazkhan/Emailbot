"use client";

import React, { useState, useEffect } from 'react';
import { fetchStats, fetchFilters, createFilter, deleteFilter, Stats, FilterRule } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({ type: 'sender', value: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, f] = await Promise.all([fetchStats(), fetchFilters()]);
      setStats(s);
      setFilters(f);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.value) return;
    try {
      await createFilter(newRule.type, newRule.value);
      setNewRule({ type: 'sender', value: '' });
      setIsAdding(false);
      loadData();
    } catch (err) {
      alert('Failed to add rule');
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      await deleteFilter(id);
      loadData();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <header className="glass rounded-3xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20">
            E
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              EmailBot
            </h1>
            <p className="text-slate-400 text-sm font-medium">Intelligent Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            System Live
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { label: 'Emails Processed', value: stats?.totalProcessed ?? '--', color: 'text-indigo-400', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { label: 'Active Rules', value: filters.length, color: 'text-purple-400', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
          { label: 'Alerts Sent', value: '12', color: 'text-pink-400', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-3xl hover:bg-white/5 transition-all duration-300 group cursor-default">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <svg className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div className={`text-5xl font-black tracking-tight ${stat.color} mb-1`}>
              {loading ? <span className="animate-pulse">...</span> : stat.value}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Real-time update available</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Forwarding Rules */}
        <div className="lg:col-span-2 glass p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full -mr-20 -mt-20" />
          
          <div className="flex justify-between items-center mb-10 relative">
            <div>
              <h2 className="text-2xl font-black mb-1">Processing Rules</h2>
              <p className="text-slate-400 text-sm">Define how your emails are analyzed and summarized.</p>
            </div>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
            >
              {isAdding ? 'Cancel' : '+ New Rule'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddRule} className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Rule Type</label>
                  <select 
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-indigo-500/50"
                  >
                    <option value="sender">Sender Email</option>
                    <option value="keyword">Subject Keyword</option>
                    <option value="priority_min">Min Priority Score</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Pattern / Value</label>
                  <input 
                    type="text"
                    placeholder="e.g. boss@company.com"
                    value={newRule.value}
                    onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-indigo-500/50"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-slate-950 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                Apply Rule
              </button>
            </form>
          )}

          <div className="overflow-x-auto relative">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest text-center w-24">Type</th>
                  <th className="pb-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest pl-4">Pattern</th>
                  <th className="pb-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filters.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-slate-500 text-sm italic">
                      No active rules found. Click "New Rule" to get started.
                    </td>
                  </tr>
                ) : (
                  filters.map((filter) => (
                    <tr key={filter.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 text-center">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-indigo-500/20">
                          {filter.ruleType}
                        </span>
                      </td>
                      <td className="py-6 pl-4">
                        <span className="font-semibold text-slate-200">{filter.value}</span>
                      </td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => handleDeleteRule(filter.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-pink-500 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-1 ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="glass p-10 rounded-3xl border-t border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </div>
              <h3 className="text-lg font-black">Email Services</h3>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => window.open('http://localhost:3001/auth/gmail/callback', '_blank')}
                className="w-full bg-[#4285F4] hover:bg-[#3367d6] py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#4285F4]/10 transition-all flex items-center justify-center gap-3"
              >
                Sync Gmail
              </button>
              <button 
                onClick={() => window.open('http://localhost:3001/auth/outlook/callback', '_blank')}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#0078D4]/10 transition-all flex items-center justify-center gap-3"
              >
                Sync Outlook
              </button>
            </div>
          </div>

          <div className="glass p-10 rounded-3xl border-l-4 border-emerald-500/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-black italic">WhatsApp Integration</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              AI-generated digests are forwarded daily at <span className="text-white font-bold">08:00 UTC</span> to:
            </p>
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
              <span className="block text-emerald-400 font-mono font-bold text-lg text-center">+1 234 567 8900</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
