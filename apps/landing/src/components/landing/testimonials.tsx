"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rafael M.",
    role: "Knight 450+",
    content:
      "Uso o TibiaEye há 6 meses e o dashboard mudou completamente como acompanho minhas hunts. Agora consigo ver o XP/h do celular enquanto trabalho.",
    rating: 5,
  },
  {
    name: "Lucas S.",
    role: "Druid 380+",
    content:
      "O melhor pixel bot que já usei. A detecção é precisa e o dashboard em tempo real é um diferencial enorme. Vale cada centavo do Pro.",
    rating: 5,
  },
  {
    name: "Mariana K.",
    role: "Paladin 290+",
    content:
      "Comecei com o plano gratuito e em uma semana já fiz upgrade pro Pro. Os gráficos de XP/h me ajudam a otimizar minhas rotas.",
    rating: 5,
  },
  {
    name: "Pedro H.",
    role: "Sorcerer 410+",
    content:
      "O alerta de death no celular já me salvou várias vezes. O suporte também é excelente, respondem rápido no Discord.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            TESTIMONIALS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            O que dizem nossos usuários
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Mais de 2,500 players confiam no TibiaEye para suas hunts.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400" />
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
