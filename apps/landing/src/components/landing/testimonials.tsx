"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

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
  {
    name: "Thiago R.",
    role: "Knight 520+",
    content:
      "A guild inteira migrou para o TibiaEye Enterprise. O guild dashboard é sensacional para coordenar hunts em grupo.",
    rating: 5,
  },
  {
    name: "Ana P.",
    role: "Druid 350+",
    content:
      "Interface limpa e responsiva. Consigo monitorar minha hunt até pelo celular no metrô. Muito acima da concorrência.",
    rating: 5,
  },
];

function TestimonialCard({ testimonial }: { testimonial: (typeof testimonials)[0] }) {
  return (
    <div className="glass-card rounded-2xl p-6 min-w-[340px] max-w-[340px] flex-shrink-0 mx-2.5">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-[#94A3B8] text-sm leading-relaxed mb-5">{testimonial.content}</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex-shrink-0" />
        <div>
          <p className="text-[#F8FAFC] text-sm font-medium">{testimonial.name}</p>
          <p className="text-[#64748B] text-xs">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3, 6);

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="section-divider" />

      <div className="pt-32">
        {/* Header */}
        <div className="text-center mb-16 px-6">
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            O que dizem nossos usuários
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg max-w-2xl mx-auto"
          >
            Mais de 2,500 players confiam no TibiaEye para suas hunts.
          </motion.p>
        </div>

        {/* Marquee row 1 */}
        <div className="relative mb-5 group">
          <div className="flex animate-marquee hover:[animation-play-state:paused]">
            {[...row1, ...row1, ...row1, ...row1].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} testimonial={t} />
            ))}
          </div>
          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#06060B] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#06060B] to-transparent pointer-events-none z-10" />
        </div>

        {/* Marquee row 2 - reverse direction */}
        <div className="relative group">
          <div className="flex animate-marquee-reverse hover:[animation-play-state:paused]">
            {[...row2, ...row2, ...row2, ...row2].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} testimonial={t} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#06060B] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#06060B] to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}
