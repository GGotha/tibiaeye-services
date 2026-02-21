# TibiaEye Landing Page

## Visão Geral

Landing page para o TibiaEye - um pixel bot para Tibia com dashboard de monitoramento em tempo real.

## Stack Técnica

- **Framework**: Next.js 16.1 (App Router)
- **Runtime**: Bun
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Componentes UI**: Radix UI (accordion, slot)
- **Ícones**: Lucide React, Phosphor Icons

## Estrutura do Projeto

```
src/
├── app/                    # App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Checkout AbacatePay
│   │   └── webhook/       # Webhooks AbacatePay
│   ├── docs/              # Página de documentação
│   ├── pricing/           # Página de preços
│   ├── layout.tsx         # Root layout com metadata SEO
│   └── page.tsx           # Home page
├── components/
│   ├── landing/           # Seções da landing page
│   ├── layout/            # Navbar e Footer
│   └── ui/                # Componentes base (Button, Accordion)
└── lib/
    ├── abacatepay.ts      # SDK de pagamentos
    └── utils.ts           # Utilitários (cn helper)
```

## Comandos

```bash
bun dev          # Desenvolvimento com Turbopack
bun run build    # Build de produção
bun start        # Servidor de produção
bun run typecheck # Verificação de tipos
```

## Convenções

### Estilo de Código
- Usar aspas duplas em strings
- Componentes em PascalCase
- Arquivos em kebab-case
- "use client" apenas quando necessário (hooks, eventos)

### Design System
- **Cores**: emerald-500 (primária), cyan-400 (secundária), slate-950 (background)
- **Modo**: Dark mode como padrão
- **Tipografia**: Inter (sans), JetBrains Mono (mono)
- **Bordas**: rounded-lg, rounded-xl, rounded-2xl

### Animações (Framer Motion)
- Usar `whileInView` com `viewport={{ once: true }}` para animações de entrada
- Delays escalonados em listas: `delay: index * 0.1`
- Transições suaves: `transition={{ duration: 0.6 }}`

### Textos
- Todo texto em português brasileiro com acentuação correta
- CTAs principais: "Começar Grátis"
- Evitar emojis no código

## Integrações

### AbacatePay
- Checkout via POST `/api/checkout`
- Webhooks: `subscription.created`, `subscription.cancelled`, `payment.failed`
- Variáveis de ambiente necessárias no `.env.local`

## Seções da Landing Page

1. Hero - Headline com badge de status ao vivo
2. What Is It - Explicação do produto
3. How It Works - 3 passos de uso
4. Features - Grid 3x2 de funcionalidades
5. Live Demo - Mockup interativo do dashboard
6. Requirements - Aviso sobre tela aberta
7. Stats - Métricas do produto
8. Pricing - 3 planos (Starter, Pro, Enterprise)
9. Testimonials - Depoimentos de usuários
10. FAQ - Perguntas frequentes com accordion
11. CTA - Call to action final
12. Footer - Links e informações
