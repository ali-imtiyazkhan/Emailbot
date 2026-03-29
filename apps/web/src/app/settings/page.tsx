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
      <div className="p-8 md:p-12 xl:p-16 w-full ml-auto mr-auto max-w-[1400px]">
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-[13px] font-medium">Loading settings...</p>
        </div>
      </div>

    );
  }

  return (
    <div className="p-8 md:p-12 xl:p-16 w-full ml-auto mr-auto max-w-[1400px]">
      {/* Header */}
      <div className="mb-14">
        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-3">Settings</h1>
        <p className="text-slate-500 text-[16px] font-medium leading-relaxed max-w-lg">
          Manage your connected accounts, digest preferences, and integrations.
        </p>
      </div>


      {/* Connected Accounts */}
      <section className="mb-14">
        <div className="mb-8">
          <h2 className="text-[17px] font-bold">Connected Accounts</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Email providers linked to your account</p>
        </div>

        <div className="space-y-3">
          {accounts.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-12 text-center">
              <p className="text-slate-500 text-[14px] font-medium mb-6">No email accounts connected yet.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.open("http://localhost:3001/auth/gmail/connect", "_blank")}
                  className="bg-white text-black px-6 py-2.5 rounded-md font-bold text-[13px] transition-all hover:bg-slate-200"
                >
                  Connect Gmail
                </button>
                <button
                  onClick={() => window.open("http://localhost:3001/auth/outlook/connect", "_blank")}
                  className="bg-white/[0.05] text-white border border-white/10 px-6 py-2.5 rounded-md font-bold text-[13px] transition-all hover:bg-white/10"
                >
                  Connect Outlook
                </button>
              </div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="bg-[#0f0f0f] border border-white/5 rounded-lg p-5 flex items-center gap-5 hover:border-white/10 transition-colors">
                <div
                  className={`w-10 h-10 rounded-md flex items-center justify-center font-black text-[13px] border ${
                    acc.provider === "gmail"
                      ? "bg-white/[0.03] border-white/10 text-white"
                      : "bg-white/[0.03] border-white/10 text-white"
                  }`}
                >
                  {acc.provider === "gmail" ? "G" : "O"}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-200">{acc.email}</p>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                    {acc.provider} • Connected {new Date(acc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${acc.isActive ? "bg-white/40" : "bg-white/10"}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-tight ${acc.isActive ? "text-slate-400" : "text-slate-600"}`}>
                    {acc.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {accounts.length > 0 && (
          <div className="flex gap-4 mt-6">
            <button
                onClick={() => window.open("http://localhost:3001/auth/gmail/connect", "_blank")}
                className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
              >
                + Add Gmail
              </button>
              <button
                onClick={() => window.open("http://localhost:3001/auth/outlook/connect", "_blank")}
                className="text-[11px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
              >
                + Add Outlook
              </button>
          </div>
        )}
      </section>

      {/* Digest Settings */}
      <section className="mb-14">
        <div className="mb-8">
          <h2 className="text-[17px] font-bold">Digest Preferences</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Configure your daily email digest schedule</p>
        </div>

        {digest && (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-8">
            <div className="space-y-8">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between pb-8 border-b border-white/[0.03]">
                <div>
                  <p className="text-[14px] font-semibold text-slate-200">Daily Digest</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">Receive a daily summary of processed emails</p>
                </div>
                <button
                  onClick={() => setDigest({ ...digest, enabled: !digest.enabled })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    digest.enabled ? "bg-white" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                      digest.enabled ? "translate-x-5 bg-black" : "translate-x-0 bg-slate-400"
                    }`}
                  />
                </button>
              </div>

              {/* Time & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 tracking-widest mb-3">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={digest.sendTime}
                    onChange={(e) => setDigest({ ...digest, sendTime: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-md px-4 py-2.5 text-[14px] text-slate-200 focus:outline-none focus:border-white/20 transition-all font-medium appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-600 tracking-widest mb-3">
                    Timezone
                  </label>
                  <select
                    value={digest.timezone}
                    onChange={(e) => setDigest({ ...digest, timezone: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-md px-4 py-2.5 text-[14px] text-slate-200 focus:outline-none focus:border-white/20 transition-all font-medium appearance-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern (US)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveDigest}
                disabled={saving}
                className="w-full bg-white text-black py-3 rounded-md font-bold text-[14px] hover:bg-slate-200 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  "Preferences Saved"
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* WhatsApp Integration */}
      <section>
        <div className="mb-8">
          <h2 className="text-[17px] font-bold">WhatsApp Integration</h2>
          <p className="text-[13px] text-slate-500 font-medium mt-1">Manage your notification channel</p>
        </div>

        <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-8">
          <div className="flex items-start gap-5">
            <div className="w-10 h-10 rounded-md bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Channel</span>
              </div>
              <p className="text-[14px] text-slate-300 mb-4">Notifications are currently sent to your verified number.</p>
              <div className="p-4 rounded-md bg-white/[0.02] border border-white/5 inline-block min-w-[200px]">
                <span className="text-white font-mono font-bold text-[17px] tracking-tight">+1 234 567 8900</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-6 leading-relaxed">
                High-priority emails will trigger instant WhatsApp summaries. To change this number, contact our support team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
