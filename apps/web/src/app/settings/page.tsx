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
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-[860px] mx-auto px-6 md:px-8 py-8 md:py-10 flex flex-col gap-8">
        
        <PageHeader 
          title="Settings"
          description="Manage your accounts, notifications, and preferences."
        />

        <motion.div initial="hidden" animate="show" variants={stagger} className="flex flex-col gap-6">

          {/* ── 1. Profile ────────────────────────────────── */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/8 flex items-center justify-center text-[15px] font-semibold text-white/40">
                  {profile?.name?.[0] || profile?.email?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white/80 truncate">{profile?.name || "Unknown"}</p>
                  <p className="text-[12px] text-white/30 truncate">{profile?.email}</p>
                </div>
                <Badge variant="default" className="shrink-0 text-[9px]">ID {profile?.id}</Badge>
              </div>
            </Card>
          </motion.div>

          {/* ── 2. Connected Accounts ─────────────────────── */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-white/50 tracking-tight flex items-center gap-2">
                <Link2 size={14} className="text-white/25" />
                Connected Accounts
              </h2>
              <div className="flex gap-2">
                {!accounts.some(a => a.provider === "gmail") && (
                  <button
                    onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 text-[11px] font-semibold text-white/30 hover:text-white/60 transition-all"
                  >
                    <Plus size={11} /> Gmail
                  </button>
                )}
                {!accounts.some(a => a.provider === "outlook") && (
                  <button
                    onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 text-[11px] font-semibold text-white/30 hover:text-white/60 transition-all"
                  >
                    <Plus size={11} /> Outlook
                  </button>
                )}
              </div>
            </div>

            {accounts.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <WifiOff size={18} className="text-white/10" />
                </div>
                <p className="text-[14px] font-semibold text-white/50 mb-1">No Accounts Connected</p>
                <p className="text-[12px] text-white/20 max-w-xs mx-auto leading-relaxed mb-6">
                  Connect your email to start AI-powered monitoring.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                    className="bg-white text-black px-5 py-2.5 rounded-lg font-semibold text-[12px] transition-all hover:bg-white/90 flex items-center gap-2"
                  >
                    <Mail size={14} /> Connect Gmail
                  </button>
                  <button
                    onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                    className="bg-white/[0.05] text-white border border-white/10 px-5 py-2.5 rounded-lg font-semibold text-[12px] transition-all hover:bg-white/10 flex items-center gap-2"
                  >
                    <Mail size={14} /> Connect Outlook
                  </button>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <Card key={acc.id} hoverable className="p-4 flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                      acc.provider === "gmail" 
                        ? "bg-red-500/5 border-red-500/10 text-red-400/60" 
                        : "bg-blue-500/5 border-blue-500/10 text-blue-400/60"
                    }`}>
                      <Mail size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/70 truncate">{acc.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/20 font-semibold uppercase tracking-wide">
                          {acc.provider}
                        </span>
                        {acc.lastSynced && (
                          <>
                            <span className="text-white/10 text-[6px]">●</span>
                            <span className="text-[10px] text-white/20 flex items-center gap-1">
                              <Timer size={9} />
                              {new Date(acc.lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={acc.isActive ? "success" : "default"} dot>
                      {acc.isActive ? "Active" : "Paused"}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── 3. WhatsApp Relay ─────────────────────────── */}
          <motion.div variants={fadeUp}>
            <div className="mb-3">
              <h2 className="text-[13px] font-semibold text-white/50 tracking-tight flex items-center gap-2">
                <MessageSquare size={14} className="text-white/25" />
                WhatsApp Notifications
              </h2>
            </div>

            <Card className={`p-5 ${profile?.whatsapp ? "border-emerald-500/8" : ""}`}>
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                  profile?.whatsapp 
                    ? "bg-emerald-500/8 border-emerald-500/12 text-emerald-500/60"
                    : "bg-white/[0.03] border-white/5 text-white/20"
                }`}>
                  <MessageSquare size={16} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  {profile?.whatsapp ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] text-white/70 font-mono font-semibold tracking-tight">{profile.whatsapp}</span>
                        <ShieldCheck size={14} className="text-emerald-500/40" />
                      </div>
                      <p className="text-[11px] text-white/20 mt-0.5">
                        Urgent emails forwarded as AI summaries. Reply directly to respond.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[13px] font-semibold text-white/50">Not Configured</p>
                      <p className="text-[11px] text-white/20 mt-0.5">
                        Set your WhatsApp number in the database to enable push notifications.
                      </p>
                    </>
                  )}
                </div>
                <Badge variant={profile?.whatsapp ? "success" : "default"} dot>
                  {profile?.whatsapp ? "Connected" : "Inactive"}
                </Badge>
              </div>

              {profile?.whatsapp && (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
                  {[
                    { icon: Sparkles, label: "AI Summaries" },
                    { icon: MessageSquare, label: "Reply via Chat" },
                    { icon: CalendarClock, label: "Daily Digest" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                      <feat.icon size={12} className="text-white/15 shrink-0" />
                      <span className="text-[10px] font-semibold text-white/25">{feat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── 4. Daily Digest ───────────────────────────── */}
          {digest && (
            <motion.div variants={fadeUp}>
              <div className="mb-3">
                <h2 className="text-[13px] font-semibold text-white/50 tracking-tight flex items-center gap-2">
                  <CalendarClock size={14} className="text-white/25" />
                  Daily Digest
                </h2>
              </div>

              <Card className="p-5">
                {/* Enable Toggle Row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[13px] font-semibold text-white/60">Send Daily Summary</p>
                    <p className="text-[11px] text-white/20 mt-0.5">Automated 24-hour email recap via WhatsApp</p>
                  </div>
                  <button
                    onClick={() => setDigest({ ...digest, enabled: !digest.enabled })}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${
                      digest.enabled ? "bg-white" : "bg-white/5 border border-white/8"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-300 ${
                        digest.enabled ? "translate-x-5 bg-[#050505]" : "translate-x-0 bg-white/40"
                      }`}
                    />
                  </button>
                </div>

                <div className={`transition-opacity duration-300 ${digest.enabled ? "" : "opacity-25 pointer-events-none"}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Send Time */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white/20 tracking-wider">
                        <Clock size={10} className="text-white/15" />
                        Time
                      </label>
                      <input
                        type="time"
                        value={digest.sendTime}
                        onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all font-semibold"
                      />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white/20 tracking-wider">
                        <Globe size={10} className="text-white/15" />
                        Timezone
                      </label>
                      <select
                        value={digest.timezone}
                        onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-white/10 transition-all font-semibold appearance-none"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label} (UTC{tz.offset})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Emails */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white/20 tracking-wider">
                        <Mail size={10} className="text-white/15" />
                        Min. Emails
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 3, 5, 10].map(num => (
                          <button
                            key={num}
                            onClick={() => setDigest({ ...digest, minEmails: num })}
                            className={`flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all border ${
                              digest.minEmails === num 
                                ? "bg-white text-black border-white" 
                                : "bg-white/[0.02] text-white/25 border-white/5 hover:border-white/10"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save Row */}
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/5">
                    <button
                      onClick={handleSaveDigest}
                      disabled={saving}
                      className="bg-white text-black px-6 py-2.5 rounded-lg font-semibold text-[12px] hover:bg-white/90 transition-all disabled:opacity-20 flex items-center gap-2"
                    >
                      {saving ? (
                        <div className="w-3.5 h-3.5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                      ) : saved ? (
                        <><CheckCircle2 size={14} /> Saved</>
                      ) : (
                        "Save Changes"
                      )}
                    </button>

                    <AnimatePresence>
                      {saved && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-[11px] text-emerald-400/50 font-medium flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} /> Settings updated
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <p className="text-[10px] text-white/15 ml-auto hidden md:block">
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
