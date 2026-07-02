"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LayoutShell from "@/components/LayoutShell";
import { getToken, fetchToken } from "@/lib/auth";

function AuthGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    const token = await fetchToken(secretInput || undefined);
    if (token) {
      setAuthenticated(true);
    } else {
      setAuthError("Invalid secret. Check your AUTH_TOKEN_SECRET.");
    }
    setAuthLoading(false);
  };

  if (authenticated === null) return null;
  if (authenticated) return <>{children}</>;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-sans)",
      padding: 24,
    }}>
      <div style={{
        maxWidth: 400, width: "100%", textAlign: "center",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)", padding: 40,
      }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>
          Dashboard Access
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 24 }}>
          Enter your AUTH_TOKEN_SECRET to access the dashboard.
        </p>
        <input
          type="password"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Auth secret"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: "var(--r-sm)",
            border: "1px solid var(--border)", background: "var(--bg)",
            color: "var(--text-1)", fontSize: 14, marginBottom: 12, outline: "none",
          }}
        />
        {authError && (
          <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>{authError}</p>
        )}
        <button
          onClick={handleLogin}
          disabled={authLoading}
          className="btn btn-primary btn-lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {authLoading ? "Authenticating..." : "Access Dashboard"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutShell>
      <AuthGate>{children}</AuthGate>
    </LayoutShell>
  );
}
