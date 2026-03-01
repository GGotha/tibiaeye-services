"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, Bot, Map as MapIcon, Package, Target } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const features = [
  {
    icon: Bot,
    title: "Pixel Bot Inteligente",
    description:
      "Automação avançada que lê a tela em tempo real. Detecta monstros, itens, HP e mana através de análise de pixels.",
    gradient: "from-emerald-500 to-cyan-500",
    span: "md:col-span-2",
  },
  {
    icon: Target,
    title: "Targeting Automático",
    description:
      "Sistema de targeting inteligente com whitelist/blacklist. Ataca apenas os monstros que você configurar.",
    gradient: "from-cyan-500 to-blue-500",
    span: "",
  },
  {
    icon: Package,
    title: "Auto Loot & Refill",
    description:
      "Coleta loot automaticamente e gerencia seu refill de potions e supplies sem intervenção.",
    gradient: "from-blue-500 to-violet-500",
    span: "",
  },
  {
    icon: Activity,
    title: "XP/h em Tempo Real",
    description:
      "Acompanhe a experiência por hora do seu bot de qualquer lugar. Gráficos ao vivo atualizados a cada segundo.",
    gradient: "from-violet-500 to-pink-500",
    span: "md:col-span-2",
  },
  {
    icon: MapIcon,
    title: "Mapa ao Vivo",
    description:
      "Veja exatamente onde seu personagem está no mapa em tempo real, direto no seu celular ou outro PC.",
    gradient: "from-pink-500 to-red-500",
    span: "md:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Analytics Completo",
    description:
      "Histórico de todas as sessões, comparativos de XP/h, breakdown de kills e loot value detalhado.",
    gradient: "from-red-500 to-orange-500",
    span: "",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
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
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            Tudo que você precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg max-w-2xl mx-auto"
          >
            Ferramentas profissionais para otimizar sua experiência de hunting.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: index * 0.08 }}
              className={`group relative p-7 rounded-2xl glass-card-hover overflow-hidden ${feature.span}`}
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2 tracking-[-0.01em]">
                {feature.title}
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{feature.description}</p>

              {/* Hover glow */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
