"use client";

import { motion } from "framer-motion";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M5 7l1.5 1.5L9.5 5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="container">
        <motion.div
          className="cta-box"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: "easeOut" as const }}
        >
          <h2 className="cta-title">
            Take back control
            <br />
            <em>of your inbox today.</em>
          </h2>
          <p className="cta-sub">
            Free forever for personal use. Connect your email and experience
            the power of EmailBot in less than 2 minutes.
          </p>
          <motion.a
            href="/dashboard"
            className="btn btn-primary btn-lg cta-button"
            style={{ position: "relative", zIndex: 1 }}
            whileHover={{ 
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started for free
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
