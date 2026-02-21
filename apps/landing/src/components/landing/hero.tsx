"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 bg-center opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-sm font-medium">1,247 bots online agora</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Bot de Tibia com{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Dashboard
          </span>
          <br />
          em Tempo Real
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
        >
          Pixel bot que automatiza suas hunts enquanto você acompanha tudo pelo dashboard. XP/h,
          kills, loot e posição no mapa - tudo ao vivo, de qualquer lugar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8"
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
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Play className="mr-2 h-4 w-4" />
            Ver Demo
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-8 text-slate-500"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-2 border-slate-900"
              />
            ))}
          </div>
          <p className="text-sm">
            <span className="text-white font-semibold">2,500+</span> players ativos
          </p>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-t-xl border border-slate-800 shadow-2xl bg-slate-900/50 p-4 md:p-8">
              {/* Mock Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "XP/h", value: "1.2M" },
                  { label: "Kills", value: "847" },
                  { label: "Loot", value: "45.2k" },
                  { label: "Tempo", value: "2h 34m" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                    <p className="text-emerald-400 text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-32 md:h-48 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="text-slate-500 text-sm">Gráfico de XP em tempo real</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
