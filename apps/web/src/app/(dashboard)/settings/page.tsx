"use client";

import React, { useState, useEffect } from "react";
import {
  fetchAccounts,
  fetchDigestSettings,
  updateDigestSettings,
  fetchProfile,
  updateProfile,
  fetchConnectUrl,
  disconnectAccount,
  EmailAccount,
  DigestSetting,
  User,
} from "@/lib/api";
import { getToken, setToken } from "@/lib/auth";
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
  const [whatsappInput, setWhatsappInput] = useState('');
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    loadSettings();

    const handleOAuthSuccess = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "oauth-success") {
        if (event.data?.token) setToken(event.data.token);
        loadSettings();
      }
    };

    window.addEventListener("message", handleOAuthSuccess);
    return () => {
      window.removeEventListener("message", handleOAuthSuccess);
    };
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
      setWhatsappInput(prof?.whatsapp ?? '');
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

  const handleConnect = async (provider: "gmail" | "outlook") => {
    try {
      const { url } = await fetchConnectUrl(provider);
      window.open(url, "_blank");
    } catch (err) {
      console.error(`Failed to initiate ${provider} connection:`, err);
      alert(`Failed to initiate ${provider} connection`);
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
            {editingEmail ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="app-input app-input--plain"
                  style={{ minWidth: 200, fontSize: 14 }}
                  autoFocus
                />
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  style={{ whiteSpace: "nowrap" }}
                  disabled={emailSaving}
                  onClick={async () => {
                    setEmailSaving(true);
                    try {
                      const updated = await updateProfile({ email: emailInput.trim() });
                      setProfile(updated);
                      setEmailInput(updated.email);
                      setEditingEmail(false);
                    } catch (err: any) {
                      alert(err.message || 'Failed to update email');
                    } finally {
                      setEmailSaving(false);
                    }
                  }}
                >
                  {emailSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="app-btn"
                  style={{ whiteSpace: "nowrap" }}
                  onClick={() => setEditingEmail(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <p style={{ fontSize: 14, color: "var(--text-2)" }}>{profile?.email}</p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: "2px 8px", minHeight: "auto", lineHeight: "20px" }}
                  onClick={() => {
                    setEmailInput(profile?.email || '');
                    setEditingEmail(true);
                  }}
                >
                  Change
                </button>
              </div>
            )}
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
                onClick={() => handleConnect("gmail")}
              >
                <Plus size={12} /> Gmail
              </button>
            )}
            {!accounts.some((a) => a.provider === "outlook") && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleConnect("outlook")}
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
                onClick={() => handleConnect("gmail")}
              >
                <Mail size={14} /> Gmail
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleConnect("outlook")}
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
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: "2px 8px", minHeight: "auto", lineHeight: "20px", color: "#e74c3c" }}
                  onClick={async () => {
                    if (!confirm(`Disconnect ${acc.email}?`)) return;
                    try {
                      await disconnectAccount(acc.id);
                      await loadSettings();
                    } catch (err: any) {
                      alert(err.message || 'Failed to disconnect');
                    }
                  }}
                >
                  Disconnect
                </button>
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
        <div className="app-form-row">
          <MessageSquare size={18} style={{ color: "var(--silver)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <input
              type="tel"
              placeholder="+1234567890"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 15,
                fontFamily: "var(--font-mono)",
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text-1)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>
              Include country code (e.g. +1 for US). Urgent mail summaries and reply prompts will be sent here.
            </p>
          </div>
          <button
            className="app-btn app-btn--primary"
            style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
            disabled={whatsappSaving}
            onClick={async () => {
              setWhatsappSaving(true);
              setWhatsappSaved(false);
              try {
                const val = whatsappInput.trim() || null;
                const updated = await updateProfile({ whatsapp: val });
                setProfile(updated);
                setWhatsappInput(updated.whatsapp ?? '');
                setWhatsappSaved(true);
                setTimeout(() => setWhatsappSaved(false), 2000);
              } catch (err: any) {
                alert(err.message || 'Failed to save');
              } finally {
                setWhatsappSaving(false);
              }
            }}
          >
            {whatsappSaving ? "Saving..." : whatsappSaved ? <CheckCircle2 size={16} /> : "Save"}
          </button>
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
