import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

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
        <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
          {children}
        </div>
      </body>
    </html>
  );
}
