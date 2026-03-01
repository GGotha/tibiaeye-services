"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden aurora-bg">
      {/* Aurora orbs */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.06] blur-[120px] animate-aurora" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-cyan-500/[0.05] blur-[120px] animate-aurora-reverse" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/[0.04] blur-[120px] animate-aurora-slow" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={spring}
          className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
        >
          Pronto para otimizar
          <br />
          suas hunts?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.1 }}
          className="text-[#94A3B8] text-lg mb-10 max-w-xl mx-auto"
        >
          Comece grátis hoje e descubra porque mais de 2,500 players confiam no TibiaEye.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ ...spring, delay: 0.2 }}
          className="flex flex-col items-center gap-4"
        >
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-10 h-14 text-base shadow-[0_0_40px_-8px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_-8px_rgba(16,185,129,0.5)] transition-all duration-300"
            asChild
          >
            <Link href="https://app.tibiaeye.com/auth/signup">
              Começar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-[#64748B] text-sm">
            Grátis para sempre no plano Starter
          </p>
        </motion.div>
      </div>
    </section>
  );
}
