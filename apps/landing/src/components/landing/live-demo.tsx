"use client";

import { motion } from "framer-motion";
import { Activity, MapPin, Package, Skull } from "lucide-react";

export function LiveDemo() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            LIVE DEMO
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Veja o dashboard em ação
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Acompanhe XP/h, kills, loot e posição em tempo real - de qualquer dispositivo.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Dashboard mockup */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Knight Lvl 320 - Roshamuul</h3>
                <p className="text-slate-400 text-sm">Sessão ativa há 2h 34m</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 text-sm font-medium">Online</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: Activity,
                  label: "XP/hora",
                  value: "1.2M",
                  change: "+12%",
                },
                { icon: Skull, label: "Kills", value: "847", change: null },
                {
                  icon: Package,
                  label: "Loot Value",
                  value: "45.2k",
                  change: null,
                },
                { icon: MapPin, label: "Floor", value: "-2", change: null },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    {stat.change && <span className="text-emerald-400 text-sm">{stat.change}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* XP Chart mockup */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">XP ao longo do tempo</span>
                <div className="flex gap-2">
                  {["1h", "6h", "24h"].map((period) => (
                    <button
                      type="button"
                      key={period}
                      className={`px-3 py-1 rounded-md text-sm ${
                        period === "1h"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-48 flex items-end gap-1">
                {[
                  65, 72, 58, 85, 78, 92, 68, 75, 88, 62, 95, 70, 82, 55, 90, 73, 80, 67, 85, 60,
                  77, 93, 69, 84,
                ].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-500/20 rounded-t"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -left-4 top-1/4 hidden lg:block"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
              <p className="text-xs text-slate-400">Level Up!</p>
              <p className="text-emerald-400 font-semibold">320 → 321</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="absolute -right-4 bottom-1/4 hidden lg:block"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-xl">
              <p className="text-xs text-slate-400">Rare Drop</p>
              <p className="text-yellow-400 font-semibold">Demon Shield</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
