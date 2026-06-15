"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const emailCards = [
  { icon: "ti-alert-triangle", label: "Spam", sub: "Auto-filtered out", bg: "#2a1520", color: "#f87171", type: "spam" },
  { icon: "ti-tag", label: "Promotions", sub: "Sales & marketing", bg: "#2a2510", color: "#fbbf24", type: "promo" },
  { icon: "ti-briefcase", label: "Internships", sub: "Opportunities & jobs", bg: "#102a1a", color: "#4ade80", type: "intern" },
  { icon: "ti-mail", label: "Other", sub: "Updates & notices", bg: "#10192a", color: "#60a5fa", type: "other" },
];

const waCards = [
  {
    icon: "ti-urgent", iconBg: "#2a1520", iconColor: "#f87171",
    source: "CEO Direct", tag: "Urgent · Score 9", tagClass: "tag-urgent",
    body: "Board review — numbers needed",
    preview: "\u201CQ4 board review — need numbers by 5pm\u201D",
  },
  {
    icon: "ti-briefcase", iconBg: "#102a1a", iconColor: "#4ade80",
    source: "Internship Alert", tag: "Opportunity · Score 8", tagClass: "tag-opportunity",
    body: "Google SWE Internship",
    preview: "\u201CApplication deadline: June 15th...\u201D",
  },
  {
    icon: "ti-mail-forward", iconBg: "#10192a", iconColor: "#60a5fa",
    source: "Auto-Reply Sent", tag: "Replied · AI", tagClass: "tag-reply",
    body: "Invoice payment confirmation",
    preview: "\u201CPolished reply sent via Gmail \u2713\u201D",
  },
];

/* ---------- animated SVG connections ---------- */
function FlowSVG() {
  // Left side paths (email cards → center hub)
  const leftPaths = [
    "M 200 80 C 310 80, 370 195, 460 195",
    "M 200 150 C 300 150, 370 195, 460 195",
    "M 200 225 C 300 225, 370 200, 460 200",
    "M 200 295 C 300 295, 380 205, 460 205",
  ];
  // Right side paths (center hub → WhatsApp cards)
  const rightPaths = [
    "M 540 190 C 620 190, 660 85, 780 85",
    "M 540 197 C 620 197, 660 197, 780 197",
    "M 540 205 C 620 205, 660 310, 780 310",
  ];

  return (
    <svg
      className="flow-connections"
      viewBox="0 0 1000 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Gradient for left paths */}
        <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(120,100,255,0.02)" />
          <stop offset="50%" stopColor="rgba(120,100,255,0.25)" />
          <stop offset="100%" stopColor="rgba(120,100,255,0.02)" />
        </linearGradient>
        {/* Gradient for right paths */}
        <linearGradient id="grad-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(37,211,102,0.02)" />
          <stop offset="50%" stopColor="rgba(37,211,102,0.25)" />
          <stop offset="100%" stopColor="rgba(37,211,102,0.02)" />
        </linearGradient>
        {/* Animated particle glow */}
        <filter id="particle-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="particle-glow-green">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left-side connection paths */}
      {leftPaths.map((d, i) => (
        <g key={`left-${i}`}>
          {/* Background dashed line */}
          <path
            d={d}
            className="conn-line-bg"
          />
          {/* Animated flowing line */}
          <path
            d={d}
            className="conn-line"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
          {/* Travelling particle */}
          <circle r="3" fill="#a78bfa" filter="url(#particle-glow)" opacity="0.9">
            <animateMotion
              dur={`${2.2 + i * 0.25}s`}
              repeatCount="indefinite"
              begin={`${i * 0.4}s`}
            >
              <mpath href={`#leftPath${i}`} />
            </animateMotion>
          </circle>
          <path id={`leftPath${i}`} d={d} fill="none" stroke="none" />
        </g>
      ))}

      {/* Right-side connection paths */}
      {rightPaths.map((d, i) => (
        <g key={`right-${i}`}>
          <path
            d={d}
            className="conn-line-out-bg"
          />
          <path
            d={d}
            className="conn-line-out"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
          {/* Travelling particle */}
          <circle r="3" fill="#25d366" filter="url(#particle-glow-green)" opacity="0.9">
            <animateMotion
              dur={`${2.4 + i * 0.3}s`}
              repeatCount="indefinite"
              begin={`${i * 0.5}s`}
            >
              <mpath href={`#rightPath${i}`} />
            </animateMotion>
          </circle>
          <path id={`rightPath${i}`} d={d} fill="none" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export default function FlowShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="flow-showcase">
        {/* Heading */}
        <motion.div
          className="flow-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="flow-heading-badge">
            <i className="ti ti-route" aria-hidden="true" />
            How It Works
          </div>
          <div className="flow-heading-title">
            EmailBot picks <em>what matters most</em>
          </div>
        </motion.div>

        {/* Main Flow Diagram */}
        <div className="flow-main">
          {/* LEFT: Incoming Emails */}
          <motion.div
            className="flow-col flow-col-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="flow-label">
              <div className="flow-label-text">Incoming emails</div>
            </div>
            {emailCards.map((card, i) => (
              <motion.div
                key={card.type}
                className="email-card"
                data-type={card.type}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE }}
              >
                <div className="email-card-icon" style={{ background: card.bg, color: card.color }}>
                  <i className={`ti ${card.icon}`} aria-hidden="true" />
                </div>
                <div className="email-card-text">
                  <div className="email-card-label">{card.label}</div>
                  <div className="email-card-sub">{card.sub}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated SVG Connections */}
          <FlowSVG />

          {/* CENTER: AI Hub */}
          <motion.div
            className="flow-center"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            <div className="hub-node">
              {/* Orbital rings */}
              <div className="hub-orbit hub-orbit-1" />
              <div className="hub-orbit hub-orbit-2" />
              <div className="hub-orbit hub-orbit-3" />
              <div className="hub-icon">
                <i className="ti ti-brain" aria-hidden="true" />
              </div>
              <div className="hub-label">EmailBot</div>
              <div className="hub-sublabel">AI Worker</div>
            </div>
            <div className="hub-desc">
              <div className="hub-desc-title">AI scores &amp; ranks</div>
              <div className="hub-desc-sub">
                Reads, understands, and prioritizes<br />every email automatically
              </div>
            </div>
          </motion.div>

          {/* RIGHT: WhatsApp Alerts */}
          <motion.div
            className="flow-col flow-col-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            <div className="flow-label">
              <div className="flow-label-text">WhatsApp alerts</div>
            </div>
            {waCards.map((card, i) => (
              <motion.div
                key={card.source}
                className="wa-card"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: EASE }}
              >
                <div className="wa-card-header">
                  <div className="wa-card-icon" style={{ background: card.iconBg, color: card.iconColor }}>
                    <i className={`ti ${card.icon}`} aria-hidden="true" />
                  </div>
                  <div className="wa-card-source">{card.source}</div>
                  <div className={`wa-card-tag ${card.tagClass}`}>{card.tag}</div>
                </div>
                <div className="wa-card-body">{card.body}</div>
                <div className="wa-card-preview">{card.preview}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Reply Flow Footer */}
        <motion.div
          className="reply-flow"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        >
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#0d2b10", color: "#25d366" }}>
              <i className="ti ti-brand-whatsapp" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">Reply on WhatsApp</div>
          </div>
          <div className="reply-flow-arrow">
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <path d="M0 6h20m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#1a1a2e", color: "#a78bfa" }}>
              <i className="ti ti-brain" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">AI refines reply</div>
          </div>
          <div className="reply-flow-arrow">
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
              <path d="M0 6h20m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#1a1520", color: "#f87171" }}>
              <i className="ti ti-mail-forward" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">Sent via Email</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
