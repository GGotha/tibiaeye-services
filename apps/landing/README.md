# TibiaEye Landing Page

Landing page for TibiaEye - a pixel bot for Tibia with real-time dashboard monitoring.

## Tech Stack

- Next.js 16.1
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI

## Getting Started

### Prerequisites

- Node.js 20+
- Bun

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env.local

# Start development server
bun dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Dashboard app URL |
| `API_URL` | Backend API URL |
| `API_INTERNAL_TOKEN` | Internal API token for server-to-server communication |
| `ABACATEPAY_API_KEY` | AbacatePay API key |
| `ABACATEPAY_WEBHOOK_SECRET` | AbacatePay webhook secret |
| `ABACATEPAY_PRO_MONTHLY_PRICE_ID` | Price ID for Pro monthly plan |
| `ABACATEPAY_PRO_YEARLY_PRICE_ID` | Price ID for Pro yearly plan |
| `ABACATEPAY_ENTERPRISE_MONTHLY_PRICE_ID` | Price ID for Enterprise monthly plan |
| `ABACATEPAY_ENTERPRISE_YEARLY_PRICE_ID` | Price ID for Enterprise yearly plan |

### Scripts

```bash
# Development
bun dev

# Build
bun run build

# Start production server
bun start

# Type check
bun run typecheck

# Lint
bun run lint
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts    # Checkout API route
│   │   └── webhook/route.ts     # AbacatePay webhook
│   ├── docs/page.tsx            # Documentation page
│   ├── pricing/page.tsx         # Pricing page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── robots.ts                # robots.txt
│   └── sitemap.ts               # sitemap.xml
├── components/
│   ├── landing/                 # Landing page sections
│   │   ├── cta.tsx
│   │   ├── faq.tsx
│   │   ├── features.tsx
│   │   ├── hero.tsx
│   │   ├── how-it-works.tsx
│   │   ├── live-demo.tsx
│   │   ├── pricing-table.tsx
│   │   ├── requirements.tsx
│   │   ├── stats.tsx
│   │   ├── testimonials.tsx
│   │   └── what-is-it.tsx
│   ├── layout/                  # Layout components
│   │   ├── footer.tsx
│   │   └── navbar.tsx
│   └── ui/                      # UI components
│       ├── accordion.tsx
│       └── button.tsx
└── lib/
    ├── abacatepay.ts            # AbacatePay SDK
    └── utils.ts                 # Utility functions
```
