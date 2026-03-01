"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Features", href: "#features" },
  { name: "Como Funciona", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-[#06060B]/70 backdrop-blur-2xl" : "bg-transparent"
      )}
    >
      {/* Bottom gradient line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(16,185,129,0.2), rgba(6,182,212,0.2), transparent)",
        }}
      />

      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Eye className="h-4.5 w-4.5 text-[#06060B]" />
          </div>
          <span className="text-lg font-bold text-white tracking-[-0.02em]">TibiaEye</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-300 text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://app.tibiaeye.com/auth/login"
            className="text-[#64748B] hover:text-[#F8FAFC] transition-colors duration-300 text-sm font-medium"
          >
            Login
          </Link>
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] transition-all duration-300"
          >
            <Link href="https://app.tibiaeye.com/auth/signup">Começar Grátis</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#06060B]/95 backdrop-blur-2xl border-b border-white/[0.06]"
          >
            <div className="px-6 py-6 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-[#94A3B8] hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full border-white/[0.06] text-white hover:bg-white/[0.04]" asChild>
                  <Link href="https://app.tibiaeye.com/auth/login">Login</Link>
                </Button>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold" asChild>
                  <Link href="https://app.tibiaeye.com/auth/signup">Começar Grátis</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
