import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-10 mb-20"
    >
      <div className="space-y-6">
        {badge && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 border border-white/5 px-2.5 py-1 rounded-md bg-white/[0.02]">
              {badge}
            </span>
          </div>
        )}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[15px] md:text-[16px] text-white/30 leading-relaxed max-w-xl font-medium">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.div>
  );
}
