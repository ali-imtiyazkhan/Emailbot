"use client";

import { useState } from "react";

const emails = [
  { id: 1, from: "Sarah Chen", email: "sarah@acme.com", subject: "Q4 Board Meeting — Agenda Finalized", preview: "Hi team, please find the finalized agenda for our upcoming board meeting attached...", time: "2m ago", priority: "high", read: false, labels: ["board", "urgent"] },
  { id: 2, from: "GitHub", email: "noreply@github.com", subject: "New security alert for your repository", preview: "A security vulnerability has been detected in one of your dependencies...", time: "18m ago", priority: "high", read: false, labels: ["security"] },
  { id: 3, from: "Stripe", email: "support@stripe.com", subject: "Your payout of $3,240 is on its way", preview: "Your payout has been initiated and will arrive in your bank account within...", time: "1h ago", priority: "medium", read: false, labels: ["finance"] },
  { id: 4, from: "Linear", email: "notifications@linear.app", subject: "6 issues assigned to you this week", preview: "You have been assigned 6 new issues across your projects. Here's a summary...", time: "3h ago", priority: "low", read: true, labels: ["work"] },
  { id: 5, from: "Notion", email: "team@notion.so", subject: "Weekly digest: 14 pages updated", preview: "Here's what happened in your workspace this week. 14 pages were updated by...", time: "5h ago", priority: "low", read: true, labels: [] },
  { id: 6, from: "David Park", email: "david@company.io", subject: "Re: Partnership proposal — let's connect", preview: "Thanks for reaching out! I'd love to chat about potential partnership opportunities...", time: "Yesterday", priority: "medium", read: true, labels: ["partnership"] },
  { id: 7, from: "AWS", email: "aws@amazon.com", subject: "Your monthly bill is ready", preview: "Your AWS bill for November 2024 is now available. Total charges: $482.30...", time: "Yesterday", priority: "medium", read: true, labels: ["finance"] },
  { id: 8, from: "Vercel", email: "noreply@vercel.com", subject: "Deployment successful: main branch", preview: "Your deployment to production was successful. Visit your site at...", time: "2d ago", priority: "low", read: true, labels: ["devops"] },
];

const priorityDot: Record<string, string> = { high: "bg-white", medium: "bg-white/50", low: "bg-white/20" };
const priorityBadge: Record<string, string> = { high: "bg-white/90 text-black", medium: "bg-white/15 text-white/70", low: "bg-white/5 text-white/30" };

export default function EmailsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = emails.filter((e) => {
    if (filter === "high") return e.priority === "high";
    if (filter === "unread") return !e.read;
    return true;
  }).filter((e) =>
    search === "" || e.subject.toLowerCase().includes(search.toLowerCase()) || e.from.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEmail = emails.find((e) => e.id === selected);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List Panel */}
      <div className={`flex flex-col ${selected ? "hidden md:flex" : "flex"} w-full md:w-[380px] border-r border-white/5 flex-shrink-0`}>
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <h1 className="text-[19px] font-bold text-white mb-4 tracking-tight">Emails</h1>
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 text-[13px] text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-white/20 transition-all font-medium"
          />
          <div className="flex gap-1 mt-3">
            {["all", "high", "unread"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? "bg-white/[0.06] text-white border border-white/10" : "text-slate-600 hover:text-slate-400"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelected(email.id)}
              className={`flex items-start gap-3 px-4 py-4 border-b border-white/[0.03] cursor-pointer transition-all hover:bg-white/[0.02] ${selected === email.id ? "bg-white/[0.04] border-l-2 border-l-white/40" : ""} ${email.read ? "opacity-60" : ""}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[email.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[12px] font-bold truncate ${email.read ? "text-slate-500" : "text-white"}`}>{email.from}</span>
                  <span className="text-[10px] text-slate-700 flex-shrink-0 ml-2">{email.time}</span>
                </div>
                <p className={`text-[12px] truncate mb-1 ${email.read ? "text-slate-600" : "text-slate-400"} font-medium`}>{email.subject}</p>
                <p className="text-[11px] text-slate-700 truncate">{email.preview}</p>
                {email.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {email.labels.map((l) => (
                      <span key={l} className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">{l}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className={`flex-1 flex flex-col ${selected ? "flex" : "hidden md:flex"}`}>
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
              <div>
                <button onClick={() => setSelected(null)} className="md:hidden text-[11px] text-slate-600 hover:text-white font-bold mb-3 flex items-center gap-1">
                  ← Back
                </button>
                <h2 className="text-[17px] font-bold text-white mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-500 font-medium">{selectedEmail.from}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-[12px] text-slate-600">{selectedEmail.email}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-[12px] text-slate-600">{selectedEmail.time}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${priorityBadge[selectedEmail.priority]}`}>{selectedEmail.priority}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-[11px] font-bold text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-white/20 transition-all">Reply</button>
                <button className="text-[11px] font-bold text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-white/20 transition-all">Forward</button>
                <button className="text-[11px] font-bold text-white/40 hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-white/20 transition-all">Archive</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-2xl">
                <p className="text-slate-400 text-[14px] leading-relaxed font-medium">{selectedEmail.preview}</p>
                <div className="mt-8 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">AI Summary</span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">This email has been classified as <strong className="text-white/60">{selectedEmail.priority} priority</strong> by EmailBot. {selectedEmail.priority === "high" ? "A WhatsApp alert has been sent to your registered number." : "No immediate action required."}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-600 text-[13px] font-medium">Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
