"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const plans = [
  {
    name: "Starter",
    description: "Perfeito para começar",
    price: { monthly: 0, yearly: 0 },
    features: [
      "1 personagem",
      "7 dias de histórico",
      "XP/h básico",
      "Kills tracking",
      "Suporte via Discord",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    description: "Para hunters sérios",
    price: { monthly: 29.9, yearly: 24.9 },
    features: [
      "5 personagens",
      "30 dias de histórico",
      "XP/h em tempo real",
      "Mapa ao vivo",
      "Analytics de loot",
      "API access",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Para times e guilds",
    price: { monthly: 99.9, yearly: 79.9 },
    features: [
      "Personagens ilimitados",
      "Histórico ilimitado",
      "Todas as features Pro",
      "Guild dashboard",
      "Webhooks customizados",
      "API rate limit aumentado",
      "Suporte dedicado",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleCheckout = async (planName: string) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: planName.toLowerCase(),
        billingCycle,
      }),
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  };

  return (
    <section id="pricing" className="relative py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={spring}
            className="text-xs uppercase tracking-[0.15em] text-emerald-400 font-medium mb-5"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.05 }}
            className="text-4xl md:text-6xl font-bold text-[#F8FAFC] tracking-[-0.03em] mb-6"
          >
            Planos simples e transparentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-[#94A3B8] text-lg"
          >
            Comece grátis. Upgrade quando precisar.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-16">
          <div className="relative inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {/* Sliding indicator */}
            <motion.div
              layout
              className="absolute top-1 bottom-1 rounded-full bg-emerald-500"
              style={{
                left: billingCycle === "monthly" ? "4px" : "50%",
                width: "calc(50% - 4px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                billingCycle === "monthly" ? "text-black" : "text-[#94A3B8]"
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2",
                billingCycle === "yearly" ? "text-black" : "text-[#94A3B8]"
              )}
            >
              Anual
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full transition-colors duration-200",
                  billingCycle === "yearly"
                    ? "bg-black/20 text-black"
                    : "bg-emerald-500/15 text-emerald-400"
                )}
              >
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-2xl transition-all",
                plan.popular
                  ? "gradient-border glass-card shadow-[0_0_60px_-15px_rgba(16,185,129,0.15)]"
                  : "glass-card-hover"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-black text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-[#F8FAFC] mb-1 tracking-[-0.01em]">
                  {plan.name}
                </h3>
                <p className="text-[#64748B] text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <motion.span
                    key={`${plan.name}-${billingCycle}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-5xl font-bold text-[#F8FAFC] tracking-[-0.03em]"
                  >
                    R${plan.price[billingCycle].toFixed(2).replace(".", ",")}
                  </motion.span>
                  {plan.price.monthly > 0 && (
                    <span className="text-[#64748B] text-sm">/mês</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-[#94A3B8] text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.name)}
                className={cn(
                  "w-full transition-all duration-300",
                  plan.popular
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)]"
                    : "bg-white/[0.06] hover:bg-white/[0.1] text-[#F8FAFC] border border-white/[0.06]"
                )}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
