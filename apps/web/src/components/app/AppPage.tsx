"use client";

import React from "react";

export function AppPage({ children }: { children: React.ReactNode }) {
  return <div className="app-page">{children}</div>;
}

export function AppMetrics({
  items,
}: {
  items: { label: string; value: React.ReactNode; hint?: string }[];
}) {
  return (
    <div className="app-metrics">
      {items.map((item) => (
        <div key={item.label} className="app-metric">
          <p className="app-metric-value">{item.value}</p>
          <p className="app-metric-label">{item.label}</p>
          {item.hint && <p className="app-metric-hint">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function AppSection({
  label,
  title,
  description,
  action,
  children,
}: {
  label?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="app-section">
      <div className="app-section-head">
        <div>
          {label && <p className="label">{label}</p>}
          <h2 className="app-section-title">{title}</h2>
          {description ? <p className="app-section-desc">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AppEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="app-empty">
      <Icon size={28} strokeWidth={1.25} className="app-empty-icon" />
      <p className="app-empty-title">{title}</p>
      <p className="app-empty-desc">{description}</p>
      {action}
    </div>
  );
}
