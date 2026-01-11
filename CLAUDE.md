# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kalash Heritage is a premium e-commerce platform for a carpet manufacturer in Pakistan. Built with Next.js 16.1 App Router, TypeScript, PostgreSQL, and TypeORM.

**Live:** https://kalash-heritage.vercel.app

## Tech Stack

- **Framework:** Next.js 16.1 (App Router with Turbopack)
- **Language:** TypeScript with decorators (`experimentalDecorators: true`)
- **Styling:** Tailwind CSS v3.4.1 (v4 incompatible with Next.js 16.1)
- **Database:** PostgreSQL with TypeORM (`synchronize: true` in dev)
- **State:** Zustand with persist middleware
- **Path Aliases:** `@/*` maps to `src/*`

## Commands

```bash
npm run dev          # Development server (user runs manually)
npm run build        # Production build - run only when necessary
npm run lint         # ESLint check
npm run seed         # Seed database with sample data
```

## Critical Architecture Patterns

### 1. TypeORM Circular Dependency Resolution (CRITICAL)

**Problem:** Bidirectional entity relations cause circular dependencies. String-based relations fail in production due to Next.js name mangling.

**Solution:** Type-only imports + lazy require() pattern:

```typescript
// ❌ WRONG - Direct import causes circular dependency
import { Product } from "./Product";
@ManyToOne(() => Product, (product) => product.category)

// ❌ WRONG - Fails in production (name mangling)
@ManyToOne("Product", (product) => product.category)

// ✅ CORRECT - Type import + lazy require
import type { Product } from "./Product";
@ManyToOne(() => require("./Product").Product, (product: Product) => product.category)
```

**ALL entities follow this pattern.** See `src/entities/Product.ts:89` for reference.

### 2. Database Connection Pattern

Database connection lazy-loads and skips during build (`src/lib/db.ts`):

```typescript
export async function getDatabase() {
  // Skip DB connection during Next.js build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }
  // Lazy load reflect-metadata, TypeORM, and entities...
}
```

### 3. Next.js 16 Dynamic Routes

All dynamic routes use async params:

```typescript
export default async function Page({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
}
```

### 4. Zustand State Management

Client-side stores in `src/store/`:
- `cartStore.ts` - Shopping cart, persists to `kalash-cart-storage`
- `currencyStore.ts` - Multi-currency selection (USD, EUR, GBP, PKR, AED, SAR)
- `checkoutStore.ts` - Checkout flow state (shipping, step)

### 5. Authentication (NextAuth)

NextAuth with Credentials provider in `src/lib/auth.ts`:
- Login page: `/login`
- Admin routes protected by middleware (`src/middleware.ts`)
- Admin user: `admin@kalashheritage.com` / `admin123`

## Database

**Entities:** User, Product, Category, Cart, CartItem, Order, OrderItem, ShippingAddress

**Local setup:**
```bash
createdb kalash_heritage
npm run seed
```

**Vercel:** Use Neon PostgreSQL with Custom Prefix "DATABASE" (not "STORAGE").

**Seed script:** Uses `ts-node` with `tsconfig-paths` for `@/*` alias resolution.

## API Routes

```
/api/products              GET (list with filters), POST
/api/products/[slug]       GET, PUT, DELETE
/api/categories            GET
/api/auth/[...nextauth]    NextAuth handlers
/api/checkout/create-order POST (create order)
/api/payoneer/create-session POST (payment session)
/api/payoneer/webhook      POST (payment callbacks)
/api/admin/*               Admin CRUD routes (protected)
```

## Admin Dashboard

Located at `/admin` (protected, requires admin role):
- Dashboard with stats
- Products CRUD: `/admin/products`
- Categories CRUD: `/admin/categories`
- Orders management: `/admin/orders`
- Users management: `/admin/users`

## Checkout Flow

Multi-step checkout at `/checkout`:
1. Shipping form (guest or logged in)
2. Order review
3. Payoneer hosted payment page

Guest checkout supported with optional account creation.

## Payment Gateway

Stripe NOT available in Pakistan. Using **Payoneer Checkout API** (hosted payment page).

Payment abstraction in `src/services/payment/PaymentService.ts` supports:
- **Payoneer** (recommended for Pakistan) - `PayoneerGateway.ts`
- PayPal, Safepay, Stripe (stubs)

Payoneer env vars:
```env
PAYONEER_MERCHANT_CODE=xxx
PAYONEER_API_TOKEN=xxx
PAYONEER_DIVISION=xxx
PAYONEER_API_URL=https://api.sandbox.oscato.com/api
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| Tailwind CSS plugin error | Use v3.4.1, not v4 |
| TypeORM circular dependency | Use `type` imports + lazy `require()` |
| Params type error | Use `Promise<{ param: string }>` |
| "Entity metadata not found" | Check relations use lazy require() |
| Database connection failed | Verify DATABASE_URL prefix is "DATABASE" |

## User Workflow Preferences

- User runs dev server manually - don't run `npm run dev`
- Run build only when necessary to check for errors
- Don't create markdown files unless explicitly requested
- Keep metadata simple - avoid extensive Open Graph tags

## Design System

- **Colors:** Earth tones (browns, beiges) with red accents
- **Typography:** Playfair Display (headings), Inter (body)
- **Style:** Modern, minimal, classy, premium
