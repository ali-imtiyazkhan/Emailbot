"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { connectEmailAccount } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, X, Loader2 } from "lucide-react";

function OutlookCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"connecting" | "success" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state");

    if (error) {
      setStatus("error");
      setErrorMsg(error === "access_denied" ? "Access was denied by the user." : error);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code found in redirect URL.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const result = await connectEmailAccount("outlook", code, state || undefined);
        if (result.success) {
          if (result.token) setToken(result.token);
          setStatus("success");
          if (result.email) setEmail(result.email);

          // Notify parent window with the new token
          if (window.opener) {
            window.opener.postMessage({ type: "oauth-success", provider: "outlook", token: result.token }, window.location.origin);
          }

          // Auto close window after 2.5 seconds
          setTimeout(() => {
            window.close();
          }, 2500);
        } else {
          setStatus("error");
          setErrorMsg("Failed to connect Outlook account.");
        }
      } catch (err: any) {
        console.error("Outlook OAuth exchange error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to exchange authorization code.");
      }
    };

    exchangeCode();
  }, [searchParams]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#050505",
        fontFamily: "var(--font-sans), sans-serif",
        color: "var(--text-1)",
        padding: 24,
      }}
    >
      {/* Background radial spotlight (Microsoft Blue) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 600,
          height: 400,
          background: "radial-gradient(ellipse at 50% 0%, rgba(96, 165, 250, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 40,
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.02) inset",
          position: "relative",
          zIndex: 1,
        }}
      >
        <AnimatePresence mode="wait">
          {status === "connecting" && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div style={{ position: "relative", marginBottom: 24 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.06)",
                    borderTopColor: "#60a5fa",
                  }}
                />
                <Mail
                  size={22}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "#60a5fa",
                    opacity: 0.8,
                  }}
                />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em" }}>
                Connecting Outlook
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
                Exchanging authentication tokens with Microsoft. Please hold on...
              </p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(96, 165, 250, 0.1)",
                  border: "1px solid #60a5fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  marginBottom: 24,
                  boxShadow: "0 0 20px rgba(96, 165, 250, 0.2)",
                }}
              >
                <Check size={28} strokeWidth={3} />
              </motion.div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#60a5fa" }}>
                Connection Successful
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 4, lineHeight: 1.6 }}>
                Your Outlook account has been successfully linked.
              </p>
              {email && (
                <p style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-1)", marginBottom: 24 }}>
                  {email}
                </p>
              )}
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Loader2 size={12} className="animate-spin" />
                Auto-closing this tab shortly...
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid #ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                  marginBottom: 24,
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
                }}
              >
                <X size={28} strokeWidth={3} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "#ef4444" }}>
                Connection Failed
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 28, lineHeight: 1.6 }}>
                {errorMsg || "An error occurred during account authorization."}
              </p>
              <button
                type="button"
                onClick={() => window.close()}
                className="btn btn-secondary"
                style={{ minWidth: 120, justifyContent: "center" }}
              >
                Close Window
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function OutlookCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#050505",
            color: "var(--text-2)",
            fontSize: 14,
          }}
        >
          Initializing...
        </div>
      }
    >
      <OutlookCallbackContent />
    </Suspense>
  );
}
