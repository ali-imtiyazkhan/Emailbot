import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className = "", hoverable = false }: CardProps) {
  return (
    <div className="relative group/card w-full">
      <div 
        className={`
          relative w-full rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f] overflow-hidden
          shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_20px_40px_-10px_rgba(0,0,0,0.6)]
          ${hoverable ? "transition-all duration-500 ease-out hover:border-[#9a9a9a] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_40px_rgba(255,255,255,0.03)] hover:-translate-y-1" : ""}
          ${className}
        `}
      >
        {/* Chrome Shimmer Top Edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
        <div className="relative z-20">
          {children}
        </div>
      </div>
      
      {/* Ambient Floor Glow on Hover */}
      {hoverable && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-12 bg-white/5 blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full" />
      )}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-8 py-6 border-b border-[#1c1c1c] bg-gradient-to-b from-white/[0.03] to-transparent ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-8 py-7 ${className}`}>
      {children}
    </div>
  );
}
