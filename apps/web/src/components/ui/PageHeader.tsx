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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 z-10"
    >
      {/* Soft ambient background glow specifically for headers */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[300px] bg-white/[0.025] blur-[120px] pointer-events-none rounded-full" />
      
      <div className="space-y-4 relative z-10">
        {badge && (
          <div className="hero-badge !mb-2">
            <span className="badge-dot" />
            {badge}
          </div>
        )}
        <h1 className="hero-title !text-4xl md:!text-[52px] !leading-[1.1] text-left !mb-0">
          {firstPart ? <>{firstPart} <em>{lastWord}</em></> : <em>{title}</em>}
        </h1>
        {description && (
          <p className="hero-sub !text-[15px] !mb-0 !max-w-lg">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 relative z-10">{actions}</div>}
    </motion.div>
  );
}
