# TibiaEye Backoffice Admin Dashboard

## Overview
Admin dashboard for the TibiaEye platform management. Provides administrative access to user management, subscriptions, licenses, API keys, analytics, and platform settings.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Styling**: TailwindCSS + shadcn/ui components
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Linting**: Biome

## Project Structure
```
src/
├── components/
│   ├── cards/          # Metric, revenue, license stats cards
│   ├── charts/         # Revenue, users, usage charts + realtime bots
│   ├── layout/         # Admin sidebar, header, dashboard layout
│   ├── tables/         # Users, subscriptions, API keys, licenses tables
│   └── ui/             # shadcn/ui components (button, input, card, etc.)
├── contexts/
│   └── admin-auth-context.tsx  # Admin authentication with role verification
├── hooks/
│   ├── use-admin-auth.ts       # Auth hook re-export
│   ├── use-api-keys.ts         # API keys management
│   ├── use-licenses.ts         # License management + bulk actions
│   ├── use-plans.ts            # Subscription plans management
│   ├── use-platform-analytics.ts # Platform stats (30s), bots online (5s)
│   ├── use-settings.ts         # Feature flags + maintenance mode
│   ├── use-subscriptions.ts    # Subscription management
│   └── use-users.ts            # User management
├── lib/
│   ├── admin-api.ts    # Axios-based AdminApiClient
│   └── utils.ts        # Utility functions (cn, formatCurrency, etc.)
├── routes/             # TanStack Router file-based routes
│   ├── auth/login.tsx  # Admin login with role check
│   └── dashboard/      # Protected admin routes
├── types/
│   └── index.ts        # TypeScript types for admin entities
└── __tests__/
    └── setup.ts        # Vitest test setup
```

## Key Differences from Main App
- **Port**: 3002 (vs 3001 for main app)
- **Theme**: Red/orange primary color (vs emerald/cyan)
- **Auth**: Cookie-based authentication, requires `role: "admin"` on login
- **API Prefix**: `/api/v1/admin/*` endpoints

## Development
```bash
bun install
bun run dev       # Start on http://localhost:3002
bun run build     # Build for production
bun run lint      # Run Biome linter
bun run test      # Run Vitest tests
```

## Real-time Features
- Platform stats refresh every 30 seconds
- Bots online count refreshes every 5 seconds

## Admin Theme CSS Variables
```css
--primary: 0 84% 60%;           /* Red */
--primary-foreground: 0 0% 100%;
--accent: 25 95% 53%;           /* Orange */
--ring: 0 84% 60%;              /* Red ring */
```

## Route Structure
- `/` - Redirects to `/dashboard`
- `/auth/login` - Admin login page
- `/dashboard` - Overview with metrics + charts
- `/dashboard/users` - User management
- `/dashboard/users/:id` - User detail view
- `/dashboard/subscriptions` - Subscription list
- `/dashboard/subscriptions/plans` - Plans management
- `/dashboard/subscriptions/revenue` - Revenue analytics
- `/dashboard/licenses` - License management with bulk actions
- `/dashboard/api-keys` - API key management
- `/dashboard/analytics/usage` - Platform usage stats
- `/dashboard/analytics/bots-online` - Live bots monitoring
- `/dashboard/analytics/performance` - System health
- `/dashboard/settings/pricing` - Rate limits config
- `/dashboard/settings/features` - Feature flags + maintenance mode
