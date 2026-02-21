"use client";

import { motion } from "framer-motion";
import { Bot, Monitor, Wifi } from "lucide-react";

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
    <section className="py-24 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            O QUE É O TIBIAEYE?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Bot de Tibia com Dashboard
            <br />
            em Tempo Real
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            TibiaEye é um pixel bot que automatiza suas hunts, looting e navegação, enquanto você
            acompanha tudo em tempo real através de um dashboard moderno.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-4">
                <feature.icon className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
