"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const blurIn = (delay: number) => ({
  initial: { opacity: 0, y: 20, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { ...spring, delay },
});

const chartHeights = [65, 72, 58, 85, 78, 92, 68, 75, 88, 62, 95, 70, 82, 55, 90, 73, 80, 67, 85, 60, 77, 93, 69, 84];

const stats = [
  { label: "XP/h", value: "1.2M" },
  { label: "Kills", value: "847" },
  { label: "Loot", value: "45.2k" },
  { label: "Tempo", value: "2h 34m" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Deep background */}
      <div className="absolute inset-0 bg-[#06060B]" />

      {/* Radial top glow */}
      <div className="absolute inset-0 bg-radial-hero" />

      {/* Aurora orbs */}
      <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.07] blur-[120px] animate-aurora" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-cyan-500/[0.06] blur-[120px] animate-aurora-reverse" />
      <div className="absolute bottom-[10%] left-[40%] w-[450px] h-[450px] rounded-full bg-violet-500/[0.05] blur-[120px] animate-aurora-slow" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div {...blurIn(0)} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-sm font-medium">1,247 bots online agora</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...blurIn(0.1)}
          className="text-6xl md:text-8xl font-bold tracking-[-0.04em] text-[#F8FAFC] mb-8 leading-[0.95]"
        >
          Bot de Tibia com{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] animate-gradient-shift">
            Dashboard
          </span>
          <br />
          em Tempo Real
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          {...blurIn(0.2)}
          className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Pixel bot que automatiza suas hunts enquanto você acompanha tudo pelo dashboard.
          XP/h, kills, loot e posição no mapa — tudo ao vivo, de qualquer lugar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...blurIn(0.3)}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.5)] transition-all duration-300"
            asChild
          >
            <Link href="https://app.tibiaeye.com/auth/signup">
              Começar Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/[0.1] text-white hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-300"
          >
            <Play className="mr-2 h-4 w-4" />
            Ver Demo
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          {...blurIn(0.45)}
          className="mt-14 flex items-center justify-center gap-6"
        >
          <div className="flex -space-x-2.5">
            {[
              "from-emerald-400 to-cyan-400",
              "from-cyan-400 to-blue-400",
              "from-blue-400 to-violet-400",
              "from-violet-400 to-pink-400",
              "from-pink-400 to-emerald-400",
            ].map((gradient, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#06060B]`}
              />
            ))}
          </div>
          <p className="text-sm text-[#64748B]">
            <span className="text-[#F8FAFC] font-semibold">2,500+</span> players ativos
          </p>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ ...spring, delay: 0.6 }}
          className="mt-20 w-full max-w-5xl mx-auto"
        >
          <div className="relative" style={{ perspective: "1200px" }}>
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06060B] via-[#06060B]/80 to-transparent z-20 pointer-events-none" />

            {/* Dashboard card */}
            <div
              className="rounded-2xl border border-white/[0.06] bg-[#0C0C14] p-5 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_100px_-20px_rgba(16,185,129,0.08)]"
              style={{
                transform: "rotateX(5deg)",
                transformOrigin: "center bottom",
              }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <div className="ml-4 flex-1 h-7 rounded-lg bg-white/[0.04] flex items-center px-3">
                  <span className="text-xs text-[#64748B]">app.tibiaeye.com/dashboard</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...spring, delay: 0.8 + i * 0.08 }}
                    className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 text-center"
                  >
                    <p className="text-[#64748B] text-xs mb-1.5 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-emerald-400 text-2xl md:text-3xl font-bold font-mono tabular-nums">
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#F8FAFC] text-sm font-medium">XP ao longo do tempo</span>
                  <div className="flex gap-1.5">
                    {["1h", "6h", "24h"].map((period) => (
                      <span
                        key={period}
                        className={`px-2.5 py-1 rounded-md text-xs ${
                          period === "1h"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "text-[#64748B]"
                        }`}
                      >
                        {period}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="h-32 md:h-44 flex items-end gap-[3px]">
                  {chartHeights.map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        duration: 0.6,
                        delay: 1.0 + i * 0.03,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-500/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
