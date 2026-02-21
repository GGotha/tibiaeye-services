"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    description: "Perfeito para começar",
    price: {
      monthly: 0,
      yearly: 0,
    },
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
    price: {
      monthly: 29.9,
      yearly: 24.9,
    },
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
    price: {
      monthly: 99.9,
      yearly: 79.9,
    },
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
    <section id="pricing" className="py-24 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-emerald-400 font-semibold mb-4"
          >
            PRICING
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Planos simples e transparentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            Comece grátis. Upgrade quando precisar.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 rounded-full bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billingCycle === "yearly"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Anual
              <span className="text-xs bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-2xl border transition-all",
                plan.popular
                  ? "bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/50 scale-105"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-black text-sm font-semibold">
                    <Sparkles className="h-3 w-3" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R${plan.price[billingCycle].toFixed(2).replace(".", ",")}
                  </span>
                  {plan.price.monthly > 0 && <span className="text-slate-400">/mês</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.name)}
                className={cn(
                  "w-full",
                  plan.popular
                    ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                    : "bg-slate-800 hover:bg-slate-700 text-white"
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
