# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kalash Heritage is a premium e-commerce platform for a carpet manufacturer in Pakistan. Built with Next.js 16.1 App Router, TypeScript, PostgreSQL, and TypeORM.

**Live:** https://kalash-heritage.vercel.app
**Target Domain:** kalashheritage.com (pending DNS)

## Tech Stack

- **Framework:** Next.js 16.1 (App Router with Turbopack)
- **Language:** TypeScript with decorators (`experimentalDecorators: true`)
- **Styling:** Tailwind CSS v3.4.1 (v4 incompatible with Next.js 16.1)
- **Database:** PostgreSQL with TypeORM (`synchronize: true`)
- **State:** Zustand with persist middleware
- **Animations:** Framer Motion
- **Path Aliases:** `@/*` maps to `src/*`

## Common Commands

```bash
npm run dev          # Development server (user runs manually)
npm run build        # Production build - run only when necessary
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

**ALL entities follow this pattern:** User, Product, Category, Order, OrderItem, Cart, CartItem, ShippingAddress

### 2. Database Connection Pattern

Database connection is lazy-loaded and skips during build (`src/lib/db.ts`):

```typescript
export async function getDatabase() {
  // Skip DB connection during Next.js build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }

  // Lazy load reflect-metadata and TypeORM
  await import("reflect-metadata");
  const { DataSource } = await import("typeorm");

  // Lazy load entities to avoid circular deps during build
  const { User } = await import("@/entities/User");
  // ... other entities

  // Initialize DataSource
}
```

**Why:** Prevents TypeORM initialization issues during Next.js build phase.

### 3. Next.js 16 Dynamic Routes

All dynamic routes use async params (Next.js 16 requirement):

```typescript
// ✅ CORRECT
export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  // ...
}
```

### 4. State Management with Zustand

Client-side state uses Zustand with localStorage persistence:

- `cartStore.ts`: Shopping cart state (items, quantities, totals)
- `currencyStore.ts`: Multi-currency selection

Cart store persists to `localStorage` as `kalash-cart-storage`.

## Database Architecture

### Entities (`src/entities/`)

- **User**: Authentication, profile, orders, cart, shipping addresses
- **Product**: Catalog items (name, slug, SKU, price, specs, images)
- **Category**: Product categorization (Oriental, Modern, Vintage, etc.)
- **Cart/CartItem**: Shopping cart (guest & authenticated)
- **Order/OrderItem**: Order management
- **ShippingAddress**: User delivery addresses

### Schema Sync

TypeORM auto-syncs with `synchronize: true`. No manual migrations needed in development.

**Production:** Set `synchronize: false` and use migrations.

### Database Setup

**Local:**
```bash
createdb kalash_heritage
# Set DATABASE_URL in .env
npm run seed
```

**Production (Vercel):**
1. Create Neon PostgreSQL in Vercel Storage
2. Set Custom Prefix to "DATABASE" (NOT "STORAGE")
3. Seed with production DATABASE_URL

**Seed script:** Uses `ts-node` with `tsconfig-paths` for `@/*` alias resolution.

## API Routes Pattern

RESTful API routes in `src/app/api/`:

```
/api/products          GET (list with filters), POST (create)
/api/products/[slug]   GET (single), PUT (update), DELETE
/api/categories        GET (all categories)
/api/seed             POST (seed database)
```

## Key Features

**Implemented:**
- Product catalog with filtering (category, price, size, color, style)
- Product detail pages with image gallery
- Shopping cart with Zustand state
- Multi-currency support (USD, EUR, GBP, PKR, AED, SAR)
- Region-based shipping calculations
- Collections/categories page
- About & Contact pages
- SEO metadata

**Pending:**
- Checkout & payment integration (Stripe unavailable in Pakistan)
- NextAuth authentication
- Admin panel
- Email notifications

## Payment Gateway

**Important:** Stripe NOT available in Pakistan.

Payment abstraction in `src/lib/paymentGateway.ts` supports:
- PayPal
- Safepay (Pakistani processor)
- Manual bank transfer (B2B)

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## Deployment (Vercel)

- Auto-deploys from `main` branch
- Database: Neon PostgreSQL (set prefix to "DATABASE")
- Seed production DB locally with production DATABASE_URL

## Troubleshooting

**Build Errors:**
1. **Tailwind CSS plugin error** → Downgrade to v3.4.1
2. **TypeORM circular dependency** → Check entities use type imports + lazy require()
3. **Params type error** → Ensure dynamic routes use `Promise<{ param: string }>`

**Production Issues:**
1. **"Entity metadata not found"** → Check TypeORM relations use lazy require(), NOT string-based
2. **Database connection failed** → Verify DATABASE_URL prefix is "DATABASE" in Vercel
3. **API routes timeout** → Check DB connection isn't blocked

## User Workflow Preferences

- User runs dev server manually in separate terminal - don't run `npm run dev`
- Run build command only when necessary to check for errors
- Don't create markdown documentation files unless explicitly requested
- Keep metadata simple - avoid extensive Open Graph tags
- Review changes after implementation

## Design System

- **Colors:** Earth tones (browns, beiges) with red accents
- **Typography:** Playfair Display (headings), Inter (body)
- **Style:** Modern, minimal, classy, premium
- **Inspiration:** abchome.com, abbascarpets.com, ahmedorientalcarpets.com
