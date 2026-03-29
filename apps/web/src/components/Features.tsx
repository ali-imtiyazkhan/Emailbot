"use client";

import { motion } from "framer-motion";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8l3 3 7-7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="3"
      width="12"
      height="10"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M5 7h6M5 9.5h4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle
      cx="8"
      cy="8"
      r="5.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M8 5v3l2 2"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="1.5"
      y="1.5"
      width="5.5"
      height="5.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="9"
      y="1.5"
      width="5.5"
      height="5.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="1.5"
      y="9"
      width="5.5"
      height="5.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <rect
      x="9"
      y="9"
      width="5.5"
      height="5.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 10l4-8 3 6 2-3 3 5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle
      cx="8"
      cy="8"
      r="3"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const features = [
  {
    num: "01",
    icon: <CheckIcon />,
    name: "Inbox Prioritization",
    desc: "Stop drowning in noise. EmailBot analyzes every incoming message and categorizes them by urgency so you only see what matters.",
  },
  {
    num: "02",
    icon: <DocIcon />,
    name: "WhatsApp Alerts",
    desc: "Get notified where you actually are. High-priority emails trigger instant, AI-summarized alerts directly to your WhatsApp.",
  },
  {
    num: "03",
    icon: <ClockIcon />,
    name: "Smart Forwarding",
    desc: "Automate your workflows. Define complex rules to forward specific emails to teammates, CRM systems, or other tools automatically.",
  },
  {
    num: "04",
    icon: <GridIcon />,
    name: "Custom Rules",
    desc: "Total control over your inbox. Create granular forwarding and notification rules based on sender, keywords, or AI-detected intent.",
  },
  {
    num: "05",
    icon: <ChartIcon />,
    name: "Full Analytics",
    desc: "Every email processed, every rule triggered — tracked in real-time. Gain insights into your communication patterns without the effort.",
  },
  {
    num: "06",
    icon: <CircleIcon />,
    name: "Model Agnostic",
    desc: "Choose your favorite brain. Use Claude, GPT-4o, or Gemini to power your inbox intelligence. Your API key, your choice.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-head">
          <div className="label">Capabilities</div>
          <h2 className="section-title">
            Everything your inbox
            <br />
            <em>was missing.</em>
          </h2>
          <p className="section-sub">
            Built for developers, researchers, and power users who expect their
            tools to keep up with how they think.
          </p>
        </div>
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((feat) => (
            <motion.div
              key={feat.num}
              className="feat"
              variants={itemVariants}
              whileHover={{ 
                scale: 1.012,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
            >
              <div className="feat-top">
                <div className="feat-icon">{feat.icon}</div>
                <span className="feat-num">{feat.num}</span>
              </div>
              <div className="feat-name">{feat.name}</div>
              <div className="feat-desc">{feat.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
