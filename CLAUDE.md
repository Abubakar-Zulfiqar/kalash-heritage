# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kalash Heritage is a B2B wholesale showcase platform for a carpet manufacturer in Pakistan. Built with Next.js 16.1 App Router, TypeScript, PostgreSQL, and TypeORM.

**Business Model:** Wholesale/exhibition showcase - customers browse products and submit inquiries (no online checkout/payment). Pricing provided via email within 24-48 hours.

**Live:** https://kalash-heritage.vercel.app

## Tech Stack

- **Framework:** Next.js 16.1 (App Router with Turbopack)
- **Language:** TypeScript with decorators (`experimentalDecorators: true`)
- **Styling:** Tailwind CSS v3.4.1 (v4 incompatible with Next.js 16.1)
- **Database:** PostgreSQL with TypeORM (`synchronize: true`)
- **State:** Zustand with persist middleware
- **Image Storage:** Vercel Blob
- **Email:** Nodemailer for inquiry notifications
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
// WRONG - Direct import causes circular dependency
import { Product } from "./Product";
@ManyToOne(() => Product, (product) => product.size)

// WRONG - Fails in production (name mangling)
@ManyToOne("Product", (product) => product.size)

// CORRECT - Type import + lazy require
import type { Size } from "./Size";
@ManyToOne(() => require("./Size").Size, (size: Size) => size.products)
```

**ALL entities follow this pattern.** See `src/entities/Product.ts:88` for reference.

### 2. Raw SQL for Complex Queries

Many API routes use raw SQL instead of TypeORM QueryBuilder to avoid cyclic entity import issues:

```typescript
const result = await db.query(`
  SELECT p.*, s.name as "sizeName"
  FROM products p
  LEFT JOIN sizes s ON p."sizeId" = s.id
  WHERE p.slug = $1 AND p."deletedAt" IS NULL
`, [slug]);
```

PostgreSQL arrays returned as `{item1,item2}` format require parsing - see `parsePostgresArray()` helper in API routes.

### 3. Database Connection Pattern

Database connection lazy-loads and skips during build (`src/lib/db.ts`):

```typescript
export async function getDatabase() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection skipped during build');
  }
  // Lazy load reflect-metadata, TypeORM, and entities...
}
```

### 4. Next.js 16 Dynamic Routes

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

API routes must declare `export const dynamic = 'force-dynamic';` to prevent build-time DB access.

### 5. Entity Hierarchy

Flexible hierarchy supporting two patterns:

```
Pattern A (hasCategories: true):
Collection → Category → Size → Product

Pattern B (hasCategories: false):
Collection → Size → Product (skips Category)
```

The `Collection.hasCategories` boolean determines which pattern applies.

## Database

**Entities:** User, Product, Collection, Category, Size, Cart, CartItem, Order, OrderItem, ShippingAddress

**Key relationships:**
- Collection has many Categories OR Sizes (based on `hasCategories`)
- Category belongs to Collection, has many Sizes
- Size belongs to Category OR Collection, has many Products
- Product belongs to Size, has soft delete (`deletedAt`)

**Local setup:**
```bash
createdb kalash_heritage
npm run seed
```

**Vercel:** Use Neon PostgreSQL with Custom Prefix "DATABASE" (not "STORAGE").

## Zustand State Management

Client-side stores in `src/store/`:

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `inquiryStore.ts` | Product inquiry list (main) | `kalash-inquiry-storage` |
| `cartStore.ts` | Legacy shopping cart | `kalash-cart-storage` |
| `currencyStore.ts` | Currency selection | `kalash-currency-storage` |
| `checkoutStore.ts` | Checkout flow state | None (session) |

**Note:** The app now uses `inquiryStore` for B2B workflow. `cartStore` is legacy code.

## API Routes

```
# Public
/api/products                  GET (list with filters)
/api/products/[slug]           GET (single product)
/api/categories                GET
/api/collections               GET (all with relations)
/api/collections/[slug]        GET (collection with categories/sizes)
/api/collections/[slug]/[categorySlug]  GET (category within collection)
/api/auth/[...nextauth]        NextAuth handlers
/api/inquiry                   POST (wholesale inquiry, sends email)
/api/upload                    POST (Vercel Blob), DELETE

# Admin (protected - requires admin role)
/api/admin/products            GET, POST
/api/admin/products/[id]       PUT, DELETE (soft delete)
/api/admin/collections         GET, POST
/api/admin/collections/[id]    GET, PUT, DELETE
/api/admin/categories          GET, POST
/api/admin/categories/[id]     GET, PUT, DELETE
/api/admin/sizes               GET, POST
/api/admin/sizes/[id]          GET, PUT, DELETE
/api/admin/orders/[id]         GET, PUT
/api/admin/users/[id]          GET, PUT

# Dev only
/api/seed                      GET
```

## Authentication (NextAuth)

NextAuth with Credentials provider in `src/lib/auth.ts`:
- Login page: `/login`
- Admin routes protected via `getServerSession()` check
- Admin user: `admin@kalashheritage.com` / `admin123`

```typescript
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## Customer Flow (B2B Wholesale)

1. Browse collections at `/collections`
2. Navigate: Collection → Category (optional) → Size → Products
3. View products at `/shop` or `/shop/[slug]`
4. Add to inquiry list (stored in `inquiryStore`)
5. Review list at `/cart` (shows as "Inquiry List")
6. Submit inquiry at `/checkout` (contact form, not payment)
7. Receive confirmation + optional WhatsApp link

**No prices shown on product pages** - wholesale pricing provided via email response.

## Admin Dashboard

Located at `/admin` (protected):
- Dashboard with stats: `/admin`
- Collections CRUD: `/admin/collections`
- Categories CRUD: `/admin/categories`
- Sizes CRUD: `/admin/sizes`
- Products CRUD: `/admin/products`
- Orders: `/admin/orders`
- Users: `/admin/users`

## Services

### Payment (`src/services/payment/`)
- `PaymentService.ts` - Gateway abstraction (Stripe, PayPal, Safepay, Payoneer)
- `PayoneerGateway.ts` - Implemented for Pakistan
- **Currently unused** - site is inquiry-based, not checkout-based

### Shipping (`src/services/shipping/ShippingService.ts`)
- Region-based rate calculation
- Supports: Pakistan, Middle East, Europe, North America

### Currency (`src/services/currency/CurrencyService.ts`)
- Multi-currency support: USD, EUR, GBP, PKR, AED, SAR
- Static exchange rates (API integration TODO)

## Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Email notifications (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
ADMIN_EMAIL=admin@kalashheritage.com

# WhatsApp (optional)
WHATSAPP_NUMBER=+971505787476

# Payment (not currently used)
PAYONEER_MERCHANT_CODE=xxx
PAYONEER_API_TOKEN=xxx
PAYONEER_DIVISION=xxx
PAYONEER_API_URL=https://api.sandbox.oscato.com/api
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| Tailwind CSS plugin error | Use v3.4.1, not v4 |
| TypeORM circular dependency | Use `type` imports + lazy `require()` |
| Params type error | Use `Promise<{ param: string }>` |
| "Entity metadata not found" | Check relations use lazy require() |
| Database connection failed | Verify DATABASE_URL prefix is "DATABASE" |
| PostgreSQL array parsing | Use `parsePostgresArray()` helper |
| Build fails with DB error | Add `export const dynamic = 'force-dynamic'` |

## User Workflow Preferences

- User runs dev server manually - don't run `npm run dev`
- Run build only when necessary to check for errors
- Don't create markdown files unless explicitly requested
- Keep metadata simple - avoid extensive Open Graph tags

## Design System

- **Colors:** Earth tones (browns, beiges) with red accents (`primary-600` = #8B4513)
- **Typography:** Playfair Display (headings), Inter (body)
- **Style:** Modern, minimal, classy, premium
