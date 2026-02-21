"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BarChart3, Download, Monitor } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "01",
    title: "Instale e Configure",
    description:
      "Baixe o TibiaEye, insira sua license key e configure suas preferências de hunt, targeting e loot.",
    highlight: false,
  },
  {
    icon: Monitor,
    step: "02",
    title: "Deixe o Tibia Visível",
    description:
      "O bot lê os pixels da tela em tempo real. Mantenha a janela do Tibia visível - use um segundo monitor ou VM dedicada.",
    highlight: true,
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Acompanhe pelo Dashboard",
    description:
      "Acesse o dashboard de qualquer dispositivo. Veja XP/h, kills, loot e posição ao vivo. Receba alertas importantes.",
    highlight: false,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            COMO FUNCIONA
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Simples de usar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Configure uma vez e acompanhe de qualquer lugar
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-2xl border transition-all",
                step.highlight
                  ? "bg-yellow-500/5 border-yellow-500/30"
                  : "bg-slate-900/50 border-slate-800"
              )}
            >
              {/* Step number */}
              <span className="text-6xl font-bold text-slate-800 absolute top-4 right-4">
                {step.step}
              </span>

              {/* Icon */}
              <div
                className={cn(
                  "inline-flex p-3 rounded-xl mb-4",
                  step.highlight ? "bg-yellow-500/10" : "bg-emerald-500/10"
                )}
              >
                <step.icon
                  className={cn("h-6 w-6", step.highlight ? "text-yellow-400" : "text-emerald-400")}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.description}</p>

              {/* Warning badge for step 2 */}
              {step.highlight && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-yellow-400 text-sm font-medium">
                    Tela aberta necessária
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
