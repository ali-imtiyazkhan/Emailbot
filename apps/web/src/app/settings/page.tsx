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
  Globe, Clock, MessageSquare, Mail, Plus,
  ShieldCheck, CheckCircle2, AlertCircle,
  Link2, WifiOff, CircleDot,
  Timer, CalendarClock, Sparkles, ChevronRight,
  User as UserIcon
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TIMEZONES = [
  { value: "UTC", label: "UTC (Universal)", offset: "+0:00" },
  { value: "America/New_York", label: "Eastern", offset: "-5:00" },
  { value: "America/Chicago", label: "Central", offset: "-6:00" },
  { value: "America/Denver", label: "Mountain", offset: "-7:00" },
  { value: "America/Los_Angeles", label: "Pacific", offset: "-8:00" },
  { value: "Europe/London", label: "London", offset: "+0:00" },
  { value: "Europe/Berlin", label: "Berlin", offset: "+1:00" },
  { value: "Europe/Paris", label: "Paris", offset: "+1:00" },
  { value: "Asia/Dubai", label: "Dubai", offset: "+4:00" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "+5:30" },
  { value: "Asia/Singapore", label: "Singapore", offset: "+8:00" },
  { value: "Asia/Tokyo", label: "Tokyo", offset: "+9:00" },
  { value: "Australia/Sydney", label: "Sydney", offset: "+11:00" },
];

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
          <p className="text-white/20 text-[13px] font-medium tracking-tight">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative z-10">
      <div className="max-w-[860px] mx-auto px-6 md:px-8 py-8 md:py-10 flex flex-col gap-8">
        
        <PageHeader 
          title="Settings"
          description="Manage your accounts, notifications, and preferences."
        />

        <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col gap-10">

          {/* ── 1. Profile ────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 shadow-inner flex items-center justify-center text-[18px] font-bold text-[#e8e8e8]">
                  {profile?.name?.[0] || profile?.email?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-[#e8e8e8] truncate mb-0.5">{profile?.name || "Unknown"}</p>
                  <p className="text-[13px] font-medium text-[#888] truncate">{profile?.email}</p>
                </div>
                <Badge variant="default" className="shrink-0 text-[10px] font-bold tracking-wider bg-[#111] border-[#2a2a2a] text-[#666]">
                  ID {profile?.id}
                </Badge>
              </div>
            </Card>
          </motion.div>

          {/* ── 2. Connected Accounts ─────────────────────── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-bold text-[#e8e8e8] tracking-tight flex items-center gap-2">
                <Link2 size={16} className="text-[#888]" />
                Connected Accounts
              </h2>
              <div className="flex gap-2">
                {!accounts.some(a => a.provider === "gmail") && (
                  <button
                    onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[#2a2a2a] hover:border-[#444] text-[11px] font-bold text-[#b0b0b0] hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={11} /> Gmail
                  </button>
                )}
                {!accounts.some(a => a.provider === "outlook") && (
                  <button
                    onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[#2a2a2a] hover:border-[#444] text-[11px] font-bold text-[#b0b0b0] hover:text-white transition-all shadow-sm"
                  >
                    <Plus size={11} /> Outlook
                  </button>
                )}
              </div>
            </div>

            {accounts.length === 0 ? (
              <Card className="p-10 text-center bg-transparent border-dashed border-[#2a2a2a]">
                <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shadow-inner">
                  <WifiOff size={20} className="text-[#666]" />
                </div>
                <p className="text-[16px] font-bold text-[#e8e8e8] mb-2">No Accounts Connected</p>
                <p className="text-[13px] text-[#888] font-medium max-w-xs mx-auto leading-relaxed mb-8">
                  Connect your email to start AI-powered monitoring.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                    className="btn btn-primary px-6 py-2.5 rounded-xl font-bold text-[13px] inline-flex items-center gap-2 shadow-lg"
                  >
                    <Mail size={15} /> Connect Gmail
                  </button>
                  <button
                    onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                    className="bg-[#141414] text-[#d4d4d4] border border-[#333] px-6 py-2.5 rounded-xl font-bold text-[13px] transition-all hover:bg-[#1a1a1a] hover:text-white inline-flex items-center gap-2 shadow-sm"
                  >
                    <Mail size={15} /> Connect Outlook
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <Card key={acc.id} hoverable className="p-5 flex items-center gap-5 group">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${
                      acc.provider === "gmail" 
                        ? "bg-red-500/5 border-red-500/10 text-red-400" 
                        : "bg-blue-500/5 border-blue-500/10 text-blue-400"
                    }`}>
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-bold text-[#e8e8e8] truncate group-hover:text-white transition-colors">{acc.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#888] font-black uppercase tracking-widest">
                          {acc.provider}
                        </span>
                        {acc.lastSynced && (
                          <>
                            <span className="text-[#444] text-[6px]">●</span>
                            <span className="text-[10.5px] font-medium text-[#888] flex items-center gap-1.5">
                              <Timer size={11} className="text-[#666]" />
                              {new Date(acc.lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={acc.isActive ? "success" : "default"} dot className={acc.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-[#111] border-[#2a2a2a] text-[#888]"}>
                      {acc.isActive ? "Active" : "Paused"}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="mb-4">
              <h2 className="text-[14px] font-bold text-[#e8e8e8] tracking-tight flex items-center gap-2">
                <MessageSquare size={16} className="text-[#888]" />
                WhatsApp Notifications
              </h2>
            </div>

            <Card className={`p-6 md:p-8 relative overflow-hidden ${profile?.whatsapp ? "border-emerald-500/20 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)]" : "shadow-lg"}`}>
              {profile?.whatsapp && <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />}
              <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${
                  profile?.whatsapp 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-[#141414] border-[#2a2a2a] text-[#666]"
                }`}>
                  <MessageSquare size={20} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  {profile?.whatsapp ? (
                    <>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[17px] text-[#e8e8e8] font-mono font-bold tracking-tight">{profile.whatsapp}</span>
                        <ShieldCheck size={16} className="text-emerald-400" />
                      </div>
                      <p className="text-[12.5px] font-medium text-[#c0c0c0] leading-relaxed max-w-sm">
                        Urgent emails forwarded as AI summaries. Reply directly to respond.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-bold text-[#e8e8e8] mb-1">Not Configured</p>
                      <p className="text-[12.5px] font-medium text-[#888] leading-relaxed max-w-sm">
                        Set your WhatsApp number in the database to enable push notifications.
                      </p>
                    </>
                  )}
                </div>
                <Badge variant={profile?.whatsapp ? "success" : "default"} dot className={`shrink-0 self-start md:self-auto ${profile?.whatsapp ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-[#111] border-[#2a2a2a] text-[#888]"}`}>
                  {profile?.whatsapp ? "Connected" : "Inactive"}
                </Badge>
              </div>

              {profile?.whatsapp && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-[#2a2a2a] relative z-10">
                  {[
                    { icon: Sparkles, label: "AI Summaries" },
                    { icon: MessageSquare, label: "Reply via Chat" },
                    { icon: CalendarClock, label: "Daily Digest" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111] border border-[#1a1a1a] shadow-inner">
                      <feat.icon size={14} className="text-emerald-400/70 shrink-0" />
                      <span className="text-[11.5px] font-bold text-[#b0b0b0]">{feat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── 4. Daily Digest ───────────────────────────── */}
          {digest && (
            <motion.div variants={fadeUp}>
              <div className="mb-4">
                <h2 className="text-[14px] font-bold text-[#e8e8e8] tracking-tight flex items-center gap-2">
                  <CalendarClock size={16} className="text-[#888]" />
                  Daily Digest
                </h2>
              </div>

              <Card className="p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                {/* Enable Toggle Row */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#2a2a2a]">
                  <div>
                    <p className="text-[15px] font-bold text-[#e8e8e8] mb-1">Send Daily Summary</p>
                    <p className="text-[12.5px] font-medium text-[#888]">Automated 24-hour email recap via WhatsApp</p>
                  </div>
                  <button
                    onClick={() => setDigest({ ...digest, enabled: !digest.enabled })}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 shadow-inner ${
                      digest.enabled ? "bg-white" : "bg-[#1a1a1a] border border-[#333]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${
                        digest.enabled ? "translate-x-6 bg-[#000]" : "translate-x-0 bg-[#666]"
                      }`}
                    />
                  </button>
                </div>

                <div className={`transition-opacity duration-300 ${digest.enabled ? "" : "opacity-30 pointer-events-none"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Send Time */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10.5px] font-black uppercase text-[#888] tracking-widest">
                        <Clock size={12} className="text-[#666]" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={digest.sendTime}
                        onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                        className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-[14px] text-[#e8e8e8] focus:outline-none focus:border-[#555] transition-all font-bold shadow-inner"
                      />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10.5px] font-black uppercase text-[#888] tracking-widest">
                        <Globe size={12} className="text-[#666]" />
                        Timezone
                      </label>
                      <div className="relative">
                        <select
                          value={digest.timezone}
                          onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl pl-4 pr-10 py-3.5 text-[13.5px] text-[#e8e8e8] focus:outline-none focus:border-[#555] transition-all font-semibold appearance-none shadow-inner"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz.value} value={tz.value} className="bg-[#111] text-white">
                              {tz.label} (UTC{tz.offset})
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] rotate-90 pointer-events-none" />
                      </div>
                    </div>

                    {/* Min Emails */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10.5px] font-black uppercase text-[#888] tracking-widest">
                        <Mail size={12} className="text-[#666]" />
                        Min. Emails
                      </label>
                      <div className="flex items-center gap-1.5 h-[48px]">
                        {[1, 3, 5, 10].map(num => (
                          <button
                            key={num}
                            onClick={() => setDigest({ ...digest, minEmails: num })}
                            className={`flex-1 h-full rounded-xl text-[13px] font-bold transition-all border ${
                              digest.minEmails === num 
                                ? "bg-white text-black border-white shadow-md" 
                                : "bg-[#111] text-[#888] border-[#2a2a2a] hover:border-[#444] hover:text-white"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-[#2a2a2a]">
                    <motion.button
                      layout
                      onClick={handleSaveDigest}
                      disabled={saving}
                      className="btn btn-primary px-8 py-3 rounded-xl font-bold text-[13.5px] disabled:opacity-20 flex items-center justify-center gap-2 shadow-lg min-w-[140px]"
                    >
                      <AnimatePresence mode="popLayout">
                        {saving ? (
                          <motion.div 
                            key="saving"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" 
                          />
                        ) : saved ? (
                          <motion.div
                            key="saved"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Saved
                          </motion.div>
                        ) : (
                          <motion.span
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            Save Changes
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <AnimatePresence>
                      {saved && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[12.5px] text-emerald-400 font-bold flex items-center gap-2"
                        >
                          <CheckCircle2 size={14} /> Settings updated
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <p className="text-[11.5px] font-medium text-[#666] ml-auto hidden md:block">
                      Digests include AI summaries of all unread emails.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
