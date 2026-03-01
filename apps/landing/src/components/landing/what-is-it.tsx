"use client";

import { motion } from "framer-motion";
import { Bot, Monitor, Wifi } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const features = [
  {
    icon: Bot,
    title: "Pixel Bot Inteligente",
    description:
      "Automação que lê a tela do jogo em tempo real. Detecta monstros, itens, HP e mana através de análise de pixels.",
  },
  {
    icon: Monitor,
    title: "Sem Modificar Arquivos",
    description:
      "Não altera nenhum arquivo do jogo. Funciona simulando inputs de mouse e teclado como um jogador real.",
  },
  {
    icon: Wifi,
    title: "Dashboard Remoto",
    description:
      "Acompanhe suas hunts de qualquer lugar. Celular, tablet ou outro PC - tudo sincronizado em tempo real.",
  },
];

export function WhatIsIt() {
  return (
    <section className="relative py-32">
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-32">
        {/* Header - left aligned */}
        <div className="max-w-3xl mb-20">
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5"
          >
            Produto
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            Bot de Tibia com Dashboard
            <br />
            em Tempo Real
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg leading-relaxed"
          >
            TibiaEye é um pixel bot que automatiza suas hunts, looting e navegação, enquanto
            você acompanha tudo em tempo real através de um dashboard moderno.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: index * 0.1 }}
              className="glass-card-hover rounded-2xl p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC] mb-3 tracking-[-0.01em]">
                {feature.title}
              </h3>
              <p className="text-[#94A3B8] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
