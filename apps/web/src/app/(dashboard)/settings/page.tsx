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
import { getToken, fetchToken } from "@/lib/auth";
import {
  Globe,
  Clock,
  MessageSquare,
  Mail,
  Plus,
  Link2,
  WifiOff,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppPage } from "@/components/app/AppPage";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TIMEZONES = [
  { value: "UTC", label: "UTC", offset: "+0:00" },
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
    if (!getToken()) {
      fetchToken();
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [acc, dig, prof] = await Promise.all([
        fetchAccounts(),
        fetchDigestSettings(),
        fetchProfile(),
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
      <div className="app-page" style={{ justifyContent: "center", minHeight: "60vh" }}>
        <div className="app-status">
          <span className="app-status-dot app-status-dot--idle" />
          Loading settings…
        </div>
      </div>
    );
  }

  const initial = profile?.name?.[0] || profile?.email?.[0] || "?";

  return (
    <AppPage>
      <PageHeader
        title="Settings"
        description="Accounts, WhatsApp delivery, and your morning digest."
      />

      {/* Profile */}
      <div className="app-settings-block">
        <div className="app-row" style={{ cursor: "default", paddingTop: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-1)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>
              {profile?.name || "User"}
            </p>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>{profile?.email}</p>
          </div>
          <span className="app-tag">ID {profile?.id}</span>
        </div>
      </div>

      {/* Accounts */}
      <div className="app-settings-block">
        <div className="app-form-row" style={{ paddingTop: 0 }}>
          <p className="app-settings-title" style={{ marginBottom: 0 }}>
            <Link2 size={14} style={{ display: "inline", marginRight: 8, verticalAlign: -2, opacity: 0.5 }} />
            Connected accounts
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!accounts.some((a) => a.provider === "gmail") && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.open(`${API_URL}/auth/gmail/connect?token=${getToken() || ''}`, "_blank")}
              >
                <Plus size={12} /> Gmail
              </button>
            )}
            {!accounts.some((a) => a.provider === "outlook") && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.open(`${API_URL}/auth/outlook/connect?token=${getToken() || ''}`, "_blank")}
              >
                <Plus size={12} /> Outlook
              </button>
            )}
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="app-empty" style={{ padding: "48px 0" }}>
            <WifiOff size={28} className="app-empty-icon" />
            <p className="app-empty-title">No accounts connected</p>
            <p className="app-empty-desc">Connect Gmail or Outlook to start monitoring.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.open(`${API_URL}/auth/gmail/connect?token=${getToken() || ''}`, "_blank")}
              >
                <Mail size={14} /> Gmail
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.open(`${API_URL}/auth/outlook/connect?token=${getToken() || ''}`, "_blank")}
              >
                <Mail size={14} /> Outlook
              </button>
            </div>
          </div>
        ) : (
          <div className="app-list">
            {accounts.map((acc) => (
              <div key={acc.id} className="app-row" style={{ cursor: "default" }}>
                <Mail size={16} style={{ color: "var(--silver)", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>{acc.email}</p>
                  <p className="app-tag">
                    {acc.provider}
                    {acc.lastSynced &&
                      ` · synced ${new Date(acc.lastSynced).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                </div>
                <span className={acc.isActive ? "app-tag app-tag--live" : "app-tag"}>
                  {acc.isActive ? "Active" : "Paused"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="app-settings-block">
        <p className="app-settings-title">
          <MessageSquare size={14} style={{ display: "inline", marginRight: 8, verticalAlign: -2, opacity: 0.5 }} />
          WhatsApp
        </p>
        <div className="app-row" style={{ cursor: "default", paddingTop: 0 }}>
          <MessageSquare size={18} style={{ color: "var(--silver)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            {profile?.whatsapp ? (
              <>
                <p style={{ fontSize: 16, fontFamily: "var(--font-mono)", color: "var(--text-1)", marginBottom: 8 }}>
                  {profile.whatsapp}
                </p>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>
                  Urgent mail is summarized here. Reply in-thread to send email back.
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 8 }}>Not configured</p>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>
                  Add your WhatsApp number in the database to enable push alerts.
                </p>
              </>
            )}
          </div>
          <span className={profile?.whatsapp ? "app-tag app-tag--live" : "app-tag"}>
            {profile?.whatsapp ? "Connected" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Digest */}
      {digest && (
        <div className="app-settings-block">
          <p className="app-settings-title">
            <CalendarClock size={14} style={{ display: "inline", marginRight: 8, verticalAlign: -2, opacity: 0.5 }} />
            Daily digest
          </p>

          <div className="app-form-row">
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 6 }}>Morning summary</p>
              <p style={{ fontSize: 14, color: "var(--text-2)" }}>Unread recap sent via WhatsApp</p>
            </div>
            <button
              type="button"
              className={`app-toggle ${digest.enabled ? "app-toggle--on" : ""}`}
              onClick={() => setDigest((prev) => (prev ? { ...prev, enabled: !prev.enabled } : null))}
              aria-pressed={digest.enabled}
            >
              <span className="app-toggle-knob" />
            </button>
          </div>

          <div style={{ opacity: digest.enabled ? 1 : 0.35, pointerEvents: digest.enabled ? "auto" : "none" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 40,
                padding: "32px 0",
              }}
            >
              <div className="app-form-field">
                <label htmlFor="digest-time">
                  <Clock size={11} style={{ marginRight: 6, opacity: 0.5 }} />
                  Time
                </label>
                <input
                  id="digest-time"
                  type="time"
                  value={digest.sendTime}
                  onChange={(e) => setDigest((prev) => (prev ? { ...prev, sendTime: e.target.value } : null))}
                  className="app-input app-input--plain"
                />
              </div>
              <div className="app-form-field">
                <label htmlFor="digest-tz">
                  <Globe size={11} style={{ marginRight: 6, opacity: 0.5 }} />
                  Timezone
                </label>
                <select
                  id="digest-tz"
                  value={digest.timezone}
                  onChange={(e) => setDigest((prev) => (prev ? { ...prev, timezone: e.target.value } : null))}
                  className="app-select"
                  style={{ width: "100%" }}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} (UTC{tz.offset})
                    </option>
                  ))}
                </select>
              </div>
              <div className="app-form-field">
                <label>
                  <Mail size={11} style={{ marginRight: 6, opacity: 0.5 }} />
                  Min. emails
                </label>
                <div className="app-pills" style={{ marginTop: 4 }}>
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setDigest((prev) => (prev ? { ...prev, minEmails: num } : null))}
                      className={`app-pill ${digest.minEmails === num ? "app-pill--active" : ""}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
              <motion.button layout type="button" onClick={handleSaveDigest} disabled={saving} className="btn btn-primary">
                <AnimatePresence mode="popLayout">
                  {saving ? (
                    <motion.span key="s">Saving…</motion.span>
                  ) : saved ? (
                    <motion.span key="ok" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle2 size={14} /> Saved
                    </motion.span>
                  ) : (
                    <motion.span key="d">Save changes</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              {saved && (
                <span className="app-tag app-tag--live">Settings updated</span>
              )}
            </div>
          </div>
        </div>
      )}
    </AppPage>
  );
}
