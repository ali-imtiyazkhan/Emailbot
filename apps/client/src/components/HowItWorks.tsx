"use client";

import { motion } from "framer-motion";

const ArrowIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const steps = [
  { num: 1, title: "Connect your inbox", desc: "Link your Gmail or Outlook accounts securely. EmailBot starts analyzing sentiment and priority immediately based on your history and job role." },
  { num: 2, title: "Configure alerts", desc: "Set your notification thresholds. High-priority board emails to WhatsApp? Digest of mid-level tasks via Slack? You define what breaks through the noise." },
  { num: 3, title: "Watch it automate", desc: "EmailBot filters, drafts, and archives in the background. It learns from your actions, getting smarter about what truly matters to you every day." },
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const itemVariants = { hidden: { x: -12, opacity: 0 }, visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="container">
        <div className="label">How it works</div>
        <h2 className="section-title" style={{ marginTop: 18 }}>Three steps.<br /><em>Zero noise.</em></h2>
        <motion.div className="steps" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
          {steps.map((step) => (
            <motion.div key={step.num} className="step" variants={itemVariants}>
              <div className="step-num-badge">{step.num}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              {step.num < 3 && <div className="step-arrow"><ArrowIcon /></div>}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
