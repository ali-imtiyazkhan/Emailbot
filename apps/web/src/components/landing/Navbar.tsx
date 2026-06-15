"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import LogoMark from "./LogoMark";
import AppleButton from "./AppleButton";

const LINKS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Emails", href: "/emails" },
  { name: "Analytics", href: "/analytics" },
  { name: "Rules", href: "/rules" },
  { name: "Settings", href: "/settings" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-50"
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" aria-label="EmailBot home">
          <LogoMark />
        </Link>

        <div className="hidden md:flex gap-8">
          {LINKS.map((link, i) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.05,
                ease: "easeOut",
              }}
            >
              <Link
                href={link.href}
                className="text-white/70 text-sm font-medium hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="hidden md:block">
          <AppleButton />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 inline-flex items-center justify-center relative z-50 focus:outline-none"
        >
          {isOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-20 left-0 right-0 border-b border-white/10 bg-[#0c0c0cd9] backdrop-blur-xl z-40 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 text-base font-medium hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/5">
                <AppleButton full />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
