"use client";

import React, { useState, useEffect } from "react";
import {
  fetchAccounts,
  fetchDigestSettings,
  updateDigestSettings,
  EmailAccount,
  DigestSetting,
} from "@/lib/api";

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [digest, setDigest] = useState<DigestSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [acc, dig] = await Promise.all([fetchAccounts(), fetchDigestSettings()]);
      setAccounts(acc);
      setDigest(dig);
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
      <div className="p-6 md:p-10 max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-black mb-1">Settings</h1>
        <p className="text-slate-500 text-sm font-medium">
          Manage your connected accounts, digest preferences, and integrations.
        </p>
      </div>

      {/* Connected Accounts */}
      <section className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black">Connected Accounts</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Email providers linked to your account</p>
          </div>
        </div>

        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center gradient-border">
              <p className="text-slate-500 text-sm mb-4">No email accounts connected yet.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.open("http://localhost:3001/auth/gmail/callback", "_blank")}
                  className="bg-[#4285F4] hover:bg-[#3367d6] px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#4285F4]/15 transition-all"
                >
                  Connect Gmail
                </button>
                <button
                  onClick={() => window.open("http://localhost:3001/auth/outlook/callback", "_blank")}
                  className="bg-[#0078D4] hover:bg-[#005a9e] px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#0078D4]/15 transition-all"
                >
                  Connect Outlook
                </button>
              </div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="glass rounded-2xl p-6 gradient-border flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg ${
                    acc.provider === "gmail"
                      ? "bg-[#4285F4]/10 text-[#4285F4] shadow-[#4285F4]/10"
                      : "bg-[#0078D4]/10 text-[#0078D4] shadow-[#0078D4]/10"
                  }`}
                >
                  {acc.provider === "gmail" ? "G" : "O"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-200">{acc.email}</p>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                    {acc.provider} • Connected {new Date(acc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${acc.isActive ? "bg-emerald-500" : "bg-slate-600"}`} />
                  <span className={`text-xs font-bold ${acc.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {acc.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {accounts.length > 0 && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => window.open("http://localhost:3001/auth/gmail/callback", "_blank")}
              className="text-xs font-bold text-[#4285F4] hover:text-[#5a9bf4] bg-[#4285F4]/5 hover:bg-[#4285F4]/10 px-4 py-2 rounded-xl border border-[#4285F4]/10 transition-all"
            >
              + Add Gmail
            </button>
            <button
              onClick={() => window.open("http://localhost:3001/auth/outlook/callback", "_blank")}
              className="text-xs font-bold text-[#0078D4] hover:text-[#339ae8] bg-[#0078D4]/5 hover:bg-[#0078D4]/10 px-4 py-2 rounded-xl border border-[#0078D4]/10 transition-all"
            >
              + Add Outlook
            </button>
          </div>
        )}
      </section>

      {/* Digest Settings */}
      <section className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="mb-6">
          <h2 className="text-xl font-black">Digest Preferences</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Configure your daily email digest schedule</p>
        </div>

        {digest && (
          <div className="glass rounded-2xl p-8 gradient-border">
            <div className="space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Daily Digest</p>
                  <p className="text-xs text-slate-500">Receive a daily summary of processed emails</p>
                </div>
                <button
                  onClick={() => setDigest({ ...digest, enabled: !digest.enabled })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    digest.enabled ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      digest.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Time & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={digest.sendTime}
                    onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 ring-indigo-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Timezone
                  </label>
                  <select
                    value={digest.timezone}
                    onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 ring-indigo-500/30 transition-all"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern (US)</option>
                    <option value="America/Chicago">Central (US)</option>
                    <option value="America/Denver">Mountain (US)</option>
                    <option value="America/Los_Angeles">Pacific (US)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Berlin">Berlin</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>

              {/* Min Emails */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                  Minimum Emails to Trigger Digest
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={digest.minEmails}
                  onChange={(e) => setDigest({ ...digest, minEmails: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 ring-indigo-500/30 transition-all"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSaveDigest}
                disabled={saving}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold text-sm hover:from-indigo-400 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* WhatsApp Integration */}
      <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="mb-6">
          <h2 className="text-xl font-black">WhatsApp Integration</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage your notification channel</p>
        </div>

        <div className="glass rounded-2xl p-8 gradient-border">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Connected</span>
              </div>
              <p className="text-sm text-slate-300 mb-1">Notifications are sent to:</p>
              <div className="inline-block bg-slate-900/60 px-4 py-2.5 rounded-xl border border-white/5 mt-1">
                <span className="text-emerald-400 font-mono font-bold text-lg">+1 234 567 8900</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-3">
                High-priority emails will trigger instant WhatsApp notifications. Configure the minimum priority threshold in the Rules section.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
