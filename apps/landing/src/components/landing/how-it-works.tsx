"use client";

import { motion } from "framer-motion";
import { BarChart3, Download, Monitor } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const steps = [
  {
    icon: Download,
    title: "Instale e Configure",
    description:
      "Baixe o TibiaEye, insira sua license key e configure suas preferências de hunt, targeting e loot.",
  },
  {
    icon: Monitor,
    title: "Deixe o Tibia Visível",
    description:
      "O bot lê os pixels da tela em tempo real. Mantenha a janela do Tibia visível - use um segundo monitor ou VM dedicada.",
    badge: "Tela aberta necessária",
  },
  {
    icon: BarChart3,
    title: "Acompanhe pelo Dashboard",
    description:
      "Acesse o dashboard de qualquer dispositivo. Veja XP/h, kills, loot e posição ao vivo. Receba alertas importantes.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-32">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5"
          >
            Como Funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            Simples de usar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg max-w-2xl mx-auto"
          >
            Configure uma vez e acompanhe de qualquer lugar
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line - horizontal on desktop */}
          <div className="hidden md:block absolute top-[60px] left-[16.66%] right-[16.66%] h-px">
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(to right, rgba(16,185,129,0.3), rgba(6,182,212,0.3), rgba(16,185,129,0.3))",
              }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: index * 0.15 }}
                className="text-center relative"
              >
                {/* Step circle */}
                <div className="relative z-10 mx-auto w-[120px] h-[120px] mb-8">
                  <div className="gradient-border w-full h-full rounded-2xl bg-[#0C0C14] flex flex-col items-center justify-center">
                    <step.icon className="h-7 w-7 text-emerald-400 mb-1.5" />
                    <span className="text-xs text-[#64748B] font-mono">0{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3 tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="text-[#94A3B8] leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {/* Badge */}
                {step.badge && (
                  <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="text-amber-400 text-xs font-medium">{step.badge}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
