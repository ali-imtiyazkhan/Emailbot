"use client";

import { motion } from "framer-motion";

/* ── Inline SVG Icons ── */
const BrainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2a3.5 3.5 0 0 0-3.442 4.12A3.5 3.5 0 0 0 4 9.5a3.5 3.5 0 0 0 1.882 3.103A3.5 3.5 0 0 0 9.5 16H12V2H9.5z" />
    <path d="M14.5 2a3.5 3.5 0 0 1 3.442 4.12A3.5 3.5 0 0 1 20 9.5a3.5 3.5 0 0 1-1.882 3.103A3.5 3.5 0 0 1 14.5 16H12V2h2.5z" />
    <path d="M12 2v14" />
    <path d="M8 8h.01M16 8h.01M12 12v2" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MailForwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="M17 17l4-4-4-4" opacity="0.5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SmallBrainIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2a3.5 3.5 0 0 0-3.442 4.12A3.5 3.5 0 0 0 4 9.5a3.5 3.5 0 0 0 1.882 3.103A3.5 3.5 0 0 0 9.5 16H12V2H9.5z" />
    <path d="M14.5 2a3.5 3.5 0 0 1 3.442 4.12A3.5 3.5 0 0 1 20 9.5a3.5 3.5 0 0 1-1.882 3.103A3.5 3.5 0 0 1 14.5 16H12V2h2.5z" />
  </svg>
);

const FireIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/* ── Email sources data ── */
const emailSources = [
  { icon: <AlertTriangleIcon />, label: "Spam", sub: "Auto-filtered out", bg: "#2a1520", color: "#f87171" },
  { icon: <TagIcon />, label: "Promotions", sub: "Sales & marketing", bg: "#2a2510", color: "#fbbf24" },
  { icon: <BriefcaseIcon />, label: "Internships", sub: "Opportunities & jobs", bg: "#102a1a", color: "#4ade80" },
  { icon: <MailIcon />, label: "Other", sub: "Updates & notices", bg: "#10192a", color: "#60a5fa" },
];

/* ── WhatsApp output cards ── */
const waCards = [
  {
    icon: <FireIcon />,
    iconBg: "#2a1520", iconColor: "#f87171",
    source: "CEO Direct",
    tag: "Urgent · Score 9", tagClass: "flow-tag-urgent",
    title: "Board review — numbers needed",
    preview: '"Q4 board review — need numbers by 5pm"',
  },
  {
    icon: <BriefcaseIcon />,
    iconBg: "#102a1a", iconColor: "#4ade80",
    source: "Internship Alert",
    tag: "Opportunity · 8", tagClass: "flow-tag-opportunity",
    title: "Google SWE Internship",
    preview: '"Application deadline: June 15th..."',
  },
  {
    icon: <MailForwardIcon />,
    iconBg: "#10192a", iconColor: "#60a5fa",
    source: "Auto-Reply Sent",
    tag: "Replied · AI", tagClass: "flow-tag-reply",
    title: "Invoice payment confirmed",
    preview: '"Polished reply sent via Gmail ✓"',
  },
];

/* ── Animated SVG connections ── */
function FlowConnections() {
  return (
    <svg
      className="flow-svg-connections"
      viewBox="0 0 1000 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Left→Center */}
      <path className="flow-line-in" d="M 200 75 C 310 75, 360 200, 440 200" />
      <path className="flow-line-in" d="M 200 155 C 300 155, 360 200, 440 200" />
      <path className="flow-line-in" d="M 200 240 C 300 240, 360 205, 440 205" />
      <path className="flow-line-in" d="M 200 320 C 310 320, 360 210, 440 210" />
      {/* Center→Right */}
      <path className="flow-line-out" d="M 560 195 C 640 195, 680 85, 790 85" />
      <path className="flow-line-out" d="M 560 200 C 640 200, 680 210, 790 210" />
      <path className="flow-line-out" d="M 560 210 C 640 210, 680 330, 790 330" />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="glow-main" />
      <div className="glow-sides" />

      {/* ── Badge ── */}
      <motion.div
        className="hero-badge"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <span className="badge-dot" />
        AI-Powered · Email Intelligence
      </motion.div>

      {/* ── Title ── */}
      <motion.h1
        className="hero-title"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        Automate your inbox
        <br />
        <em>task in plain English.</em>
      </motion.h1>

      {/* ── Subtitle ── */}
      <motion.p
        className="hero-sub"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.35 }}
      >
        Connect your email. Describe what matters. EmailBot reads,
        prioritizes, and alerts you — on WhatsApp.
      </motion.p>

      {/* ── CTA buttons ── */}
      <motion.div
        className="hero-actions"
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.45 }}
      >
        <a
          href="https://github.com/ali-imtiyazkhan/EmailBot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Star on GitHub
        </a>
        <a href="#how" className="btn btn-secondary btn-lg">
          See how it works
        </a>
      </motion.div>

      {/* ── GitHub badge ── */}
      <motion.div
        className="hero-trust"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.55 }}
      >
        <a
          href="https://github.com/ali-imtiyazkhan/EmailBot"
          target="_blank"
          rel="noopener noreferrer"
          className="github-badge"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="github-label">Open source on GitHub</span>
        </a>
      </motion.div>

      {/* ═══════ FLOW DIAGRAM (replaces old mockup) ═══════ */}
      <motion.div
        className="mockup-wrap"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.65 }}
      >
        <div className="flow-showcase" id="flow-showcase">
          {/* Section heading */}
          <div className="flow-heading">
            <div className="flow-heading-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" />
              </svg>
              How It Works
            </div>
            <div className="flow-heading-title">
              EmailBot picks <em>what matters most</em>
            </div>
          </div>

          {/* ── Main 3-column flow ── */}
          <div className="flow-main">
            {/* Connection lines */}
            <FlowConnections />

            {/* Left: Email sources */}
            <div className="flow-col flow-col-left">
              <div className="flow-label">
                <span className="flow-label-text">Incoming emails</span>
              </div>
              {emailSources.map((src, i) => (
                <motion.div
                  key={src.label}
                  className="flow-email-card"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.08 }}
                >
                  <div
                    className="flow-email-icon"
                    style={{ background: src.bg, color: src.color }}
                  >
                    {src.icon}
                  </div>
                  <div className="flow-email-text">
                    <div className="flow-email-label">{src.label}</div>
                    <div className="flow-email-sub">{src.sub}</div>
                  </div>
                  <span className="flow-dot-r" />
                </motion.div>
              ))}
            </div>

            {/* Center: AI Hub */}
            <div className="flow-center">
              <motion.div
                className="flow-hub"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
              >
                <span className="flow-hub-ring flow-hub-ring-1" />
                <span className="flow-hub-ring flow-hub-ring-2" />
                <div className="flow-hub-icon">
                  <BrainIcon />
                </div>
                <div className="flow-hub-label">EmailBot</div>
                <div className="flow-hub-sublabel">AI Worker</div>
              </motion.div>
              <div className="flow-hub-desc">
                <div className="flow-hub-desc-title">AI scores &amp; ranks</div>
                <div className="flow-hub-desc-sub">
                  Reads, understands, and prioritizes
                  <br />
                  every email automatically
                </div>
              </div>
            </div>

            {/* Right: WhatsApp outputs */}
            <div className="flow-col flow-col-right">
              <div className="flow-label">
                <span className="flow-label-text">WhatsApp alerts</span>
              </div>
              {waCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  className="flow-wa-card"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.1 }}
                >
                  <span className="flow-dot-l" />
                  <div className="flow-wa-header">
                    <div
                      className="flow-wa-icon"
                      style={{ background: card.iconBg, color: card.iconColor }}
                    >
                      {card.icon}
                    </div>
                    <span className="flow-wa-source">{card.source}</span>
                    <span className={`flow-wa-tag ${card.tagClass}`}>
                      {card.tag}
                    </span>
                  </div>
                  <div className="flow-wa-title">{card.title}</div>
                  <div className="flow-wa-preview">{card.preview}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Reply flow strip ── */}
          <motion.div
            className="flow-reply"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 }}
          >
            {[
              { icon: <WhatsAppIcon />, label: "Reply on WhatsApp", bg: "#0d2b10", color: "#25d366" },
              { icon: <SmallBrainIcon />, label: "AI refines reply", bg: "#1a1a2e", color: "#a78bfa" },
              { icon: <MailForwardIcon />, label: "Sent via Email", bg: "#1a1520", color: "#f87171" },
            ].map((step, i, arr) => (
              <span key={step.label} className="flow-reply-step-wrap">
                <span className="flow-reply-step">
                  <span
                    className="flow-reply-icon"
                    style={{ background: step.bg, color: step.color }}
                  >
                    {step.icon}
                  </span>
                  <span className="flow-reply-label">{step.label}</span>
                </span>
                {i < arr.length - 1 && <span className="flow-reply-arrow">→</span>}
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
