# Tarefa: Criar Landing Page para TibiaEye

## Contexto

Você está criando a landing page do **TibiaEye** - um **bot automatizado para Tibia** com dashboard de monitoramento em tempo real.

### O que é o TibiaEye?

TibiaEye é um **pixel bot** para Tibia que automatiza hunts, looting e navegação, permitindo que você acompanhe tudo em tempo real através de um dashboard moderno.

### O que é um Pixel Bot?

Um **pixel bot** é um tipo de automação que funciona **lendo os pixels da tela** do jogo em tempo real. Diferente de memory bots (que acessam a memória do jogo), o pixel bot:

- **Analisa a imagem** da tela para identificar monstros, itens, HP, mana, etc.
- **Simula inputs** de mouse e teclado como um jogador real
- **Não modifica** nenhum arquivo do jogo
- **Requer a tela visível** - o jogo precisa estar aberto e visível na tela

### Requisito Importante: Tela Aberta

O TibiaEye precisa que o **Tibia esteja rodando em primeiro plano** com a janela visível. Isso porque:
- O bot lê os pixels diretamente da tela
- Minimizar ou cobrir a janela interrompe a detecção
- Recomendamos usar um **segundo monitor** ou **máquina virtual** dedicada

### Diferencial: Dashboard em Tempo Real

Enquanto outros bots rodam "às cegas", o TibiaEye oferece um **dashboard completo** onde você pode:
- Ver XP/h, kills e loot **ao vivo**
- Acompanhar a **posição no mapa** em tempo real
- Receber **alertas** de eventos importantes (death, level up, etc.)
- Analisar **histórico de sessões** com gráficos detalhados
- Gerenciar **múltiplos personagens** de um só lugar

## Stack

- NextJS 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion - **usar bastante para animações elegantes**:
  - Animações de entrada (fade in, slide up) nos elementos ao scroll
  - Hover effects suaves em cards e botões
  - Transições entre estados
  - Stagger animations em listas/grids
  - **Não exagerar**: manter performance e elegância, evitar animações que distraem
- Shadcn/ui
  - Para adicionar componentes: `pnpm dlx shadcn@latest add <component>`
  - Exemplo: `pnpm dlx shadcn@latest add alert`
- **Icons**: lucide-react (preferido) ou @phosphor-icons/react
- **3D (opcional)**: Three.js / React Three Fiber - para elementos 3D interativos na hero section ou backgrounds animados (ex: partículas, grid 3D, objetos flutuantes). Usar com moderação para não impactar performance.

## Design System

- Dark mode como padrão
- Cores principais: emerald-500 (#10b981), cyan-400, slate-950
- Tipografia: Inter (sans), JetBrains Mono (mono)
- Estilo: SaaS moderno inspirado em Linear, Vercel, AbacatePay
- Gradientes sutis, animações suaves, muito espaço negativo

## Estrutura de Arquivos

```
apps/landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout com metadata SEO
│   │   ├── page.tsx             # Home page
│   │   ├── pricing/page.tsx     # Pricing dedicado
│   │   ├── docs/page.tsx        # Docs
│   │   └── api/
│   │       ├── checkout/route.ts
│   │       └── webhook/route.ts
│   ├── components/
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   ├── stats.tsx
│   │   │   ├── pricing-table.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── faq.tsx
│   │   │   └── cta.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       └── footer.tsx
│   └── lib/
│       └── abacatepay.ts        # SDK AbacatePay
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Seções da Home Page (em ordem)

1. **Navbar** - Logo, links (Features, Pricing, Docs, How It Works), CTAs (Login, Signup)
2. **Hero** - Headline chamativa sobre bot + dashboard, subheadline, 2 CTAs, preview do dashboard
3. **What Is It** - Explicação clara: "Bot de Tibia com Dashboard em Tempo Real"
4. **How It Works** - 3 steps explicando o pixel bot (ver seção abaixo)
5. **Features** - Grid 3x2 com features do bot E do dashboard
6. **Live Demo** - Preview interativo ou GIF do dashboard mostrando XP/h ao vivo
7. **Requirements** - Card destacando que precisa da tela aberta (segundo monitor recomendado)
8. **Stats** - Métricas em tempo real (players, sessões, etc)
9. **Pricing** - 3 planos (Starter grátis, Pro R$29.90, Enterprise R$99.90)
10. **Testimonials** - 3-4 depoimentos de "usuários"
11. **FAQ** - 8-10 perguntas incluindo sobre pixel bot e tela aberta
12. **CTA** - Call to action final com gradiente
13. **Footer** - Links organizados, social, copyright

## Seção "How It Works" (Como Funciona)

Explicar em 3 passos simples:

### Passo 1: Instale e Configure
- Download do TibiaEye
- Insira sua license key
- Configure suas preferências de hunt

### Passo 2: Deixe o Tibia Visível
- O bot lê os pixels da tela em tempo real
- Mantenha a janela do Tibia **visível e em primeiro plano**
- Dica: Use um segundo monitor ou VM dedicada

### Passo 3: Acompanhe pelo Dashboard
- Acesse app.tibiaeye.com de qualquer dispositivo
- Veja XP/h, kills, loot e posição ao vivo
- Receba alertas e analise seu histórico

## Seção "Requirements" (Requisitos)

Card em destaque (com ícone de alerta amarelo) explicando:

**Importante: Tela Aberta Necessária**

O TibiaEye é um pixel bot - ele funciona lendo a imagem da tela do jogo. Por isso:

- O Tibia precisa estar **rodando e visível**
- Não minimize nem cubra a janela do jogo
- Recomendamos usar um **segundo monitor** ou uma **máquina virtual**
- O bot pausa automaticamente se a tela for obstruída

## Planos de Pricing

- **Starter (Grátis)**: 1 char, 7 dias histórico, XP/h básico (limited access)
- **Pro (R$29.90/mês)**: 5 chars, 30 dias, mapa ao vivo, API access
- **Enterprise (R$99.90/mês)**: Ilimitado, webhooks, SLA

## Integração AbacatePay

- Criar checkout via POST /api/checkout
- Webhook para subscription.created, subscription.cancelled, payment.failed
- Redirecionar para app após sucesso

## SEO

- Metadata completa (title, description, og:image)
- Sitemap automático
- robots.txt
- llms.txt
- Schema.org para SaaS product

## Componentes de Referência

### Hero Section

```tsx
// src/components/landing/hero.tsx

import { Button } from "@repo/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-400 text-sm font-medium">
            1,247 bots online agora
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Bot de Tibia com{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Dashboard
          </span>
          <br />
          em Tempo Real
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
        >
          Pixel bot que automatiza suas hunts enquanto você acompanha tudo pelo dashboard.
          XP/h, kills, loot e posição no mapa - tudo ao vivo, de qualquer lugar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8"
          >
            Começar Grátis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Play className="mr-2 h-4 w-4" />
            Ver Demo
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-8 text-slate-500"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-2 border-slate-900"
              />
            ))}
          </div>
          <p className="text-sm">
            <span className="text-white font-semibold">2,500+</span> players
            ativos
          </p>
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          <img
            src="/dashboard-preview.png"
            alt="Dashboard Preview"
            className="rounded-t-xl border border-slate-800 shadow-2xl"
          />
        </div>
      </motion.div>
    </section>
  );
}
```

### Features Section

```tsx
// src/components/landing/features.tsx

import { motion } from "framer-motion";
import { Activity, Map, Bot, Target, Package, BarChart3 } from "lucide-react";

const features = [
  // Bot Features
  {
    icon: Bot,
    title: "Pixel Bot Inteligente",
    description:
      "Automação avançada que lê a tela em tempo real. Detecta monstros, itens, HP e mana através de análise de pixels.",
    gradient: "from-emerald-500 to-cyan-500",
    category: "bot",
  },
  {
    icon: Target,
    title: "Targeting Automático",
    description:
      "Sistema de targeting inteligente com whitelist/blacklist. Ataca apenas os monstros que você configurar.",
    gradient: "from-cyan-500 to-blue-500",
    category: "bot",
  },
  {
    icon: Package,
    title: "Auto Loot & Refill",
    description:
      "Coleta loot automaticamente e gerencia seu refill de potions e supplies sem intervenção.",
    gradient: "from-blue-500 to-violet-500",
    category: "bot",
  },
  // Dashboard Features
  {
    icon: Activity,
    title: "XP/h em Tempo Real",
    description:
      "Acompanhe a experiência por hora do seu bot de qualquer lugar. Gráficos ao vivo atualizados a cada segundo.",
    gradient: "from-violet-500 to-pink-500",
    category: "dashboard",
  },
  {
    icon: Map,
    title: "Mapa ao Vivo",
    description:
      "Veja exatamente onde seu personagem está no mapa em tempo real, direto no seu celular ou outro PC.",
    gradient: "from-pink-500 to-red-500",
    category: "dashboard",
  },
  {
    icon: BarChart3,
    title: "Analytics Completo",
    description:
      "Histórico de todas as sessões, comparativos de XP/h, breakdown de kills e loot value detalhado.",
    gradient: "from-red-500 to-orange-500",
    category: "dashboard",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-emerald-400 font-semibold mb-4"
          >
            FEATURES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Tudo que você precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
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
```

### How It Works Section

```tsx
// src/components/landing/how-it-works.tsx

import { motion } from "framer-motion";
import { Download, Monitor, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "01",
    title: "Instale e Configure",
    description:
      "Baixe o TibiaEye, insira sua license key e configure suas preferências de hunt, targeting e loot.",
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
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-slate-900/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-emerald-400 font-semibold mb-4"
          >
            COMO FUNCIONA
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Simples de usar
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 mb-4">
                <step.icon className="h-6 w-6 text-emerald-400" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
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
```

### Requirements Section

```tsx
// src/components/landing/requirements.tsx

import { motion } from "framer-motion";
import { AlertTriangle, Monitor, CheckCircle } from "lucide-react";

export function Requirements() {
  return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Importante: Tela Aberta Necessária
              </h3>
              <p className="text-slate-400 mb-4">
                O TibiaEye é um <strong className="text-white">pixel bot</strong> -
                ele funciona lendo a imagem da tela do jogo em tempo real.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">
                    O Tibia precisa estar rodando e visível na tela
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <span className="text-slate-300">
                    Não minimize nem cubra a janela do jogo
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <span className="text-slate-300">
                    <strong className="text-white">Recomendado:</strong> Use um segundo monitor
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Monitor className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <span className="text-slate-300">
                    <strong className="text-white">Alternativa:</strong> Use uma máquina virtual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

### Pricing Table

```tsx
// src/components/landing/pricing-table.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@/lib/utils";

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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

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
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-emerald-400 font-semibold mb-4"
          >
            PRICING
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Planos simples e transparentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white",
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                billingCycle === "yearly"
                  ? "bg-emerald-500 text-black"
                  : "text-slate-400 hover:text-white",
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
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-2xl border transition-all",
                plan.popular
                  ? "bg-gradient-to-b from-emerald-950/50 to-slate-900 border-emerald-500/50 scale-105"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700",
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
                <h3 className="text-xl font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    R${plan.price[billingCycle].toFixed(2).replace(".", ",")}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-slate-400">/mês</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-slate-300"
                  >
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
                    : "bg-slate-800 hover:bg-slate-700 text-white",
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
```

### AbacatePay Integration

```typescript
// src/lib/abacatepay.ts

const ABACATEPAY_API_URL = "https://api.abacatepay.com/v1";

interface CreateCheckoutParams {
  plan: "starter" | "pro" | "enterprise";
  billingCycle: "monthly" | "yearly";
  customerId?: string;
  customerEmail?: string;
}

interface CheckoutResponse {
  id: string;
  url: string;
  expiresAt: string;
}

export class AbacatePay {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCheckout(
    params: CreateCheckoutParams,
  ): Promise<CheckoutResponse> {
    const priceId = this.getPriceId(params.plan, params.billingCycle);

    const response = await fetch(`${ABACATEPAY_API_URL}/billing/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
        customer: params.customerId
          ? { id: params.customerId }
          : { email: params.customerEmail },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout");
    }

    return response.json();
  }

  private getPriceId(plan: string, cycle: string): string {
    const prices: Record<string, Record<string, string>> = {
      pro: {
        monthly: process.env.ABACATEPAY_PRO_MONTHLY_PRICE_ID!,
        yearly: process.env.ABACATEPAY_PRO_YEARLY_PRICE_ID!,
      },
      enterprise: {
        monthly: process.env.ABACATEPAY_ENTERPRISE_MONTHLY_PRICE_ID!,
        yearly: process.env.ABACATEPAY_ENTERPRISE_YEARLY_PRICE_ID!,
      },
    };

    return prices[plan]?.[cycle] ?? "";
  }

  async verifyWebhook(payload: string, signature: string): Promise<boolean> {
    const crypto = await import("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", process.env.ABACATEPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}

export const abacatepay = new AbacatePay(process.env.ABACATEPAY_API_KEY!);
```

### API Routes

```typescript
// src/app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { abacatepay } from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, billingCycle, email } = body;

    if (plan === "starter") {
      return NextResponse.json({
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup`,
      });
    }

    const checkout = await abacatepay.createCheckout({
      plan,
      billingCycle,
      customerEmail: email,
    });

    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
```

```typescript
// src/app/api/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { abacatepay } from "@/lib/abacatepay";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-abacatepay-signature") ?? "";

    const isValid = await abacatepay.verifyWebhook(payload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    switch (event.type) {
      case "subscription.created":
        await activateSubscription(event.data);
        break;
      case "subscription.cancelled":
        await cancelSubscription(event.data);
        break;
      case "payment.failed":
        await notifyPaymentFailed(event.data);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function activateSubscription(data: any) {
  await fetch(`${process.env.API_URL}/api/v1/subscriptions/activate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({
      userId: data.customer.metadata.userId,
      planId: data.planId,
      externalId: data.subscriptionId,
    }),
  });
}

async function cancelSubscription(data: any) {
  await fetch(
    `${process.env.API_URL}/api/v1/subscriptions/cancel-by-external`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_INTERNAL_TOKEN}`,
      },
      body: JSON.stringify({
        externalId: data.subscriptionId,
      }),
    },
  );
}

async function notifyPaymentFailed(data: any) {
  // Implement email notification
}
```

### Navbar

```tsx
// src/components/layout/navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Docs", href: "/docs" },
  { name: "Blog", href: "/blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800"
          : "bg-transparent",
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
          <span className="text-xl font-bold text-white">TibiaEye</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="https://app.tibiaeye.com/auth/login"
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Login
          </Link>
          <Button
            asChild
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
          >
            <Link href="https://app.tibiaeye.com/auth/signup">
              Começar Grátis
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-slate-800"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-slate-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://app.tibiaeye.com/auth/login">
                    Login
                  </Link>
                </Button>
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
                  asChild
                >
                  <Link href="https://app.tibiaeye.com/auth/signup">
                    Começar Grátis
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

### Footer

```tsx
// src/components/layout/footer.tsx

import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400" />
              <span className="text-xl font-bold text-white">TibiaEye</span>
            </Link>
            <p className="text-slate-400 text-sm mb-4">
              Telemetria profissional para seu bot Tibia.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2024 TibiaEye. Todos os direitos reservados.
          </p>
          <p className="text-slate-500 text-sm">Made with love in Brazil</p>
        </div>
      </div>
    </footer>
  );
}
```

## Entregáveis

1. Código completo de todos os arquivos
2. package.json com todas as dependências
3. Instruções de como rodar

## Não fazer

- Não criar backend, apenas API routes do Next
- Não criar dashboard completo, apenas preview estático
- Não usar emojis no código

## Comece criando os arquivos na ordem:

1. package.json
2. next.config.js e tailwind.config.ts
3. layout.tsx com metadata
4. Componentes em ordem
5. API routes
