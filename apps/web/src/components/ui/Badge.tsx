import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  dot?: boolean;
}

export function Badge({ children, variant = "default", className = "", dot = false }: BadgeProps) {
  const variants = {
    default: "bg-white/5 text-white/40 border-white/5",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border
        ${variants[variant]}
        ${className}
      `}
    >
      {dot && (
        <span 
          className={`w-1 h-1 rounded-full animate-pulse transition-colors ${
            variant === "success" ? "bg-emerald-500" : 
            variant === "warning" ? "bg-amber-500" :
            variant === "danger" ? "bg-red-500" :
            variant === "info" ? "bg-blue-500" : "bg-white/30"
          }`}
        />
      )}
      {children}
    </span>
  );
}
