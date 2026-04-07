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
  Link2, Unlink, WifiOff, CircleDot,
  Timer, CalendarClock, Sparkles
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
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
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 md:py-16 flex flex-col gap-10 md:gap-12">
        
        <PageHeader 
          badge="Preferences"
          title="System Settings"
          description="Manage your connected accounts, notification channels, and daily digest preferences."
        />

        <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* ── Left Column: Accounts & WhatsApp ──────── */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            
            {/* ── Connected Accounts ──────────────────── */}
            <motion.section variants={fadeUp}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[17px] font-bold text-white/80 tracking-tight flex items-center gap-2">
                    <Link2 size={16} className="text-white/20" />
                    Connected Accounts
                  </h2>
                  <p className="text-[12px] text-white/20 font-medium mt-1">Email providers linked to your agent</p>
                </div>
              </div>

              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <Card className="p-8 md:p-12 bg-white/[0.01]">
                    <div className="text-center mb-8">
                      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                        <WifiOff size={22} className="text-white/10" />
                      </div>
                      <p className="text-[15px] font-bold text-white/50 mb-1">No Connections</p>
                      <p className="text-[12px] text-white/20 max-w-xs mx-auto leading-relaxed">
                        Connect your email account to start AI-powered monitoring and alerting.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold text-[13px] transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                      >
                        <Mail size={15} /> Connect Gmail
                      </button>
                      <button
                        onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                        className="bg-white/[0.05] text-white border border-white/10 px-6 py-3 rounded-xl font-bold text-[13px] transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                      >
                        <Mail size={15} /> Connect Outlook
                      </button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {accounts.map((acc) => (
                      <Card key={acc.id} hoverable className="p-4 md:p-5 flex items-center gap-4 md:gap-5">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                          acc.provider === "gmail" 
                            ? "bg-red-500/5 border-red-500/10 text-red-400/60" 
                            : "bg-blue-500/5 border-blue-500/10 text-blue-400/60"
                        }`}>
                          <Mail size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-white/70 truncate">{acc.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-white/15 font-black uppercase tracking-[0.1em]">
                              {acc.provider}
                            </span>
                            {acc.lastSynced && (
                              <>
                                <span className="text-white/10 text-[8px]">·</span>
                                <span className="text-[10px] text-white/15 flex items-center gap-1">
                                  <Timer size={9} />
                                  Synced {new Date(acc.lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                    
                    {/* Add Account Buttons */}
                    <div className="flex flex-wrap gap-3 pt-3">
                      {!accounts.some(a => a.provider === "gmail") && (
                        <button
                          onClick={() => window.open(`${API_URL}/auth/gmail/connect`, "_blank")}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 text-[12px] font-bold text-white/30 hover:text-white/60 transition-all"
                        >
                          <Plus size={13} /> Add Gmail
                        </button>
                      )}
                      {!accounts.some(a => a.provider === "outlook") && (
                        <button
                          onClick={() => window.open(`${API_URL}/auth/outlook/connect`, "_blank")}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 text-[12px] font-bold text-white/30 hover:text-white/60 transition-all"
                        >
                          <Plus size={13} /> Add Outlook
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.section>

            {/* ── WhatsApp Integration ────────────────── */}
            <motion.section variants={fadeUp}>
              <div className="mb-6">
                <h2 className="text-[17px] font-bold text-white/80 tracking-tight flex items-center gap-2">
                  <MessageSquare size={16} className="text-white/20" />
                  WhatsApp Relay
                </h2>
                <p className="text-[12px] text-white/20 font-medium mt-1">Real-time notification channel for high-priority emails</p>
              </div>

              <Card className={`p-6 md:p-8 ${profile?.whatsapp ? "border-emerald-500/5 bg-emerald-500/[0.01]" : ""}`}>
                <div className="flex items-start gap-5 md:gap-6">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                    profile?.whatsapp 
                      ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-500/60"
                      : "bg-white/[0.03] border-white/5 text-white/20"
                  }`}>
                    <MessageSquare size={22} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      {profile?.whatsapp ? (
                        <Badge variant="success" dot className="bg-emerald-500/10 border-emerald-500/15 text-emerald-500/50">Connected</Badge>
                      ) : (
                        <Badge variant="default" dot>Not Configured</Badge>
                      )}
                    </div>
                    
                    {profile?.whatsapp ? (
                      <>
                        <div className="p-4 rounded-xl bg-[#050505] border border-white/5 inline-flex items-center gap-3 mb-4">
                          <span className="text-white/60 font-mono font-bold text-[17px] tracking-tight">{profile.whatsapp}</span>
                          <ShieldCheck size={16} className="text-emerald-500/40" />
                        </div>
                        <p className="text-[12px] text-white/15 leading-relaxed">
                          Priority emails are instantly forwarded as WhatsApp summaries. You can also reply directly to send email responses.
                        </p>
                      </>
                    ) : (
                      <p className="text-[13px] text-white/30 leading-relaxed">
                        Set your WhatsApp number in the database to enable real-time push notifications for urgent emails.
                      </p>
                    )}
                  </div>
                </div>

                {/* Features Grid */}
                {profile?.whatsapp && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
                    {[
                      { icon: Sparkles, label: "AI Summaries", desc: "Priority emails are auto-summarized" },
                      { icon: MessageSquare, label: "Reply via Chat", desc: "Respond to emails through WhatsApp" },
                      { icon: CalendarClock, label: "Daily Digest", desc: "Morning briefing of unread emails" },
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                        <feat.icon size={14} className="text-white/15 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] font-bold text-white/30">{feat.label}</p>
                          <p className="text-[10px] text-white/15 leading-relaxed">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.section>

            {/* ── Profile Info ────────────────────────── */}
            <motion.section variants={fadeUp}>
              <div className="mb-6">
                <h2 className="text-[17px] font-bold text-white/80 tracking-tight flex items-center gap-2">
                  <CircleDot size={16} className="text-white/20" />
                  Profile
                </h2>
              </div>
              <Card className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/5 flex items-center justify-center text-[16px] font-bold text-white/30">
                    {profile?.name?.[0] || profile?.email?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-white/70 truncate">{profile?.name || "Unknown"}</p>
                    <p className="text-[12px] text-white/25 truncate">{profile?.email}</p>
                  </div>
                  <Badge variant="info" className="shrink-0">User #{profile?.id}</Badge>
                </div>
              </Card>
            </motion.section>
          </div>

          {/* ── Right Column: Digest Settings ─────────── */}
          <motion.div variants={fadeUp} className="space-y-8 md:space-y-12">
            <section>
              <div className="mb-6">
                <h2 className="text-[17px] font-bold text-white/80 tracking-tight flex items-center gap-2">
                  <CalendarClock size={16} className="text-white/20" />
                  Daily Digest
                </h2>
                <p className="text-[12px] text-white/20 font-medium mt-1">Scheduled summary delivery</p>
              </div>

              {digest && (
                <Card className="p-6 md:p-8 space-y-8">
                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-bold text-white/60">Enabled</p>
                      <p className="text-[11px] text-white/20 font-medium mt-0.5">Automated 24h summary via WhatsApp</p>
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

                  <div className={`space-y-6 transition-opacity duration-300 ${digest.enabled ? "" : "opacity-30 pointer-events-none"}`}>
                    {/* Send Time */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/15 tracking-widest">
                        <Clock size={11} className="text-white/10" />
                        Delivery Time
                      </label>
                      <input
                        type="time"
                        value={digest.sendTime}
                        onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/10 transition-all font-bold"
                      />
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/15 tracking-widest">
                        <Globe size={11} className="text-white/10" />
                        Timezone
                      </label>
                      <select
                        value={digest.timezone}
                        onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-white/10 transition-all font-bold appearance-none"
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label} (UTC{tz.offset})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min Emails */}
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/15 tracking-widest">
                        <Mail size={11} className="text-white/10" />
                        Minimum Emails
                      </label>
                      <div className="flex items-center gap-3">
                        {[1, 3, 5, 10].map(num => (
                          <button
                            key={num}
                            onClick={() => setDigest({ ...digest, minEmails: num })}
                            className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all border ${
                              digest.minEmails === num 
                                ? "bg-white text-black border-white" 
                                : "bg-white/[0.02] text-white/25 border-white/5 hover:border-white/10"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/12 mt-1">
                        Digest only sends when at least this many new emails are queued.
                      </p>
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSaveDigest}
                    disabled={saving}
                    className="w-full bg-white text-black py-3.5 rounded-xl font-bold text-[14px] hover:bg-white/90 transition-all disabled:opacity-20 flex items-center justify-center gap-2.5"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                    ) : saved ? (
                      <><CheckCircle2 size={16} /> Saved</>
                    ) : (
                      "Apply Preferences"
                    )}
                  </button>

                  {/* Saved Notification */}
                  <AnimatePresence>
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <CheckCircle2 size={14} className="text-emerald-400/50" />
                        <p className="text-[12px] text-emerald-400/50 font-medium">Digest settings updated successfully.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Info */}
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-white/[0.01] border border-white/5">
                    <AlertCircle size={13} className="text-white/10 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/20 leading-relaxed font-medium">
                      Digests are sent via your WhatsApp relay and include AI summaries of all unread emails since the last digest.
                    </p>
                  </div>
                </Card>
              )}
            </section>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
