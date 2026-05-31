import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  const words = title.split(" ");
  const lastWord = words.length > 1 ? words.pop() : null;
  const firstPart = words.join(" ");

  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="app-page-header"
    >
      <div className="app-page-header-main">
        {badge && (
          <div className="hero-badge" style={{ marginBottom: 24 }}>
            <span className="badge-dot" />
            {badge}
          </div>
        )}
        {!badge && <p className="label" style={{ marginBottom: 20 }}>Console</p>}
        <h1 className="hero-title" style={{ fontSize: "clamp(36px, 5vw, 52px)", marginBottom: 16, textAlign: "left", maxWidth: "none" }}>
          {firstPart ? (
            <>
              {firstPart}{" "}
              <em>{lastWord}</em>
            </>
          ) : (
            <em>{title}</em>
          )}
        </h1>
        {description && <p className="hero-sub" style={{ marginBottom: 0, textAlign: "left", maxWidth: 520 }}>{description}</p>}
      </div>
      {actions && <div className="app-page-header-actions">{actions}</div>}
    </motion.header>
  );
}
