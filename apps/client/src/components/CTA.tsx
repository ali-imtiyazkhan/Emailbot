"use client";

import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="cta" id="cta">
      <div className="container">
        <motion.div className="cta-box" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, ease: "easeOut" as const }}>
          <h2 className="cta-title">Take back control<br /><em>of your inbox today.</em></h2>
          <p className="cta-sub">Free forever for personal use. Connect your email and experience the power of EmailBot in less than 2 minutes.</p>
          <motion.a href="/dashboard" className="btn btn-primary btn-lg" style={{ position: "relative", zIndex: 1 }} whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }} whileTap={{ scale: 0.98 }}>
            Get Started for free
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
