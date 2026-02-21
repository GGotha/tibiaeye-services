"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-slate-900 border border-emerald-500/20 p-8 md:p-12 text-center"
        >
          {/* Background effects */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Pronto para otimizar suas hunts?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Comece grátis hoje e descubra porque mais de 2,500 players confiam no TibiaEye.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                asChild
              >
                <Link href="#pricing">Ver Planos</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
