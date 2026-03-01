"use client";

import { motion } from "framer-motion";
import { CheckCircle, Monitor } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const items = [
  {
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    text: "O Tibia precisa estar rodando e visível na tela",
  },
  {
    icon: CheckCircle,
    iconColor: "text-emerald-400",
    text: "Não minimize nem cubra a janela do jogo",
  },
  {
    icon: Monitor,
    iconColor: "text-cyan-400",
    text: "Recomendado: Use um segundo monitor",
    bold: "Recomendado:",
  },
  {
    icon: Monitor,
    iconColor: "text-cyan-400",
    text: "Alternativa: Use uma máquina virtual",
    bold: "Alternativa:",
  },
];

export function Requirements() {
  return (
    <section className="relative py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={spring}
          className="relative glass-card rounded-2xl p-8 md:p-10 overflow-hidden"
        >
          {/* Left accent bar */}
          <div className="absolute left-0 top-6 bottom-6 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />

          <div className="pl-6">
            <p className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-3">
              Configuração recomendada
            </p>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3 tracking-[-0.01em]">
              Tela Aberta Necessária
            </h3>
            <p className="text-[#94A3B8] mb-6">
              O TibiaEye é um <strong className="text-[#F8FAFC]">pixel bot</strong> — ele funciona
              lendo a imagem da tela do jogo em tempo real.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <item.icon className={`h-5 w-5 mt-0.5 shrink-0 ${item.iconColor}`} />
                  <span className="text-[#94A3B8] text-sm">
                    {item.bold ? (
                      <>
                        <strong className="text-[#F8FAFC]">{item.bold}</strong>{" "}
                        {item.text.replace(item.bold, "").trim()}
                      </>
                    ) : (
                      item.text
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
