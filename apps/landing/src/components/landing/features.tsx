"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, Bot, Map as MapIcon, Package, Target } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Pixel Bot Inteligente",
    description:
      "Automação avançada que lê a tela em tempo real. Detecta monstros, itens, HP e mana através de análise de pixels.",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Targeting Automático",
    description:
      "Sistema de targeting inteligente com whitelist/blacklist. Ataca apenas os monstros que você configurar.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Package,
    title: "Auto Loot & Refill",
    description:
      "Coleta loot automaticamente e gerencia seu refill de potions e supplies sem intervenção.",
    gradient: "from-blue-500 to-violet-500",
  },
  {
    icon: Activity,
    title: "XP/h em Tempo Real",
    description:
      "Acompanhe a experiência por hora do seu bot de qualquer lugar. Gráficos ao vivo atualizados a cada segundo.",
    gradient: "from-violet-500 to-pink-500",
  },
  {
    icon: MapIcon,
    title: "Mapa ao Vivo",
    description:
      "Veja exatamente onde seu personagem está no mapa em tempo real, direto no seu celular ou outro PC.",
    gradient: "from-pink-500 to-red-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Completo",
    description:
      "Histórico de todas as sessões, comparativos de XP/h, breakdown de kills e loot value detalhado.",
    gradient: "from-red-500 to-orange-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            FEATURES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Tudo que você precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Ferramentas profissionais para otimizar sua experiência de hunting.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>

              {/* Hover glow */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
