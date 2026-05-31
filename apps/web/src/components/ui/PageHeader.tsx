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
      className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 z-10"
    >
      <div className="space-y-3 relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-sm px-3 py-1 text-[11.5px] font-medium text-[#888] tracking-wide backdrop-blur-md">
            <span className="w-[5px] h-[5px] rounded-full bg-white animate-[blink-dot_2.4s_ease-in-out_infinite]" />
            {badge}
          </div>
        )}
        <h1 className="text-3xl md:text-[42px] font-semibold leading-[1.1] tracking-tight text-[#f2f2f2]">
          {firstPart ? (
            <>
              {firstPart}{" "}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#888] via-[#e8e8e8] to-[#888] bg-clip-text text-transparent">{lastWord}</span>
            </>
          ) : (
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#888] via-[#e8e8e8] to-[#888] bg-clip-text text-transparent">{title}</span>
          )}
        </h1>
        {description && (
          <p className="text-[15px] text-[#888] leading-relaxed max-w-lg">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 relative z-10 shrink-0">{actions}</div>}
    </motion.div>
  );
}
