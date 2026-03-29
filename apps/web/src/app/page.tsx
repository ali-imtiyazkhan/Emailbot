import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/HeroSection";
import DemoWindow from "@/components/DemoWindow";
import AIChatPanel from "@/components/AIChatPanel";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <HeroSection />
      <DemoWindow />
      <AIChatPanel />

      {/* Features Section */}
      <section className="relative px-6 py-20 max-w-6xl mx-auto" id="features-section">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Everything you need to{" "}
            <span className="text-serif-italic font-normal text-white/80">
              tame your inbox
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Connect once. Let AI do the rest. No scripts, no complex setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              title: "Smart Prioritization",
              description: "AI analyzes every email and assigns a priority score from 1-10. Focus on what matters.",
              color: "from-indigo-500 to-indigo-600",
              glow: "shadow-indigo-500/20",
            },
            {
              icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
              title: "WhatsApp Alerts",
              description: "Get instant notifications on WhatsApp for high-priority emails. Never miss what's critical.",
              color: "from-emerald-500 to-teal-600",
              glow: "shadow-emerald-500/20",
            },
            {
              icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
              title: "Custom Rules",
              description: "Create powerful filter rules by sender, keyword, or priority threshold. Your inbox, your rules.",
              color: "from-purple-500 to-fuchsia-600",
              glow: "shadow-purple-500/20",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-8 gradient-border group hover:bg-white/[0.02] transition-all duration-300"
              style={{ animation: `fade-in 0.5s ease-out ${i * 150}ms both` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-black text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20" id="cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 md:p-16 gradient-border">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to{" "}
              <span className="gradient-text">automate</span>{" "}
              your inbox?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
              Connect your Gmail or Outlook account and let EmailBot take care of the rest. Set up in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary-landing flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Open Dashboard
              </Link>
              <Link href="/settings" className="btn-secondary-landing">
                Connect Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-10 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-[10px] font-black text-white">
              E
            </div>
            <span className="text-sm font-bold text-slate-400">EmailBot</span>
          </div>
          <p className="text-xs text-slate-600">
            © 2026 EmailBot. Built with AI.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Privacy</button>
            <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Terms</button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
