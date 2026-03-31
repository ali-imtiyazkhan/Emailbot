"use client";

import React, { useState, useEffect } from "react";
import {
  fetchAccounts,
  fetchDigestSettings,
  updateDigestSettings,
  fetchProfile,
  EmailAccount,
  DigestSetting,
  User,
} from "@/lib/api";
import { 
  Globe, 
  Clock, 
  MessageSquare, 
  Mail, 
  Plus, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [digest, setDigest] = useState<DigestSetting | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [acc, dig, prof] = await Promise.all([
        fetchAccounts(),
        fetchDigestSettings(),
        fetchProfile()
      ]);
      setAccounts(acc);
      setDigest(dig);
      setProfile(prof);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDigest = async () => {
    if (!digest) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateDigestSettings({
        enabled: digest.enabled,
        sendTime: digest.sendTime,
        timezone: digest.timezone,
        minEmails: digest.minEmails,
      });
      setDigest(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
          <p className="text-white/20 text-[13px] font-medium tracking-tight">Syncing preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col gap-12">
        
        <PageHeader 
          badge="Preferences"
          title="System Settings"
          description="Manage your connected accounts, automated digest preferences, and notification channels."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* ── Left Column: Accounts & WhatsApp ────────── */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Connected Accounts */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[17px] font-bold text-white/80 tracking-tight">Connected Accounts</h2>
                  <p className="text-[13px] text-white/20 font-medium mt-1">Providers linked to your intelligence engine</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open("http://localhost:3001/auth/gmail/connect", "_blank")} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-white/40 hover:text-white">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <Card className="p-12 text-center bg-white/[0.01]">
                    <p className="text-white/20 text-[14px] font-medium mb-8 uppercase tracking-widest">No active connections</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.open("http://localhost:3001/auth/gmail/connect", "_blank")}
                        className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all hover:bg-white/90"
                      >
                        Connect Gmail
                      </button>
                      <button
                        onClick={() => window.open("http://localhost:3001/auth/outlook/connect", "_blank")}
                        className="bg-white/[0.05] text-white border border-white/10 px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all hover:bg-white/10"
                      >
                        Connect Outlook
                      </button>
                    </div>
                  </Card>
                ) : (
                  accounts.map((acc) => (
                    <Card key={acc.id} hoverable className="p-5 flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center font-black text-[13px] text-white/40">
                        {acc.provider === "gmail" ? "G" : "O"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-white/70 truncate">{acc.email}</p>
                        <p className="text-[10px] text-white/15 font-black uppercase tracking-[0.1em] mt-1">
                          {acc.provider} • Joined {new Date(acc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={acc.isActive ? "success" : "default"} dot>
                        {acc.isActive ? "Active" : "Paused"}
                      </Badge>
                    </Card>
                  ))
                )}
              </div>
            </section>

            {/* WhatsApp Integration */}
            <section>
              <div className="mb-8">
                <h2 className="text-[17px] font-bold text-white/80 tracking-tight">Notification Channels</h2>
                <p className="text-[13px] text-white/20 font-medium mt-1">Direct relay for high-priority alerts</p>
              </div>

              <Card className="p-8 border-emerald-500/5 bg-emerald-500/[0.01]">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-500/60">
                    <MessageSquare size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="success" dot className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500/50">Verified</Badge>
                      <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">WhatsApp Relay</span>
                    </div>
                    <p className="text-[15px] text-white/50 font-medium mb-6">Real-time summaries are active for your device.</p>
                    <div className="p-5 rounded-2xl bg-[#050505] border border-white/5 inline-flex items-center gap-3">
                      <span className="text-white/60 font-mono font-bold text-[18px] tracking-tight">{profile?.whatsapp || "Not Configured"}</span>
                      <ShieldCheck size={16} className={profile?.whatsapp ? "text-emerald-500/40" : "text-white/10"} />
                    </div>
                    <p className="text-[11px] text-white/15 mt-8 leading-relaxed max-w-sm">
                      Urgent communications trigger instant Briefs. To update your verified relay, please contact your account manager.
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          </div>

          {/* ── Right Column: Digest Settings ───────────── */}
          <div className="space-y-12">
            <section>
              <div className="mb-8">
                <h2 className="text-[17px] font-bold text-white/80 tracking-tight">Intelligence Brief</h2>
                <p className="text-[13px] text-white/20 font-medium mt-1">Scheduled summary delivery</p>
              </div>

              {digest && (
                <Card className="p-8 space-y-10">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-white/60">Daily Digest</p>
                      <p className="text-[11px] text-white/20 font-medium mt-0.5">Automated 24h summary</p>
                    </div>
                    <button
                      onClick={() => setDigest({ ...digest, enabled: !digest.enabled })}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        digest.enabled ? "bg-white" : "bg-white/5 border border-white/5"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300 ${
                          digest.enabled ? "translate-x-6 bg-[#050505]" : "translate-x-0 bg-white/40"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/15 tracking-widest">
                        <Clock size={12} className="text-white/10" />
                        Delivery Window
                      </label>
                      <input
                        type="time"
                        value={digest.sendTime}
                        onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/10 transition-all font-bold"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/15 tracking-widest">
                        <Globe size={12} className="text-white/10" />
                        Intelligence Zone
                      </label>
                      <select
                        value={digest.timezone}
                        onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/10 transition-all font-bold appearance-none"
                      >
                        <option value="UTC">UTC (Universal)</option>
                        <option value="America/New_York">Eastern (US)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="Europe/London">GMT / London</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveDigest}
                    disabled={saving}
                    className="w-full bg-white text-black py-4 rounded-xl font-bold text-[14px] hover:bg-white/90 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                    ) : saved ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      "Apply Preferences"
                    )}
                  </button>

                  <div className="flex items-start gap-2 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <AlertCircle size={14} className="text-white/10 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/20 leading-relaxed font-medium">
                      Summaries are only sent if at least <span className="text-white/40 font-bold">{digest.minEmails} new emails</span> were processed since the last brief.
                    </p>
                  </div>
                </Card>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
