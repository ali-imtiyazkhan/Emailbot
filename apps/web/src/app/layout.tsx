import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EmailBot | Intelligent Digest & Forwarding",
  description: "Automate your inbox with AI-powered digests and custom forwarding rules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="font-outfit">
        <div className="min-h-screen bg-[#050816] text-slate-50 selection:bg-indigo-500/30">
          {/* Animated mesh background */}
          <div className="mesh-bg" />

          {/* Sidebar */}
          <Sidebar />

          {/* Main content area — offset by sidebar on desktop */}
          <main className="relative z-10 lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
