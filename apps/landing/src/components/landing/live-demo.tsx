"use client";

import { motion, useInView } from "framer-motion";
import { Activity, MapPin, Package, Skull } from "lucide-react";
import { useRef } from "react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const chartData = [65, 72, 58, 85, 78, 92, 68, 75, 88, 62, 95, 70, 82, 55, 90, 73, 80, 67, 85, 60, 77, 93, 69, 84];

const stats = [
  { icon: Activity, label: "XP/hora", value: "1.2M", change: "+12%" },
  { icon: Skull, label: "Kills", value: "847", change: null },
  { icon: Package, label: "Loot Value", value: "45.2k", change: null },
  { icon: MapPin, label: "Floor", value: "-2", change: null },
];

export function LiveDemo() {
  const chartRef = useRef<HTMLDivElement>(null);
  const isChartInView = useInView(chartRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-32">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5"
          >
            Live Demo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            Veja o dashboard em ação
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg max-w-2xl mx-auto"
          >
            Acompanhe XP/h, kills, loot e posição em tempo real — de qualquer dispositivo.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.15 }}
          className="relative"
        >
          {/* Dashboard mockup */}
          <div className="rounded-2xl glass-card p-5 md:p-8">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <div className="ml-4 flex-1 h-7 rounded-lg bg-white/[0.04] flex items-center px-3">
                <span className="text-xs text-[#64748B]">app.tibiaeye.com/dashboard</span>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#F8FAFC]">Knight Lvl 320 - Roshamuul</h3>
                <p className="text-[#64748B] text-sm">Sessão ativa há 2h 34m</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 text-sm font-medium">Online</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-[#64748B]" />
                    <span className="text-[#64748B] text-xs">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#F8FAFC] font-mono tabular-nums">
                      {stat.value}
                    </span>
                    {stat.change && (
                      <span className="text-emerald-400 text-xs font-medium">{stat.change}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* XP Chart */}
            <div ref={chartRef} className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4">
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
              <div className="h-48 flex items-end gap-[3px]">
                {chartData.map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-500/10 transition-all duration-700 ease-out"
                    style={{
                      height: isChartInView ? `${height}%` : "0%",
                      transitionDelay: `${i * 30}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.4 }}
            className="absolute -left-3 top-1/4 hidden lg:block animate-float"
          >
            <div className="glass-card rounded-xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
              <p className="text-xs text-[#64748B] mb-1">Level Up!</p>
              <p className="text-emerald-400 font-semibold font-mono">320 → 321</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.5 }}
            className="absolute -right-3 bottom-1/3 hidden lg:block animate-float-delayed"
          >
            <div className="glass-card rounded-xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
              <p className="text-xs text-[#64748B] mb-1">Rare Drop</p>
              <p className="text-yellow-400 font-semibold">Demon Shield</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
